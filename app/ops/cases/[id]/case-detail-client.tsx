"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ApprovalState, AuditEvent, TripCase } from "../../../lib/ops";
import { approvalStateLabels, getApprovalTransitionGuardReason, stateLabels } from "../../../lib/ops";

type CaseDetailClientProps = {
  caseId: string;
  seedCases: TripCase[];
};

export function CaseDetailClient({ caseId, seedCases }: CaseDetailClientProps) {
  const [storedCase, setStoredCase] = useState<TripCase | null>(null);
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCase() {
      const response = await fetch(`/api/cases/${caseId}`, { cache: "no-store" });
      if (!response.ok) {
        return;
      }

      const payload = (await response.json()) as { case?: TripCase; events?: AuditEvent[] };
      if (!cancelled && payload.case) {
        setStoredCase(payload.case);
        setEvents(payload.events ?? []);
      }
    }

    void loadCase();

    return () => {
      cancelled = true;
    };
  }, [caseId]);

  const tripCase = useMemo(() => {
    return storedCase ?? seedCases.find((item) => item.id === caseId);
  }, [caseId, seedCases, storedCase]);

  function appendInternalNote(currentNotes: string, nextNote: string) {
    const trimmedCurrent = currentNotes.trim();
    const trimmedNext = nextNote.trim();

    if (!trimmedCurrent) {
      return trimmedNext;
    }

    if (trimmedCurrent.endsWith(trimmedNext)) {
      return trimmedCurrent;
    }

    return `${trimmedCurrent} ${trimmedNext}`;
  }

  async function refreshEvents() {
    const eventResponse = await fetch(`/api/cases/${caseId}`, { cache: "no-store" });
    if (!eventResponse.ok) {
      return;
    }

    const eventPayload = (await eventResponse.json()) as { case?: TripCase; events?: AuditEvent[] };
    if (eventPayload.case) {
      setStoredCase(eventPayload.case);
    }
    setEvents(eventPayload.events ?? []);
  }

  async function updateCaseAction(
    nextApprovalState: ApprovalState,
    note: string,
    blockedReason?: string
  ) {
    if (!tripCase) {
      return;
    }

    if (tripCase.isRedactedPublicView) {
      return;
    }

    if (tripCase.approvalState === nextApprovalState) {
      return;
    }

    setIsUpdating(true);
    setActionFeedback(null);
    const response = await fetch(`/api/cases/${caseId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        approvalState: nextApprovalState,
        internalNotes: appendInternalNote(tripCase.internalNotes, note),
        approvalBlockedReason: blockedReason ?? null
      })
    });

    const payload = (await response.json()) as {
      case?: TripCase;
      requestId?: string;
      message?: string;
    };
    if (!response.ok) {
      setActionFeedback(payload.message ?? "Transition was rejected by the approval guard.");
      await refreshEvents();
      setIsUpdating(false);
      return;
    }

    if (payload.case) {
      setStoredCase(payload.case);
    }
    await refreshEvents();
    setIsUpdating(false);
  }

  const approvalActions = tripCase
    ? [
        {
          label: "Mark options prepared",
          target: "options_prepared" as const,
          variant: "primaryButton",
          note: "Operator marked the case as options_prepared."
        },
        {
          label: "Request approval",
          target: "approval_requested" as const,
          variant: "secondaryButton",
          note: "Operator formally requested approval for the current option set."
        },
        {
          label: "Block approval",
          target: "approval_blocked" as const,
          variant: "secondaryButton",
          note: "Approval path was blocked pending more information or resolution.",
          blockedReason: "Approval is blocked until the operator resolves missing approval inputs."
        },
        {
          label: "Return to review",
          target: "returned_to_review" as const,
          variant: "secondaryButton",
          note: "Approver returned the case to review for revised options or evidence."
        },
        {
          label: "Record approval granted",
          target: "approval_granted" as const,
          variant: "secondaryButton",
          note: "Explicit approval was recorded for this case."
        },
        {
          label: "Unlock ready for handoff",
          target: "ready_for_handoff" as const,
          variant: "secondaryButton",
          note: "Case is now allowed to move into the guarded coordination handoff."
        }
      ].filter((action) => {
        if (action.target === "ready_for_handoff") {
          return (
            tripCase.approvalState === "approval_granted" ||
            tripCase.approvalState === "ready_for_handoff"
          );
        }
        return true;
      })
    : [];

  if (!tripCase) {
    return (
      <section className="section opsSection">
        <article className="detailCard">
          <span className="eyebrow">Case not found</span>
          <h2>This case is not available yet.</h2>
          <p>
            If you just created it from intake, return to the queue after the browser stores the new
            workflow case.
          </p>
          <Link className="primaryButton" href="/ops/cases">
            Back to queue
          </Link>
        </article>
      </section>
    );
  }

  return (
    <section className="section caseDetailGrid">
      <article className="detailCard emphasisCard statusCard">
        <div className="statusHeader">
          <span className="eyebrow">Approval state</span>
          <h2 className="statusState">{approvalStateLabels[tripCase.approvalState]}</h2>
          <p className="statusAction">{tripCase.nextAction}</p>
        </div>
        {tripCase.isRedactedPublicView ? (
          <p className="helperText protectedNotice">
            This case came from a real intake path, so the public demo surface only shows a redacted
            operator placeholder.
          </p>
        ) : null}
        <div className="statusMetaGrid">
          <div className="statusMetaItem">
            <span className="statusMetaLabel">Owner</span>
            <strong className="statusMetaValue">{tripCase.owner}</strong>
          </div>
          <div className="statusMetaItem">
            <span className="statusMetaLabel">Priority</span>
            <strong className="statusMetaValue">{tripCase.priority}</strong>
          </div>
          <div className="statusMetaItem">
            <span className="statusMetaLabel">Approver</span>
            <strong className="statusMetaValue">{tripCase.approver}</strong>
          </div>
          <div className="statusMetaItem">
            <span className="statusMetaLabel">Workflow state</span>
            <strong className="statusMetaValue">{stateLabels[tripCase.state]}</strong>
          </div>
        </div>
      </article>

      <article className="detailCard">
        <span className="eyebrow">Original request</span>
        <dl className="detailList">
          <div><dt>Company</dt><dd>{tripCase.company} · {tripCase.officeName}</dd></div>
          <div><dt>Requester</dt><dd>{tripCase.requester}</dd></div>
          <div><dt>Traveler</dt><dd>{tripCase.traveler}</dd></div>
          <div><dt>Purpose</dt><dd>{tripCase.tripPurpose}</dd></div>
          <div><dt>Timing</dt><dd>{tripCase.timing}</dd></div>
          <div><dt>Approval context</dt><dd>{tripCase.approvalContext}</dd></div>
        </dl>
      </article>

      <article className="detailCard">
        <span className="eyebrow">Constraints</span>
        <ul className="bulletList tightList">
          {tripCase.constraints.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </article>

      <article className="detailCard">
        <span className="eyebrow">Approval checkpoint</span>
        <dl className="detailList">
          <div><dt>Approval state</dt><dd>{approvalStateLabels[tripCase.approvalState]}</dd></div>
          <div><dt>approvalRequestedAt</dt><dd>{tripCase.approvalRequestedAt ?? "Not requested yet"}</dd></div>
          <div><dt>approvalGrantedAt</dt><dd>{tripCase.approvalGrantedAt ?? "Not granted yet"}</dd></div>
          <div><dt>Blocked reason</dt><dd>{tripCase.approvalBlockedReason ?? "No current block"}</dd></div>
        </dl>
      </article>

      <article className="detailCard">
        <span className="eyebrow">Decision-ready output stub</span>
        <dl className="detailList">
          <div><dt>trip_case_id</dt><dd>{tripCase.tripCaseId}</dd></div>
          <div><dt>Recommendation</dt><dd>{tripCase.recommendationHeadline}</dd></div>
          <div><dt>Option set</dt><dd>{tripCase.optionSetSummary}</dd></div>
          <div><dt>Source</dt><dd>{tripCase.sourceEvidence}</dd></div>
          <div><dt>fetched_at</dt><dd>{tripCase.fetchedAt}</dd></div>
          <div><dt>Policy / disclosure</dt><dd>{tripCase.policyNotes}</dd></div>
          <div><dt>Approval ask</dt><dd>{tripCase.approvalPrompt}</dd></div>
          <div><dt>Internal notes</dt><dd>{tripCase.internalNotes}</dd></div>
        </dl>
      </article>

      <article className="detailCard">
        <span className="eyebrow">Audit event log</span>
        <h3>Guarded coordination backbone</h3>
        <p className="helperText">
          Minimal server-side event chain for replaying who changed what state, under which request id.
        </p>
        <dl className="detailList">
          {events.map((event) => (
            <div key={event.eventId}>
              <dt>
                {event.action} · {event.createdAt}
              </dt>
              <dd>
                request_id: {event.requestId}
                <br />
                actor: {event.actorType} · source: {event.source}
                <br />
                state: {event.beforeState} -&gt; {event.afterState}
                <br />
                {event.summary}
              </dd>
            </div>
          ))}
        </dl>
      </article>

      <article className="detailCard">
        <span className="eyebrow">Approval-state actions</span>
        <h3>Move the case through the guarded approval checkpoint.</h3>
        {tripCase.isRedactedPublicView ? (
          <p className="helperText">
            Approval-state controls stay interactive on mock operator demo cases only. Real intake
            cases are redacted on public routes and continue inside a protected workflow.
          </p>
        ) : (
          <>
            <p className="helperText">
              The system now enforces allowed approval-state transitions. If a transition is not
              allowed, the action stays blocked and the guard records why.
            </p>
            {actionFeedback ? <p className="guardFeedback">{actionFeedback}</p> : null}
            <div className="approvalActions">
              {approvalActions.map((action) => {
                const disabledReason = getApprovalTransitionGuardReason(
                  tripCase.approvalState,
                  action.target
                );

                return (
                  <div key={action.target} className="approvalActionCard">
                    <button
                      className={action.variant}
                      type="button"
                      disabled={isUpdating || Boolean(disabledReason)}
                      onClick={() =>
                        updateCaseAction(action.target, action.note, action.blockedReason)
                      }
                    >
                      {action.label}
                    </button>
                    <p className="actionHint">
                      {disabledReason
                        ? `Blocked: ${disabledReason}`
                        : `Allowed: move case to ${approvalStateLabels[action.target]}.`}
                    </p>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </article>
    </section>
  );
}
