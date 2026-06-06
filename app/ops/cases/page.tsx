import { mockCases } from "../../lib/ops";
import { PageShell } from "../../ui";
import { CasesQueueClient } from "./queue-client";

export default function CasesPage() {
  return (
    <PageShell>
      <section className="section pageLead opsLead compactLead">
        <div className="sectionIntro wideIntro">
          <p className="eyebrow">Phase 2 operator workflow</p>
          <h1 className="pageTitle">Operator queue for Founder Office and Executive Assistant travel.</h1>
          <p className="lede">
            This is the first internal workflow surface for Yozu Phase 2. It turns incoming travel
            requests into cases the operator can triage, shape into options, and hold behind an
            approval checkpoint.
          </p>
        </div>
      </section>

      <section className="section opsSection">
        <div className="opsSummaryGrid">
          <article className="summaryCard">
            <span className="eyebrow">Queue scope</span>
            <h3>Current workflow surface</h3>
            <p>
              Mock-data queue for early operator workflow only. No booking, payment, or supplier
              execution is triggered from this surface.
            </p>
          </article>
          <article className="summaryCard">
            <span className="eyebrow">Primary jobs</span>
            <h3>Triage, frame options, wait for approval</h3>
            <p>
              Operators triage requests, prepare decision-ready options, and hold coordination until
              explicit approval.
            </p>
          </article>
          <article className="summaryCard">
            <span className="eyebrow">Phase 2 boundary</span>
            <h3>Manual ops before platform automation</h3>
            <p>
              This queue exists to prove case handling, not to imply automatic booking, inventory
              sync, or payment capture.
            </p>
          </article>
        </div>

        <div className="useCaseGrid">
          <article className="useCaseCard">
            <span className="eyebrow">Use case 01</span>
            <h3>Founder Office investor trip</h3>
            <p>
              Multi-city founder travel where timing, flexibility, and meeting windows matter more
              than price alone.
            </p>
            <span className="useCaseMeta">Founders, partner meetings, high-value timing</span>
          </article>
          <article className="useCaseCard">
            <span className="eyebrow">Use case 02</span>
            <h3>EA board-meeting coordination</h3>
            <p>
              Executive Assistant flow for turning a request into approval-ready options before any
              real-world next step.
            </p>
            <span className="useCaseMeta">EA workflow, approvals, policy-aware travel</span>
          </article>
          <article className="useCaseCard">
            <span className="eyebrow">Use case 03</span>
            <h3>Leadership offsite planning</h3>
            <p>
              Group-travel coordination for leadership teams where lodging, arrivals, and budget
              alignment have to stay visible.
            </p>
            <span className="useCaseMeta">Ops triage, group travel, finance context</span>
          </article>
        </div>

        <CasesQueueClient seedCases={mockCases} />
      </section>
    </PageShell>
  );
}
