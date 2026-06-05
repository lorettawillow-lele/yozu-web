import { BRAND } from "../lib/brand";
import { PageShell } from "../ui";

export default function ContactPage() {
  return (
    <PageShell>
      <section className="section pageLead">
        <div className="sectionIntro wideIntro">
          <p className="eyebrow">Human follow-up</p>
          <h1 className="pageTitle">Use Yozu when the trip is important enough that mistakes are expensive.</h1>
          <p className="lede">
            The launch MVP ends with a real contact path. If you want a walkthrough or a follow-up on
            a trip request, email Yozu directly and expect a human response.
          </p>
        </div>
      </section>

      <section className="section contactSection">
        <article className="contactCard emphasisCard">
          <span className="eyebrow">Primary channel</span>
          <h2>{BRAND.supportEmail}</h2>
          <p>
            Best for trip requests, demo follow-up, and early access conversations. This mailbox is
            live and tested.
          </p>
          <a className="primaryButton" href={`mailto:${BRAND.supportEmail}`}>
            Email Yozu
          </a>
        </article>

        <article className="contactCard">
          <span className="eyebrow">What happens next</span>
          <ul className="bulletList tightList">
            <li>Yozu reviews your request and constraints.</li>
            <li>You get decision-ready options and disclosure context.</li>
            <li>Any real-world next step stays approval-gated.</li>
          </ul>
          <p className="helperText">
            Launch boundary: no automatic booking, no payment capture, no final completion state on
            the site.
          </p>
        </article>
      </section>
    </PageShell>
  );
}
