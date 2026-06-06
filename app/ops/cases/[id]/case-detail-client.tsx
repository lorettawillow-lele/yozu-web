"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { TripCase } from "../../../lib/ops";
import { stateLabels } from "../../../lib/ops";
import { readStoredCases } from "../../../lib/ops-storage";

type CaseDetailClientProps = {
  caseId: string;
  seedCases: TripCase[];
};

export function CaseDetailClient({ caseId, seedCases }: CaseDetailClientProps) {
  const [storedCases, setStoredCases] = useState<TripCase[]>([]);

  useEffect(() => {
    setStoredCases(readStoredCases());
  }, []);

  const tripCase = useMemo(() => {
    return [...storedCases, ...seedCases].find((item) => item.id === caseId);
  }, [caseId, seedCases, storedCases]);

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
          <div><dt>Option set</dt><dd>{tripCase.optionSetSummary}</dd></div>
          <div><dt>Source</dt><dd>{tripCase.sourceEvidence}</dd></div>
          <div><dt>fetched_at</dt><dd>{tripCase.fetchedAt}</dd></div>
          <div><dt>Policy / disclosure</dt><dd>{tripCase.policyNotes}</dd></div>
          <div><dt>Internal notes</dt><dd>{tripCase.internalNotes}</dd></div>
        </dl>
      </article>
    </section>
  );
}
