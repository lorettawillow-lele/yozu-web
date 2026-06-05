"use client";

import { useMemo, useState } from "react";
import { BRAND } from "../lib/brand";

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
    "Yozu trip request",
    "",
    `Destination: ${form.destination || "Not provided"}`,
    `Dates: ${form.dates || "Not provided"}`,
    `Travelers: ${form.travelers || "Not provided"}`,
    `Budget: ${form.budget || "Not provided"}`,
    `Trip stakes: ${form.stakes || "Not provided"}`,
    `Constraints / preferences: ${form.constraints || "Not provided"}`,
    `Reply contact: ${form.contact || "Not provided"}`,
    "",
    "Expected next step:",
    "Please send back decision-ready options, source/disclosure context, and the next coordination step."
  ].join("\n");
}

export function IntakeForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [submitted, setSubmitted] = useState(false);

  const mailtoHref = useMemo(() => {
    const subject = encodeURIComponent(`Yozu trip request: ${form.destination || "new itinerary"}`);
    const body = encodeURIComponent(buildBody(form));
    return `mailto:${BRAND.supportEmail}?subject=${subject}&body=${body}`;
  }, [form]);

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
          <a
            className="primaryButton"
            href={mailtoHref}
            onClick={() => setSubmitted(true)}
          >
            Send trip request
          </a>
          <a className="secondaryButton" href={`mailto:${BRAND.supportEmail}`}>
            Email directly instead
          </a>
        </div>
        <p className="helperText">
          This opens your mail client with a prefilled request to {BRAND.supportEmail}. If your mail
          client does not open, copy the details and email them directly.
        </p>
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
