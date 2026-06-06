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

export const mockCases: TripCase[] = [
  {
    id: "YC-2401",
    company: "Willow Ventures",
    officeName: "Founder Office",
    requester: "Annie Li",
    traveler: "Loretta Willow",
    approver: "Founder Office principal",
    tripPurpose: "Multi-city investor trip before partner meetings",
    destination: "San Francisco -> Singapore -> Hong Kong",
    timing: "June 12-18, flexible by +/- 1 day",
    constraints: [
      "No red-eye before Demo Day",
      "Keep investor breakfast windows open",
      "First-night hotel should be refundable"
    ],
    approvalContext:
      "Founder Office narrows options first; checkout coordination still waits for explicit approval.",
    priority: "urgent",
    state: "reviewing",
    owner: "Founder Office queue",
    nextAction: "Draft 2 decision-ready investor-trip options with disclosure notes.",
    optionSetSummary: "Balanced arrival plan vs tighter lower-cost multi-city route",
    sourceEvidence: "Mock supplier references for long-haul flight and refundable hotel options",
    fetchedAt: "2026-06-06 06:45 PT",
    policyNotes: "Fare rules and cancellation notes must be shown before approval.",
    internalNotes: "Primary Founder Office use case for enterprise-facing investor travel.",
    recommendationHeadline: "Recommend the balanced arrival plan to preserve investor windows.",
    approvalPrompt: "Approve shortlist A/B before any flight or hotel coordination step."
  },
  {
    id: "YC-2402",
    company: "Northstar Capital",
    officeName: "Executive Assistant desk",
    requester: "Mina Park",
    traveler: "Daniel Reyes",
    approver: "Chief of Staff",
    tripPurpose: "Board meeting travel with post-meeting client dinner",
    destination: "New York + Boston",
    timing: "June 20-23",
    constraints: [
      "One checked bag",
      "Avoid last-flight-of-day risk",
      "Hotel must support late arrival"
    ],
    approvalContext:
      "EA reviews first, then forwards the selected shortlist for executive approval.",
    priority: "high",
    state: "awaiting_approval",
    owner: "EA workflow queue",
    nextAction: "Hold coordination until the EA confirms option A or B with the approver.",
    optionSetSummary: "Executive-convenience route vs lower-cost split-city tradeoff",
    sourceEvidence: "Mock references for rail, flight, and hotel alternatives",
    fetchedAt: "2026-06-06 06:40 PT",
    policyNotes: "Approval needed before any change from policy baseline.",
    internalNotes: "Primary Executive Assistant use case with approval gating.",
    recommendationHeadline: "Recommend option A if arrival reliability matters more than fare delta.",
    approvalPrompt: "EA confirms preferred option, then approver signs off before coordination."
  },
  {
    id: "YC-2403",
    company: "Aster Labs",
    officeName: "Office of the COO",
    requester: "Sara Lin",
    traveler: "Leadership team (6)",
    approver: "Chief of Staff + finance lead",
    tripPurpose: "Leadership offsite with candidate and partner sessions",
    destination: "Austin",
    timing: "July 8-11",
    constraints: [
      "Need walkable hotel near meeting venue",
      "Keep arrivals before team dinner window",
      "Stay inside shared lodging and air budget"
    ],
    approvalContext:
      "Operations aligns on room block and travel window before the final approval checkpoint.",
    priority: "normal",
    state: "new",
    owner: "Ops triage",
    nextAction: "Assign operator and normalize the offsite request fields.",
    optionSetSummary: "Pending first pass for group travel options",
    sourceEvidence: "Mock evidence not attached yet",
    fetchedAt: "Not fetched yet",
    policyNotes: "Preflight only after options exist.",
    internalNotes: "Leadership offsite use case; useful for group-travel workflow design.",
    recommendationHeadline: "Build first-pass group travel options before room-block coordination.",
    approvalPrompt: "Need ops review before approval path and budget checkpoint are finalized."
  }
];

export const stateLabels: Record<CaseState, string> = {
  new: "New",
  reviewing: "Reviewing",
  options_sent: "Options sent",
  awaiting_approval: "Awaiting approval",
  coordinating: "Coordinating",
  closed: "Closed"
};

export function getCaseById(id: string) {
  return mockCases.find((item) => item.id === id);
}

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
