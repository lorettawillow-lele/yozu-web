import { notFound } from "next/navigation";
import { getCaseById, mockCases, stateLabels } from "../../../lib/ops";
import { PageShell } from "../../../ui";

export function generateStaticParams() {
  return mockCases.map((item) => ({ id: item.id }));
}

export default async function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tripCase = getCaseById(id);

  if (!tripCase) {
    notFound();
  }

  return (
    <PageShell>
      <section className="section pageLead opsLead">
        <div className="sectionIntro wideIntro">
          <p className="eyebrow">Case detail</p>
          <h1 className="pageTitle">
            {tripCase.id}: {tripCase.traveler} · {tripCase.destination}
          </h1>
          <p className="lede">
            Internal operator view for handling a structured trip case. Mock data for workflow design
            only; no supplier execution or payment action occurs here.
          </p>
        </div>
      </section>

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
    </PageShell>
  );
}
