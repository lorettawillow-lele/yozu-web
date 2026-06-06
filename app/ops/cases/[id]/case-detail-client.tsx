"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { TripCase } from "../../../lib/ops";
import { stateLabels } from "../../../lib/ops";

type CaseDetailClientProps = {
  caseId: string;
  seedCases: TripCase[];
};

export function CaseDetailClient({ caseId, seedCases }: CaseDetailClientProps) {
  const [storedCase, setStoredCase] = useState<TripCase | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadCase() {
      const response = await fetch(`/api/cases/${caseId}`, { cache: "no-store" });
      if (!response.ok) {
        return;
      }

      const payload = (await response.json()) as { case?: TripCase };
      if (!cancelled && payload.case) {
        setStoredCase(payload.case);
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

  async function updateCaseAction(nextState: TripCase["state"], nextAction: string, note: string) {
    if (!tripCase) {
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
        internalNotes: `${tripCase.internalNotes} ${note}`.trim()
      })
    });

    const payload = (await response.json()) as { case?: TripCase };
    if (payload.case) {
      setStoredCase(payload.case);
    }
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
      <article className="detailCard emphasisCard">
        <span className="eyebrow">Current state</span>
        <h2>{stateLabels[tripCase.state]}</h2>
        <p>{tripCase.nextAction}</p>
        <div className="detailMetaStack">
          <span>Owner: {tripCase.owner}</span>
          <span>Priority: {tripCase.priority}</span>
          <span>Approver: {tripCase.approver}</span>
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
        <span className="eyebrow">Approval-state actions</span>
        <h3>Move the case through the next operator checkpoint.</h3>
        <p className="helperText">
          These actions are still mock workflow controls, but they now update the same case record
          the queue/detail reads.
        </p>
        <div className="approvalActions">
          <button
            className="primaryButton"
            type="button"
            disabled={isUpdating}
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
            disabled={isUpdating}
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
            disabled={isUpdating}
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
            disabled={isUpdating}
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
      </article>
    </section>
  );
}
