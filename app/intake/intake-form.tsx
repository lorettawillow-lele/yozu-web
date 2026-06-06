"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { BRAND } from "../lib/brand";
import { buildTripCaseFromIntake } from "../lib/ops";
import { upsertStoredCase } from "../lib/ops-storage";

type FormState = {
  destination: string;
  dates: string;
  travelers: string;
  budget: string;
  stakes: string;
  constraints: string;
  contact: string;
};

const initialState: FormState = {
  destination: "",
  dates: "",
  travelers: "",
  budget: "",
  stakes: "",
  constraints: "",
  contact: ""
};

function buildBody(form: FormState) {
  return [
    "Hello Yozu team,",
    "",
    "Please review this travel request.",
    "",
    "Trip summary",
    `- Destination: ${form.destination || "Not provided"}`,
    `- Dates / flexibility: ${form.dates || "Not provided"}`,
    `- Travelers: ${form.travelers || "Not provided"}`,
    `- Budget range: ${form.budget || "Not provided"}`,
    "",
    "Trip stakes",
    form.stakes || "Not provided",
    "",
    "Constraints / preferences",
    form.constraints || "Not provided",
    "",
    "Reply contact",
    form.contact || "Not provided",
    "",
    "Requested next step",
    "- decision-ready options",
    "- source / disclosure context",
    "- recommended coordination path",
    "",
    "Thank you."
  ].join("\n");
}

export function IntakeForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialState);
  const [submitted, setSubmitted] = useState(false);
  const [createdCaseId, setCreatedCaseId] = useState("");

  const mailtoHref = useMemo(() => {
    const subject = encodeURIComponent(`Yozu trip request | ${form.destination || "new itinerary"}`);
    const body = encodeURIComponent(buildBody(form));
    return `mailto:${BRAND.supportEmail}?subject=${subject}&body=${body}`;
  }, [form]);

  function handleCreateCase() {
    const tripCase = buildTripCaseFromIntake(form);
    upsertStoredCase(tripCase);
    setCreatedCaseId(tripCase.id);
    router.push(`/ops/cases/${tripCase.id}`);
  }

  return (
    <div className="intakeLayout">
      <form className="intakeForm">
        <label>
          Destination
          <input
            value={form.destination}
            onChange={(event) => setForm({ ...form, destination: event.target.value })}
            placeholder="Singapore Demo Day + 2 days client meetings"
          />
        </label>
        <label>
          Dates / flexibility
          <input
            value={form.dates}
            onChange={(event) => setForm({ ...form, dates: event.target.value })}
            placeholder="June 12-16, flexible by +/- 1 day"
          />
        </label>
        <label>
          Travelers
          <input
            value={form.travelers}
            onChange={(event) => setForm({ ...form, travelers: event.target.value })}
            placeholder="Solo founder"
          />
        </label>
        <label>
          Budget range
          <input
            value={form.budget}
            onChange={(event) => setForm({ ...form, budget: event.target.value })}
            placeholder="Keep flights + hotel under $4,500"
          />
        </label>
        <label>
          Trip stakes
          <textarea
            value={form.stakes}
            onChange={(event) => setForm({ ...form, stakes: event.target.value })}
            placeholder="Need to arrive rested for demo, preserve investor follow-up windows, avoid risky layovers."
          />
        </label>
        <label>
          Constraints / preferences
          <textarea
            value={form.constraints}
            onChange={(event) => setForm({ ...form, constraints: event.target.value })}
            placeholder="No red-eye before demo day, prefer airport hotel on arrival night, need refundable options if possible."
          />
        </label>
        <label>
          Reply email or phone
          <input
            value={form.contact}
            onChange={(event) => setForm({ ...form, contact: event.target.value })}
            placeholder="name@example.com"
          />
        </label>

        <div className="formActions">
          <button className="primaryButton" type="button" onClick={handleCreateCase}>
            Create workflow case
          </button>
          <a className="secondaryButton" href={mailtoHref} onClick={() => setSubmitted(true)}>
            Send trip request by email
          </a>
          <a className="secondaryButton" href={`mailto:${BRAND.supportEmail}`}>
            Email directly instead
          </a>
        </div>
        <p className="helperText">
          Primary path: create a workflow case and send it into the operator queue. Email remains a
          fallback path to {BRAND.supportEmail} if you want a direct human handoff.
        </p>
        {createdCaseId ? (
          <p className="statusNote">
            Workflow case created: {createdCaseId}. Redirecting to the operator case detail view.
          </p>
        ) : null}
        {submitted ? (
          <p className="statusNote">
            Next step: send the email draft, then Yozu follows up with decision-ready options and the
            coordination path.
          </p>
        ) : null}
      </form>
    </div>
  );
}
