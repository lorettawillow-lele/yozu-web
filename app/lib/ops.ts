export type CaseState =
  | "new"
  | "reviewing"
  | "options_sent"
  | "awaiting_approval"
  | "coordinating"
  | "closed";

export type Priority = "urgent" | "high" | "normal";

export type TripCase = {
  id: string;
  company: string;
  officeName: string;
  requester: string;
  traveler: string;
  approver: string;
  tripPurpose: string;
  destination: string;
  timing: string;
  constraints: string[];
  approvalContext: string;
  priority: Priority;
  state: CaseState;
  owner: string;
  nextAction: string;
  optionSetSummary: string;
  sourceEvidence: string;
  fetchedAt: string;
  policyNotes: string;
  internalNotes: string;
  recommendationHeadline: string;
  approvalPrompt: string;
};

export type TripCaseIntakeInput = {
  destination: string;
  dates: string;
  travelers: string;
  budget: string;
  stakes: string;
  constraints: string;
  contact: string;
};

export const stateLabels: Record<CaseState, string> = {
  new: "New",
  reviewing: "Reviewing",
  options_sent: "Options sent",
  awaiting_approval: "Awaiting approval",
  coordinating: "Coordinating",
  closed: "Closed"
};

export function buildTripCaseFromIntake(input: TripCaseIntakeInput): TripCase {
  const stamp = Date.now().toString().slice(-6);

  return {
    id: `OPS-${stamp}`,
    company: "External intake",
    officeName: "Executive Assistant / Founder Office intake",
    requester: input.contact || "Reply contact pending",
    traveler: input.travelers || "Traveler not specified",
    approver: "Approval owner to be assigned",
    tripPurpose: input.stakes || "Trip purpose to be clarified",
    destination: input.destination || "Destination pending",
    timing: input.dates || "Dates pending",
    constraints: [
      input.constraints || "Constraints pending",
      input.budget ? `Budget context: ${input.budget}` : "Budget context pending"
    ],
    approvalContext: "Awaiting operator review before any approval checkpoint is defined.",
    priority: "high",
    state: "new",
    owner: "Ops triage",
    nextAction: "Review intake and convert it into a decision-ready workflow case.",
    optionSetSummary: "Pending operator first pass",
    sourceEvidence: "No external evidence attached yet",
    fetchedAt: "Not fetched yet",
    policyNotes: "No booking or payment action should occur from intake alone.",
    internalNotes: [
      "Created from B-side intake.",
      input.contact ? `Reply contact: ${input.contact}` : "Reply contact missing."
    ].join(" "),
    recommendationHeadline: "Operator recommendation pending first pass.",
    approvalPrompt: "Review intake, prepare options, then define approval ask."
  };
}
