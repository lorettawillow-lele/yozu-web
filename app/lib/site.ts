export const coreFlow = [
  {
    label: "Intent",
    title: "Capture the trip outcome, not just dates",
    body: "Yozu starts with timing, budget, people, constraints, and what would make the trip successful."
  },
  {
    label: "Decision-ready",
    title: "Compress choices into 2-3 useful options",
    body: "The traveler gets clear tradeoffs instead of another wall of search results."
  },
  {
    label: "Source + disclosure",
    title: "Show supplier context before any next step",
    body: "Each option is framed with provenance, freshness expectations, and policy/disclosure context."
  },
  {
    label: "Approval",
    title: "Nothing advances without explicit approval",
    body: "Yozu coordinates the next step only after the traveler confirms the intended option."
  },
  {
    label: "Preflight",
    title: "Re-check before checkout coordination",
    body: "Price, inventory, timing, and policy changes trigger a fresh review before any booking coordination step."
  }
] as const;

export const launchModules = [
  "Public landing on www.yozu.me",
  "Trip intake with a real handoff path",
  "Demoable coordination flow with mock/sandbox data",
  "Human follow-up via live email"
] as const;

export const trustChecks = [
  "Source-backed options and timestamps",
  "Visible disclosure and approval steps",
  "No automatic booking or payment capture",
  "Preflight checks before checkout coordination",
  "Human follow-up for real requests"
] as const;

export const intakeFields = [
  "Destination and dates",
  "Budget range and trip stakes",
  "Travelers and non-negotiables",
  "Preferences, pace, and success criteria"
] as const;
