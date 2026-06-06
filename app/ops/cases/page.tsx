import Link from "next/link";
import { mockCases, stateLabels } from "../../lib/ops";
import { PageShell } from "../../ui";

export default function CasesPage() {
  return (
    <PageShell>
      <section className="section pageLead opsLead">
        <div className="sectionIntro wideIntro">
          <p className="eyebrow">Phase 2 operator workflow</p>
          <h1 className="pageTitle">Case queue for EA and Founder Office requests.</h1>
          <p className="lede">
            This is the first internal workflow surface for Yozu Phase 2. It turns incoming trip
            requests into operator-visible cases instead of leaving them trapped in an inbox.
          </p>
        </div>
      </section>

      <section className="section opsSection">
        <div className="opsSummaryGrid">
          <article className="summaryCard">
            <span className="eyebrow">Queue scope</span>
            <h3>Current mock workflow</h3>
            <p>
              Mock-data queue for early operator workflow only. No booking, payment, or supplier
              execution is triggered from this surface.
            </p>
          </article>
          <article className="summaryCard">
            <span className="eyebrow">Expected action</span>
            <h3>Review, prepare options, wait for approval</h3>
            <p>
              Operators triage requests, prepare decision-ready options, and hold coordination until
              explicit approval.
            </p>
          </article>
        </div>

        <div className="tableShell">
          <div className="tableHeader tableRow">
            <span>Case</span>
            <span>Traveler</span>
            <span>State</span>
            <span>Owner</span>
            <span>Priority</span>
            <span>Next action</span>
          </div>
          {mockCases.map((item) => (
            <Link className="tableRow tableLink" key={item.id} href={`/ops/cases/${item.id}`}>
              <span>
                <strong>{item.id}</strong>
                <small>{item.company}</small>
              </span>
              <span>
                <strong>{item.traveler}</strong>
                <small>{item.destination}</small>
              </span>
              <span>
                <strong>{stateLabels[item.state]}</strong>
                <small>{item.tripPurpose}</small>
              </span>
              <span>{item.owner}</span>
              <span className={`priority priority-${item.priority}`}>{item.priority}</span>
              <span>{item.nextAction}</span>
            </Link>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
