import { NextResponse } from "next/server";
import { getStoredCase, listAuditEvents, saveAuditEvent, saveCase } from "../../../lib/case-store";
import {
  canTransitionApprovalState,
  getApprovalTransitionGuardReason,
  getAuditActionForApprovalState,
  getCurrentDisclosureState,
  getDefaultNextActionForPreflightStatus,
  getDefaultPreflightSummary,
  getDisclosureStatement,
  getCaseById,
  getDefaultNextActionForApprovalState,
  getHandoffGuardReason,
  getPreflightAuditAction,
  getPreflightGuardReason,
  getWorkflowStateFromApprovalState,
  sanitizeCaseForPublicOps,
  type AuditEvent,
  type ApprovalState,
  type PreflightReasonCode,
  type PreflightStatus
} from "../../../lib/ops";

function createRequestId() {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function createEventId() {
  return `evt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const stored = await getStoredCase(id);
  const seed = getCaseById(id);
  const tripCase = stored ?? seed;

  if (!tripCase) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const events = await listAuditEvents(tripCase.tripCaseId);

  return NextResponse.json({
    case: stored && !seed ? sanitizeCaseForPublicOps(tripCase) : tripCase,
    events
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = createRequestId();
  const { id } = await params;
  const stored = await getStoredCase(id);
  const seed = getCaseById(id);
  const tripCase = stored ?? seed;

  if (!tripCase) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  if (stored && !seed) {
    const deniedEvent: AuditEvent = {
      eventId: createEventId(),
      tripCaseId: tripCase.tripCaseId,
      requestId,
      actorType: "public_demo",
      action: "protected_mutation_denied",
      beforeState: tripCase.state,
      afterState: tripCase.state,
      createdAt: new Date().toISOString(),
      source: "public_case_patch",
      summary: "Protected intake case mutation denied on the public demo surface."
    };
    await saveAuditEvent(deniedEvent);
    return NextResponse.json(
      { error: "protected_case", message: "Public demo routes cannot mutate protected intake cases." },
      { status: 403 }
    );
  }

  const patch = (await request.json()) as Partial<typeof tripCase> & {
    approvalState?: ApprovalState;
    preflightStatus?: PreflightStatus;
    preflightReasonCode?: PreflightReasonCode | null;
    preflightSummary?: string | null;
    disclosureMarkShown?: boolean;
    disclosureAcknowledge?: boolean;
  };
  const targetApprovalState = patch.approvalState ?? tripCase.approvalState;
  const targetPreflightStatus = patch.preflightStatus ?? tripCase.preflightStatus;
  const transitionGuardReason = getApprovalTransitionGuardReason(
    tripCase.approvalState,
    targetApprovalState
  );
  const handoffPreflightGuardReason =
    targetApprovalState === "ready_for_handoff"
      ? getHandoffGuardReason(
          tripCase.approvalState,
          tripCase.preflightStatus,
          tripCase.disclosureAcknowledgedAt
        )
      : null;

  if (
    targetApprovalState !== tripCase.approvalState &&
    (!canTransitionApprovalState(tripCase.approvalState, targetApprovalState) ||
      transitionGuardReason ||
      handoffPreflightGuardReason)
  ) {
    const deniedEvent: AuditEvent = {
      eventId: createEventId(),
      tripCaseId: tripCase.tripCaseId,
      requestId,
      actorType: "public_demo",
      action:
        targetApprovalState === "ready_for_handoff" &&
        handoffPreflightGuardReason ===
          "Disclosure must be acknowledged before the final handoff path is allowed."
          ? "handoff_blocked_missing_disclosure_ack"
          : targetApprovalState === "ready_for_handoff" && handoffPreflightGuardReason
          ? "preflight_handoff_denied"
          : targetApprovalState === "ready_for_handoff"
          ? "handoff_guard_denied"
          : "approval_transition_denied",
      beforeState: tripCase.approvalState,
      afterState: targetApprovalState,
      createdAt: new Date().toISOString(),
      source: "public_case_patch_guard",
      summary:
        handoffPreflightGuardReason ??
        transitionGuardReason ??
        `Transition from ${tripCase.approvalState} to ${targetApprovalState} was rejected.`
    };
    await saveAuditEvent(deniedEvent);

    return NextResponse.json(
      {
        error: "transition_denied",
        message:
          handoffPreflightGuardReason ??
          transitionGuardReason ??
          "This approval-state transition is not allowed."
      },
      { status: 400 }
    );
  }

  if (targetPreflightStatus !== tripCase.preflightStatus) {
    const preflightGuardReason = getPreflightGuardReason(tripCase.approvalState);

    if (preflightGuardReason) {
      const deniedEvent: AuditEvent = {
        eventId: createEventId(),
        tripCaseId: tripCase.tripCaseId,
        requestId,
        actorType: "public_demo",
        action: "preflight_guard_denied",
        beforeState: tripCase.preflightStatus ?? "none",
        afterState: targetPreflightStatus ?? "blocked",
        createdAt: new Date().toISOString(),
        source: "public_case_patch_preflight_guard",
        summary: preflightGuardReason
      };
      await saveAuditEvent(deniedEvent);

      return NextResponse.json(
        {
          error: "preflight_denied",
          message: preflightGuardReason
        },
        { status: 400 }
      );
    }
  }

  const nextState = getWorkflowStateFromApprovalState(targetApprovalState);
  const disclosureShownAt =
    patch.disclosureMarkShown && !tripCase.disclosureShownAt
      ? new Date().toISOString()
      : patch.disclosureMarkShown === false
        ? null
        : tripCase.disclosureShownAt;
  const disclosureAcknowledgedAt =
    patch.disclosureAcknowledge && !tripCase.disclosureAcknowledgedAt
      ? new Date().toISOString()
      : patch.disclosureAcknowledge === false
        ? null
        : tripCase.disclosureAcknowledgedAt;
  const nextCase = {
    ...tripCase,
    ...patch,
    state:
      targetPreflightStatus === "blocked" || targetPreflightStatus === "reconfirm_required"
        ? getWorkflowStateFromApprovalState("approval_granted")
        : nextState,
    approvalState: targetApprovalState,
    nextAction:
      patch.nextAction ??
      (targetPreflightStatus && targetPreflightStatus !== tripCase.preflightStatus
        ? getDefaultNextActionForPreflightStatus(
            targetPreflightStatus,
            patch.preflightReasonCode ?? null
          )
        : getDefaultNextActionForApprovalState(targetApprovalState)),
    approvalRequestedAt:
      targetApprovalState === "approval_requested"
        ? tripCase.approvalRequestedAt ?? new Date().toISOString()
        : patch.approvalRequestedAt ?? tripCase.approvalRequestedAt,
    approvalGrantedAt:
      targetApprovalState === "approval_granted"
        ? patch.approvalGrantedAt ?? new Date().toISOString()
        : targetApprovalState === "ready_for_handoff"
          ? patch.approvalGrantedAt ?? tripCase.approvalGrantedAt
          : patch.approvalGrantedAt ?? null,
    approvalBlockedReason:
      targetApprovalState === "approval_blocked"
        ? patch.approvalBlockedReason ?? "Approval path blocked until operator resolves the issue."
        : patch.approvalBlockedReason ?? null,
    preflightStatus: targetPreflightStatus,
    preflightReasonCode: patch.preflightReasonCode ?? null,
    preflightSummary:
      targetPreflightStatus && targetPreflightStatus !== tripCase.preflightStatus
        ? patch.preflightSummary ??
          getDefaultPreflightSummary(targetPreflightStatus, patch.preflightReasonCode ?? null)
        : patch.preflightSummary ?? tripCase.preflightSummary,
    preflightCheckedAt:
      targetPreflightStatus && targetPreflightStatus !== tripCase.preflightStatus
        ? new Date().toISOString()
        : patch.preflightCheckedAt ?? tripCase.preflightCheckedAt,
    disclosureShownAt,
    disclosureAcknowledgedAt,
    policyNotes: getDisclosureStatement(tripCase.disclosureMode)
  };

  if (
    (targetPreflightStatus === "blocked" || targetPreflightStatus === "reconfirm_required") &&
    nextCase.approvalState === "ready_for_handoff"
  ) {
    nextCase.approvalState = "approval_granted";
  }

  await saveCase(nextCase);
  const auditEvents: AuditEvent[] = [];

  if (patch.disclosureMarkShown && !tripCase.disclosureShownAt && nextCase.disclosureShownAt) {
    auditEvents.push({
      eventId: createEventId(),
      tripCaseId: nextCase.tripCaseId,
      requestId,
      actorType: "public_demo",
      action: "disclosure_shown",
      beforeState: "not_shown",
      afterState: "shown",
      createdAt: new Date().toISOString(),
      source: "public_case_patch_disclosure",
      summary: `Disclosure was shown for ${nextCase.disclosureMode} content. Current state: ${getCurrentDisclosureState(nextCase)}.`
    });
  }

  if (
    patch.disclosureAcknowledge &&
    !tripCase.disclosureAcknowledgedAt &&
    nextCase.disclosureAcknowledgedAt
  ) {
    auditEvents.push({
      eventId: createEventId(),
      tripCaseId: nextCase.tripCaseId,
      requestId,
      actorType: "public_demo",
      action: "disclosure_acknowledged",
      beforeState: tripCase.disclosureShownAt ? "shown" : "not_shown",
      afterState: "acknowledged",
      createdAt: new Date().toISOString(),
      source: "public_case_patch_disclosure",
      summary: `Disclosure was acknowledged for ${nextCase.disclosureMode} content before handoff.`
    });
  }

  const auditEvent: AuditEvent =
    targetPreflightStatus && targetPreflightStatus !== tripCase.preflightStatus
      ? {
          eventId: createEventId(),
          tripCaseId: nextCase.tripCaseId,
          requestId,
          actorType: "public_demo",
          action: getPreflightAuditAction(targetPreflightStatus),
          beforeState: tripCase.preflightStatus ?? "none",
          afterState: targetPreflightStatus,
          createdAt: new Date().toISOString(),
          source: "public_case_patch_preflight",
          summary:
            patch.preflightSummary ??
            getDefaultPreflightSummary(targetPreflightStatus, patch.preflightReasonCode ?? null)
        }
      : {
          eventId: createEventId(),
          tripCaseId: nextCase.tripCaseId,
          requestId,
          actorType: "public_demo",
          action: getAuditActionForApprovalState(targetApprovalState),
          beforeState: tripCase.approvalState,
          afterState: targetApprovalState,
          createdAt: new Date().toISOString(),
          source: "public_case_patch",
          summary: `Approval state moved from ${tripCase.approvalState} to ${targetApprovalState} on the public demo workflow.`
        };
  if (
    targetPreflightStatus !== tripCase.preflightStatus ||
    targetApprovalState !== tripCase.approvalState
  ) {
    auditEvents.push(auditEvent);
  }

  for (const event of auditEvents) {
    await saveAuditEvent(event);
  }

  return NextResponse.json({ case: nextCase, requestId });
}
