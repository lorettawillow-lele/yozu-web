"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ApprovalState, AuditEvent, PreflightReasonCode, PreflightStatus, TripCase } from "../../../lib/ops";
import {
  approvalStateLabels,
  disclosureModeLabels,
  getCurrentDisclosureState,
  getDisclosureStatement,
  getApprovalTransitionGuardReason,
  getHandoffGuardReason,
  getPreflightGuardReason,
  preflightReasonLabels,
  preflightStatusLabels,
  stateLabels
} from "../../../lib/ops";

type CaseDetailClientProps = {
  caseId: string;
  seedCases: TripCase[];
};

export function CaseDetailClient({ caseId, seedCases }: CaseDetailClientProps) {
  const [storedCase, setStoredCase] = useState<TripCase | null>(null);
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const disclosureShownRef = useRef(false);

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

  useEffect(() => {
    if (!tripCase || tripCase.isRedactedPublicView || tripCase.disclosureShownAt || disclosureShownRef.current) {
      return;
    }

    disclosureShownRef.current = true;

    void (async () => {
      const response = await fetch(`/api/cases/${caseId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          disclosureMarkShown: true
        })
      });

      if (!response.ok) {
        disclosureShownRef.current = false;
        return;
      }

      const payload = (await response.json()) as { case?: TripCase };
      if (payload.case) {
        setStoredCase(payload.case);
      }
      await refreshEvents();
    })();
  }, [caseId, tripCase]);

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

  async function updatePreflightAction(
    nextPreflightStatus: PreflightStatus,
    reasonCode: PreflightReasonCode | null,
    note: string,
    summary?: string
  ) {
    if (!tripCase || tripCase.isRedactedPublicView) {
      return;
    }

    if (
      tripCase.preflightStatus === nextPreflightStatus &&
      tripCase.preflightReasonCode === reasonCode
    ) {
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
        preflightStatus: nextPreflightStatus,
        preflightReasonCode: reasonCode,
        preflightSummary: summary ?? null,
        internalNotes: appendInternalNote(tripCase.internalNotes, note)
      })
    });

    const payload = (await response.json()) as {
      case?: TripCase;
      requestId?: string;
      message?: string;
    };
    if (!response.ok) {
      setActionFeedback(payload.message ?? "Preflight update was rejected by the guard.");
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

  async function acknowledgeDisclosure() {
    if (!tripCase || tripCase.isRedactedPublicView || tripCase.disclosureAcknowledgedAt) {
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
        disclosureAcknowledge: true
      })
    });

    const payload = (await response.json()) as {
      case?: TripCase;
      message?: string;
    };
    if (!response.ok) {
      setActionFeedback(payload.message ?? "Disclosure acknowledgement was rejected.");
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

  const preflightActions = tripCase
    ? [
        {
          label: "Mark preflight pass",
          target: "pass" as const,
          reasonCode: null,
          note: "Operator marked preflight as pass."
        },
        {
          label: "Mark preflight warn",
          target: "warn" as const,
          reasonCode: "price_inventory_stale_risk" as const,
          note: "Operator marked preflight as warn due to stale-risk review."
        },
        {
          label: "Block preflight",
          target: "blocked" as const,
          reasonCode: "policy_evidence_missing" as const,
          note: "Operator blocked preflight pending missing policy or evidence."
        },
        {
          label: "Require reconfirmation",
          target: "reconfirm_required" as const,
          reasonCode: "source_freshness_stale" as const,
          note: "Operator required reconfirmation because source freshness is stale."
        }
      ]
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
      <article className="detailCard detailCardWide emphasisCard statusCard">
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

      <article className="detailCard detailCardCompact">
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

      <article className="detailCard detailCardCompact">
        <span className="eyebrow">Constraints</span>
        <ul className="bulletList tightList">
          {tripCase.constraints.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </article>

      <article className="detailCard detailCardCompact">
        <span className="eyebrow">Approval checkpoint</span>
        <dl className="detailList">
          <div><dt>Approval state</dt><dd>{approvalStateLabels[tripCase.approvalState]}</dd></div>
          <div><dt>approvalRequestedAt</dt><dd>{tripCase.approvalRequestedAt ?? "Not requested yet"}</dd></div>
          <div><dt>approvalGrantedAt</dt><dd>{tripCase.approvalGrantedAt ?? "Not granted yet"}</dd></div>
          <div><dt>Blocked reason</dt><dd>{tripCase.approvalBlockedReason ?? "No current block"}</dd></div>
        </dl>
      </article>

      <article className="detailCard detailCardCompact">
        <span className="eyebrow">Preflight status</span>
        <h3>{tripCase.preflightStatus ? preflightStatusLabels[tripCase.preflightStatus] : "Not run yet"}</h3>
        <p className="helperText">
          {tripCase.preflightSummary ??
            "Preflight has not run yet. Handoff stays blocked until the case is fresh, complete, and approval-safe."}
        </p>
        <dl className="detailList">
          <div>
            <dt>Reason code</dt>
            <dd>
              {tripCase.preflightReasonCode
                ? preflightReasonLabels[tripCase.preflightReasonCode]
                : "No current preflight reason"}
            </dd>
          </div>
          <div><dt>Checked at</dt><dd>{tripCase.preflightCheckedAt ?? "Not checked yet"}</dd></div>
          <div>
            <dt>Can handoff proceed?</dt>
            <dd>
              {getHandoffGuardReason(
                tripCase.approvalState,
                tripCase.preflightStatus,
                tripCase.disclosureAcknowledgedAt
              )
                ? getHandoffGuardReason(
                    tripCase.approvalState,
                    tripCase.preflightStatus,
                    tripCase.disclosureAcknowledgedAt
                  )
                : "Yes. The current approval and preflight status allow handoff."}
            </dd>
          </div>
        </dl>
      </article>

      <article className="detailCard detailCardWide">
        <span className="eyebrow">Disclosure and evidence</span>
        <h3>Make the trust boundary visible before any final handoff.</h3>
        <p className="helperText">{getDisclosureStatement(tripCase.disclosureMode)}</p>
        <dl className="detailList">
          <div>
            <dt>Source</dt>
            <dd>
              {disclosureModeLabels[tripCase.disclosureMode]}
              <br />
              {tripCase.sourceSummary}
            </dd>
          </div>
          <div>
            <dt>Fetched at</dt>
            <dd>
              {tripCase.fetchedAt}
              <br />
              {tripCase.freshnessSummary}
            </dd>
          </div>
          <div>
            <dt>Current state</dt>
            <dd>{getCurrentDisclosureState(tripCase)}</dd>
          </div>
          <div>
            <dt>Disclosure</dt>
            <dd>{getDisclosureStatement(tripCase.disclosureMode)}</dd>
          </div>
          <div>
            <dt>Disclosure shown</dt>
            <dd>{tripCase.disclosureShownAt ?? "Not shown yet"}</dd>
          </div>
          <div>
            <dt>Disclosure acknowledged</dt>
            <dd>{tripCase.disclosureAcknowledgedAt ?? "Not acknowledged yet"}</dd>
          </div>
        </dl>
      </article>

      <article className="detailCard detailCardCompact">
        <span className="eyebrow">Disclosure acknowledgement</span>
        <h3>Confirm the limits before final handoff.</h3>
        {tripCase.isRedactedPublicView ? (
          <p className="helperText">
            Protected intake cases keep disclosure status visible, but public acknowledgement and handoff controls stay disabled.
          </p>
        ) : (
          <>
            <p className="helperText">
              This acknowledgement makes it explicit that the case may still contain mock, demo, or operator-assembled content and still needs reconfirmation before real execution.
            </p>
            <div className="approvalActions">
              <div className="approvalActionCard">
                <button
                  className={tripCase.disclosureAcknowledgedAt ? "secondaryButton" : "primaryButton"}
                  type="button"
                  disabled={isUpdating || Boolean(tripCase.disclosureAcknowledgedAt)}
                  onClick={() => acknowledgeDisclosure()}
                >
                  {tripCase.disclosureAcknowledgedAt ? "Disclosure acknowledged" : "Acknowledge disclosure"}
                </button>
                <p className="actionHint">
                  {tripCase.disclosureAcknowledgedAt
                    ? `Recorded at ${tripCase.disclosureAcknowledgedAt}.`
                    : "Required before the final handoff path can be unlocked."}
                </p>
              </div>
            </div>
          </>
        )}
      </article>

      <article className="detailCard detailCardWide">
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

      <article className="detailCard detailCardWide">
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

      <article className="detailCard detailCardCompact">
        <span className="eyebrow">Preflight actions</span>
        <h3>Run the validator and interrupt layer before handoff.</h3>
        {tripCase.isRedactedPublicView ? (
          <p className="helperText">
            Preflight controls stay interactive on mock operator demo cases only. Real intake cases
            remain protected on public routes.
          </p>
        ) : (
          <>
            <p className="helperText">
              Preflight only runs after explicit approval. `blocked` and `reconfirm required` stop
              handoff until the case is revalidated.
            </p>
            <div className="approvalActions">
              {preflightActions.map((action) => {
                const disabledReason = getPreflightGuardReason(tripCase.approvalState);
                return (
                  <div key={action.target} className="approvalActionCard">
                    <button
                      className={action.target === "pass" ? "primaryButton" : "secondaryButton"}
                      type="button"
                      disabled={isUpdating || Boolean(disabledReason)}
                      onClick={() =>
                        updatePreflightAction(
                          action.target,
                          action.reasonCode,
                          action.note
                        )
                      }
                    >
                      {action.label}
                    </button>
                    <p className="actionHint">
                      {disabledReason
                        ? `Blocked: ${disabledReason}`
                        : `Allowed: set preflight to ${preflightStatusLabels[action.target]}.`}
                    </p>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </article>

      <article className="detailCard detailCardCompact">
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
                const disabledReason =
                  action.target === "ready_for_handoff"
                    ? getHandoffGuardReason(
                        tripCase.approvalState,
                        tripCase.preflightStatus,
                        tripCase.disclosureAcknowledgedAt
                      )
                    : getApprovalTransitionGuardReason(tripCase.approvalState, action.target);

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
