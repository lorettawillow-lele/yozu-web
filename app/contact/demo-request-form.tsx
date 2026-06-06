"use client";

import { useMemo, useState } from "react";
import { BRAND } from "../lib/brand";

type DemoRequestState = {
  company: string;
  role: string;
  team: string;
  workflow: string;
  tripProfile: string;
  contact: string;
};

const initialState: DemoRequestState = {
  company: "",
  role: "",
  team: "",
  workflow: "",
  tripProfile: "",
  contact: ""
};

function buildBody(form: DemoRequestState) {
  return [
    "Hello Yozu team,",
    "",
    "I would like to request a demo.",
    "",
    "Company / team",
    `- Company: ${form.company || "Not provided"}`,
    `- Role: ${form.role || "Not provided"}`,
    `- Team / office: ${form.team || "Not provided"}`,
    "",
    "Current workflow",
    form.workflow || "Not provided",
    "",
    "Travel profile",
    form.tripProfile || "Not provided",
    "",
    "Reply contact",
    form.contact || "Not provided",
    "",
    "Requested next step",
    "- Yozu product demo",
    "- fit for Founder Office / Executive Assistant workflow",
    "- recommended next step",
    "",
    "Thank you."
  ].join("\n");
}

export function DemoRequestForm() {
  const [form, setForm] = useState<DemoRequestState>(initialState);
  const [submitted, setSubmitted] = useState(false);

  const mailtoHref = useMemo(() => {
    const subject = encodeURIComponent(`Yozu demo request | ${form.company || "new team"}`);
    const body = encodeURIComponent(buildBody(form));
    return `mailto:${BRAND.supportEmail}?subject=${subject}&body=${body}`;
  }, [form]);

  return (
    <div className="contactFormShell">
      <form className="intakeForm contactForm">
        <label>
          Company
          <input
            value={form.company}
            onChange={(event) => setForm({ ...form, company: event.target.value })}
            placeholder="Northstar Capital"
          />
        </label>
        <label>
          Role
          <input
            value={form.role}
            onChange={(event) => setForm({ ...form, role: event.target.value })}
            placeholder="Executive Assistant / Founder Office"
          />
        </label>
        <label>
          Team / office
          <input
            value={form.team}
            onChange={(event) => setForm({ ...form, team: event.target.value })}
            placeholder="CEO office, Founder Office, travel coordinator"
          />
        </label>
        <label>
          Current workflow pain
          <textarea
            value={form.workflow}
            onChange={(event) => setForm({ ...form, workflow: event.target.value })}
            placeholder="We coordinate founder travel across investor meetings and approvals through email, spreadsheets, and manual handoffs."
          />
        </label>
        <label>
          Travel profile
          <textarea
            value={form.tripProfile}
            onChange={(event) => setForm({ ...form, tripProfile: event.target.value })}
            placeholder="High-value founder travel, board meetings, leadership offsites, timing-sensitive multi-city trips."
          />
        </label>
        <label>
          Reply email
          <input
            value={form.contact}
            onChange={(event) => setForm({ ...form, contact: event.target.value })}
            placeholder="name@company.com"
          />
        </label>

        <div className="formActions">
          <a className="primaryButton" href={mailtoHref} onClick={() => setSubmitted(true)}>
            Request a demo
          </a>
          <a className="secondaryButton" href={`mailto:${BRAND.supportEmail}`}>
            Email Yozu directly
          </a>
        </div>
        <p className="helperText">
          This opens your mail client with a prefilled demo request to {BRAND.supportEmail}. If your
          mail client does not open, email the team directly.
        </p>
        {submitted ? (
          <p className="statusNote">
            Next step: send the email draft, then Yozu follows up with a demo and a suggested
            workflow fit.
          </p>
        ) : null}
      </form>
    </div>
  );
}
