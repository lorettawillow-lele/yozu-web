import { mockCases } from "../../../lib/ops";
import { PageShell } from "../../../ui";
import { CaseDetailClient } from "./case-detail-client";

export default async function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <PageShell>
      <section className="section pageLead opsLead compactLead">
        <div className="sectionIntro wideIntro">
          <p className="eyebrow">Case detail</p>
          <h1 className="pageTitle">
            {id}: operator case view
          </h1>
          <p className="lede">
            Internal operator view for handling a structured trip case. Mock data for workflow design
            only. The goal here is case clarity, disclosure context, and approval-ready coordination.
          </p>
        </div>
      </section>

      <CaseDetailClient caseId={id} seedCases={mockCases} />
    </PageShell>
  );
}
