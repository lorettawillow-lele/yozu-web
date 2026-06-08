import { NextResponse } from "next/server";
import { getStoredCase, listAuditEvents, saveAuditEvent, saveCase } from "../../../lib/case-store";
import {
  canTransitionApprovalState,
  getApprovalTransitionGuardReason,
  getAuditActionForApprovalState,
  getCaseById,
  getDefaultNextActionForApprovalState,
  getWorkflowStateFromApprovalState,
  sanitizeCaseForPublicOps,
  type AuditEvent,
  type ApprovalState
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
  };
  const targetApprovalState = patch.approvalState ?? tripCase.approvalState;
  const transitionGuardReason = getApprovalTransitionGuardReason(
    tripCase.approvalState,
    targetApprovalState
  );

  if (
    targetApprovalState !== tripCase.approvalState &&
    (!canTransitionApprovalState(tripCase.approvalState, targetApprovalState) || transitionGuardReason)
  ) {
    const deniedEvent: AuditEvent = {
      eventId: createEventId(),
      tripCaseId: tripCase.tripCaseId,
      requestId,
      actorType: "public_demo",
      action:
        targetApprovalState === "ready_for_handoff"
          ? "handoff_guard_denied"
          : "approval_transition_denied",
      beforeState: tripCase.approvalState,
      afterState: targetApprovalState,
      createdAt: new Date().toISOString(),
      source: "public_case_patch_guard",
      summary:
        transitionGuardReason ??
        `Transition from ${tripCase.approvalState} to ${targetApprovalState} was rejected.`
    };
    await saveAuditEvent(deniedEvent);

    return NextResponse.json(
      {
        error: "transition_denied",
        message: transitionGuardReason ?? "This approval-state transition is not allowed."
      },
      { status: 400 }
    );
  }

  const nextState = getWorkflowStateFromApprovalState(targetApprovalState);
  const nextCase = {
    ...tripCase,
    ...patch,
    state: nextState,
    approvalState: targetApprovalState,
    nextAction: patch.nextAction ?? getDefaultNextActionForApprovalState(targetApprovalState),
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
        : patch.approvalBlockedReason ?? null
  };

  await saveCase(nextCase);
  const auditEvent: AuditEvent = {
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
  await saveAuditEvent(auditEvent);

  return NextResponse.json({ case: nextCase, requestId });
}
