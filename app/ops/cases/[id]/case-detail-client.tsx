"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { AuditEvent, TripCase } from "../../../lib/ops";
import { stateLabels } from "../../../lib/ops";

type CaseDetailClientProps = {
  caseId: string;
  seedCases: TripCase[];
};

export function CaseDetailClient({ caseId, seedCases }: CaseDetailClientProps) {
  const [storedCase, setStoredCase] = useState<TripCase | null>(null);
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

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

  async function updateCaseAction(nextState: TripCase["state"], nextAction: string, note: string) {
    if (!tripCase) {
      return;
    }

    if (tripCase.isRedactedPublicView) {
      return;
    }

    if (tripCase.state === nextState && tripCase.nextAction === nextAction) {
      return;
    }

    setIsUpdating(true);
    const response = await fetch(`/api/cases/${caseId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        state: nextState,
        nextAction,
        internalNotes: appendInternalNote(tripCase.internalNotes, note)
      })
    });

    const payload = (await response.json()) as { case?: TripCase; requestId?: string };
    if (payload.case) {
      setStoredCase(payload.case);
    }
    const eventResponse = await fetch(`/api/cases/${caseId}`, { cache: "no-store" });
    const eventPayload = (await eventResponse.json()) as { events?: AuditEvent[] };
    setEvents(eventPayload.events ?? []);
    setIsUpdating(false);
  }

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
          <span className="eyebrow">Current state</span>
          <h2 className="statusState">{stateLabels[tripCase.state]}</h2>
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
        <h3>Move the case through the next operator checkpoint.</h3>
        {tripCase.isRedactedPublicView ? (
          <p className="helperText">
            Approval-state controls stay interactive on mock operator demo cases only. Real intake
            cases are redacted on public routes and continue inside a protected workflow.
          </p>
        ) : (
          <>
            <p className="helperText">
              These actions are still mock workflow controls, but they now update the same case record
              the queue/detail reads.
            </p>
            <div className="approvalActions">
              <button
                className="primaryButton"
                type="button"
                disabled={isUpdating || tripCase.state === "options_sent"}
                onClick={() =>
                  updateCaseAction(
                    "options_sent",
                    "Options sent to requester; waiting for approval response.",
                    "Operator moved case to options_sent."
                  )
                }
              >
                Send options for approval
              </button>
              <button
                className="secondaryButton"
                type="button"
                disabled={isUpdating || tripCase.state === "awaiting_approval"}
                onClick={() =>
                  updateCaseAction(
                    "awaiting_approval",
                    "Approval requested; hold coordination until explicit sign-off.",
                    "Case marked awaiting approval."
                  )
                }
              >
                Mark awaiting approval
              </button>
              <button
                className="secondaryButton"
                type="button"
                disabled={isUpdating || tripCase.state === "coordinating"}
                onClick={() =>
                  updateCaseAction(
                    "coordinating",
                    "Approval received; begin preflight and coordination checklist.",
                    "Case moved into coordinating."
                  )
                }
              >
                Approval received
              </button>
              <button
                className="secondaryButton"
                type="button"
                disabled={isUpdating || tripCase.state === "reviewing"}
                onClick={() =>
                  updateCaseAction(
                    "reviewing",
                    "Needs replanning before any approval ask is sent.",
                    "Case sent back to reviewing."
                  )
                }
              >
                Return to review
              </button>
            </div>
          </>
        )}
      </article>
    </section>
  );
}
