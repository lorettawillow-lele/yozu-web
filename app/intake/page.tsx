import { BRAND } from "../lib/brand";
import { intakeFields } from "../lib/site";
import { PageShell } from "../ui";
import { IntakeForm } from "./intake-form";

export default function IntakePage() {
  return (
    <PageShell>
      <section className="section pageLead">
        <div className="sectionIntro wideIntro">
          <p className="eyebrow">Trip intake</p>
          <h1 className="pageTitle">Submit a real request without pretending the system already booked it.</h1>
          <p className="lede">
            This launch MVP captures your trip intent, constraints, and reply details. Yozu uses that
            request to coordinate the next step and follow up by email.
          </p>
        </div>
      </section>

      <section className="section intakeSection">
        <div className="infoPanel">
          <p className="eyebrow">What to include</p>
          <ul className="bulletList">
            {intakeFields.map((field) => (
              <li key={field}>{field}</li>
            ))}
          </ul>
          <p className="helperText">
            Human follow-up happens via {BRAND.supportEmail}. We use submitted details only to
            respond to this trip request. Do not include passport, payment, or sensitive identity
            data.
          </p>
          <p className="helperText">
            This page captures intent for coordination follow-up only; it does not trigger automatic
            booking or payment.
          </p>
        </div>
        <IntakeForm />
      </section>
    </PageShell>
  );
}
