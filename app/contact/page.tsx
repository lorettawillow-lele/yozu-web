import { BRAND } from "../lib/brand";
import { PageShell } from "../ui";
import { DemoRequestForm } from "./demo-request-form";

export default function ContactPage() {
  return (
    <PageShell>
      <section className="section pageLead compactLead contactLead">
        <div className="sectionIntro wideIntro">
          <p className="eyebrow">Request demo</p>
          <h1 className="pageTitle">Talk to Yozu if you run Founder Office or Executive Assistant travel workflows.</h1>
          <p className="lede">
            This contact path is for teams evaluating Yozu as an operator workflow, not a consumer
            waitlist. Request a demo, explain your workflow, and expect a human response.
          </p>
        </div>
      </section>

      <section className="section contactSection">
        <article className="contactCard emphasisCard">
          <span className="eyebrow">Direct channel</span>
          <p className="contactEmail">{BRAND.supportEmail}</p>
          <p>
            Best for demo requests, workflow-fit questions, and Founder Office / EA conversations.
            This mailbox is live and tested.
          </p>
          <a className="primaryButton" href={`mailto:${BRAND.supportEmail}`}>
            Contact Yozu
          </a>
        </article>

        <article className="contactCard">
          <span className="eyebrow">What happens next</span>
          <ul className="bulletList tightList">
            <li>Yozu reviews your workflow and current coordination pain.</li>
            <li>You get a demo or follow-up aligned to Founder Office / EA needs.</li>
            <li>Any real-world next step stays approval-gated.</li>
          </ul>
          <p className="helperText">
            Phase 2 boundary: contact and demo only. No automatic booking, no payment capture, no
            final completion state on the site.
          </p>
        </article>
      </section>

      <section className="section contactFormSection">
        <div className="sectionIntro">
          <p className="eyebrow">Demo request brief</p>
          <h2>Give Yozu the workflow context, not just a generic lead form.</h2>
          <p className="lede smallLede">
            This request is designed for Executive Assistant, Founder Office, and high-touch travel
            coordination teams.
          </p>
        </div>
        <DemoRequestForm />
      </section>
    </PageShell>
  );
}
