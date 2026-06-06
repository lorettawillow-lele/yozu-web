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
};

export const mockCases: TripCase[] = [
  {
    id: "YC-2401",
    company: "Willow Ventures",
    officeName: "Founder Office",
    requester: "Loretta Willow",
    traveler: "Loretta Willow",
    approver: "Board observer check only",
    tripPurpose: "UCWS Singapore investor + partner meetings",
    destination: "Singapore",
    timing: "June 12-16, flexible by +/- 1 day",
    constraints: [
      "No red-eye before Demo Day",
      "Prefer refundable hotel on first night",
      "Keep investor breakfast windows open"
    ],
    approvalContext: "Founder can approve itinerary direction; final checkout coordination still explicit.",
    priority: "urgent",
    state: "reviewing",
    owner: "Yozu operator",
    nextAction: "Draft 2 decision-ready options and attach disclosure notes.",
    optionSetSummary: "Balanced arrival plan vs lower-cost tighter route",
    sourceEvidence: "Mock supplier references for flight + hotel bundle",
    fetchedAt: "2026-06-06 06:45 PT",
    policyNotes: "Cancellation and fare-rule context must be shown before approval.",
    internalNotes: "Phase 2 mock case. Use founder-office framing, not consumer leisure tone."
  },
  {
    id: "YC-2402",
    company: "Northstar Capital",
    officeName: "Executive Assistant desk",
    requester: "Mina Park",
    traveler: "Daniel Reyes",
    approver: "Chief of Staff",
    tripPurpose: "Board meeting + client dinner sequence",
    destination: "New York + Boston",
    timing: "June 20-23",
    constraints: [
      "One checked bag",
      "Avoid last-flight-of-day risk",
      "Hotel must support late arrival"
    ],
    approvalContext: "Options can be sent to EA first, then forwarded for executive approval.",
    priority: "high",
    state: "awaiting_approval",
    owner: "EA workflow queue",
    nextAction: "Hold coordination until approver selects option A or B.",
    optionSetSummary: "Executive convenience route vs lower-cost split-city tradeoff",
    sourceEvidence: "Mock references for rail + flight + hotel alternatives",
    fetchedAt: "2026-06-06 06:40 PT",
    policyNotes: "Approval needed before any change from policy baseline.",
    internalNotes: "Good sample for multi-city enterprise workflow without payment execution."
  },
  {
    id: "YC-2403",
    company: "Aster Labs",
    officeName: "Founder Office",
    requester: "Ava Chen",
    traveler: "Ava Chen",
    approver: "Self-approval with finance notification",
    tripPurpose: "Founder offsite with candidate meetings",
    destination: "Austin",
    timing: "July 8-10",
    constraints: [
      "Need walkable hotel near meetings",
      "Avoid morning arrival",
      "Budget cap shared with finance"
    ],
    approvalContext: "Finance gets summary after approval checkpoint, not before intake.",
    priority: "normal",
    state: "new",
    owner: "Unassigned",
    nextAction: "Assign operator and normalize request fields.",
    optionSetSummary: "Pending first pass",
    sourceEvidence: "Not yet attached",
    fetchedAt: "Not fetched yet",
    policyNotes: "Preflight only after options exist.",
    internalNotes: "Useful seed case for queue empty-state testing."
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
