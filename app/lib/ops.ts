export type CaseState =
  | "new"
  | "reviewing"
  | "options_sent"
  | "awaiting_approval"
  | "coordinating"
  | "closed";

export type ApprovalState =
  | "draft_review"
  | "options_prepared"
  | "approval_requested"
  | "approval_blocked"
  | "approval_granted"
  | "returned_to_review"
  | "ready_for_handoff";

export type Priority = "urgent" | "high" | "normal";

export type TripCase = {
  id: string;
  tripCaseId: string;
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
  approvalState: ApprovalState;
  approvalRequestedAt: string | null;
  approvalGrantedAt: string | null;
  approvalBlockedReason: string | null;
  owner: string;
  nextAction: string;
  optionSetSummary: string;
  sourceEvidence: string;
  fetchedAt: string;
  policyNotes: string;
  internalNotes: string;
  recommendationHeadline: string;
  approvalPrompt: string;
  isRedactedPublicView?: boolean;
};

export type AuditActorType = "requester" | "operator" | "system" | "public_demo";

export type AuditEvent = {
  eventId: string;
  tripCaseId: string;
  requestId: string;
  actorType: AuditActorType;
  action:
    | "case_created"
    | "options_prepared"
    | "approval_requested"
    | "approval_blocked"
    | "approval_granted"
    | "approval_returned"
    | "ready_for_handoff"
    | "handoff_guard_denied"
    | "approval_transition_denied"
    | "protected_mutation_denied";
  beforeState: CaseState | ApprovalState | "none";
  afterState: CaseState | ApprovalState;
  createdAt: string;
  source: string;
  summary: string;
};

export type TripCaseIntakeInput = {
  company: string;
  approvalOwner: string;
  decisionDeadline: string;
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
    tripCaseId: "YC-2401",
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
    approvalState: "draft_review",
    approvalRequestedAt: null,
    approvalGrantedAt: null,
    approvalBlockedReason: null,
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
    tripCaseId: "YC-2402",
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
    approvalState: "approval_requested",
    approvalRequestedAt: "2026-06-06 06:42 PT",
    approvalGrantedAt: null,
    approvalBlockedReason: null,
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
    tripCaseId: "YC-2403",
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
    approvalState: "draft_review",
    approvalRequestedAt: null,
    approvalGrantedAt: null,
    approvalBlockedReason: null,
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

export const approvalStateLabels: Record<ApprovalState, string> = {
  draft_review: "Draft review",
  options_prepared: "Options prepared",
  approval_requested: "Approval requested",
  approval_blocked: "Approval blocked",
  approval_granted: "Approval granted",
  returned_to_review: "Returned to review",
  ready_for_handoff: "Ready for handoff"
};

const allowedApprovalTransitions: Record<ApprovalState, ApprovalState[]> = {
  draft_review: ["options_prepared"],
  options_prepared: ["approval_requested"],
  approval_requested: ["approval_granted", "approval_blocked", "returned_to_review"],
  approval_blocked: [],
  approval_granted: ["ready_for_handoff"],
  returned_to_review: ["options_prepared"],
  ready_for_handoff: []
};

export function canTransitionApprovalState(from: ApprovalState, to: ApprovalState) {
  return allowedApprovalTransitions[from].includes(to);
}

export function getApprovalTransitionGuardReason(from: ApprovalState, to: ApprovalState) {
  if (from === to) {
    return "Case is already in that approval state.";
  }

  if (to === "ready_for_handoff" && from !== "approval_granted") {
    return "Explicit approval is required before handoff is allowed.";
  }

  if (!canTransitionApprovalState(from, to)) {
    return `Transition from ${approvalStateLabels[from]} to ${approvalStateLabels[to]} is not allowed.`;
  }

  return null;
}

export function getWorkflowStateFromApprovalState(approvalState: ApprovalState): CaseState {
  switch (approvalState) {
    case "draft_review":
      return "reviewing";
    case "options_prepared":
      return "options_sent";
    case "approval_requested":
    case "approval_blocked":
    case "approval_granted":
      return "awaiting_approval";
    case "returned_to_review":
      return "reviewing";
    case "ready_for_handoff":
      return "coordinating";
    default:
      return "reviewing";
  }
}

export function getDefaultNextActionForApprovalState(approvalState: ApprovalState) {
  switch (approvalState) {
    case "draft_review":
      return "Continue internal review before preparing approval-ready options.";
    case "options_prepared":
      return "Decision-ready options are prepared; operator can now request approval.";
    case "approval_requested":
      return "Approval has been requested; wait for explicit approval, block, or return.";
    case "approval_blocked":
      return "Approval is blocked; resolve the blocker before any handoff can continue.";
    case "approval_granted":
      return "Explicit approval received; handoff can be unlocked when the operator is ready.";
    case "returned_to_review":
      return "Case was returned to review; revise options, evidence, or policy framing.";
    case "ready_for_handoff":
      return "Approval is complete; case may move into the guarded coordination handoff.";
    default:
      return "Continue case review.";
  }
}

export function getAuditActionForApprovalState(approvalState: ApprovalState): AuditEvent["action"] {
  switch (approvalState) {
    case "options_prepared":
      return "options_prepared";
    case "approval_requested":
      return "approval_requested";
    case "approval_blocked":
      return "approval_blocked";
    case "approval_granted":
      return "approval_granted";
    case "returned_to_review":
      return "approval_returned";
    case "ready_for_handoff":
      return "ready_for_handoff";
    case "draft_review":
    default:
      return "approval_returned";
  }
}

export function getApprovalStateFromCaseState(state: CaseState): ApprovalState {
  switch (state) {
    case "options_sent":
      return "options_prepared";
    case "awaiting_approval":
      return "approval_requested";
    case "coordinating":
      return "ready_for_handoff";
    case "reviewing":
      return "draft_review";
    case "new":
    case "closed":
    default:
      return "draft_review";
  }
}

export function getCaseById(id: string) {
  return mockCases.find((item) => item.id === id);
}

export function sanitizeCaseForPublicOps(input: TripCase): TripCase {
  return {
    ...input,
    tripCaseId: input.tripCaseId,
    company: "Protected intake account",
    officeName: "Protected intake workflow",
    requester: "Protected requester",
    traveler: "Protected traveler",
    approver: "Protected approval owner",
    tripPurpose: "Protected intake request",
    destination: "Protected destination",
    timing: "Protected timing",
    constraints: ["Sensitive intake details are hidden on the public demo surface."],
    approvalContext:
      "Protected internal approval routing. Public demo view only exposes sanitized intake cases.",
    owner: "Protected ops case",
    nextAction: "Internal operator follow-up continues in the protected workflow surface.",
    approvalRequestedAt: input.approvalRequestedAt,
    approvalGrantedAt: input.approvalGrantedAt,
    approvalBlockedReason: input.approvalBlockedReason,
    optionSetSummary: "Protected intake case; public surface only shows a redacted workflow placeholder.",
    sourceEvidence: "No public evidence is shown for protected intake cases.",
    fetchedAt: "Protected",
    policyNotes: "Public ops demo keeps real intake data redacted.",
    internalNotes: "Protected internal notes are hidden on the public demo surface.",
    recommendationHeadline: "Protected intake case awaiting internal operator handling.",
    approvalPrompt: "No public approval interaction is exposed for protected intake cases.",
    isRedactedPublicView: true
  };
}

export function buildTripCaseFromIntake(input: TripCaseIntakeInput): TripCase {
  const stamp = Date.now().toString().slice(-6);
  const priority: Priority =
    input.decisionDeadline === "Today"
      ? "urgent"
      : input.decisionDeadline === "Tomorrow"
        ? "high"
        : "normal";

  return {
    id: `OPS-${stamp}`,
    tripCaseId: `OPS-${stamp}`,
    company: input.company || "External intake",
    officeName: "Executive Assistant / Founder Office intake",
    requester: input.contact || "Reply contact pending",
    traveler: input.travelers || "Traveler not specified",
    approver: input.approvalOwner || "Approval owner to be assigned",
    tripPurpose: input.stakes || "Trip purpose to be clarified",
    destination: input.destination || "Destination pending",
    timing: input.dates || "Dates pending",
    constraints: [
      input.constraints || "Constraints pending",
      input.budget ? `Budget context: ${input.budget}` : "Budget context pending",
      input.decisionDeadline
        ? `Decision deadline: ${input.decisionDeadline}`
        : "Decision deadline pending"
    ],
    approvalContext: input.approvalOwner
      ? `Approval owner set to ${input.approvalOwner}; operator review comes before the approval checkpoint.`
      : "Awaiting operator review before any approval checkpoint is defined.",
    priority,
    state: "new",
    approvalState: "draft_review",
    approvalRequestedAt: null,
    approvalGrantedAt: null,
    approvalBlockedReason: null,
    owner: "Ops triage",
    nextAction: "Review intake and convert it into a decision-ready workflow case.",
    optionSetSummary: "Pending operator first pass",
    sourceEvidence: "No external evidence attached yet",
    fetchedAt: "Not fetched yet",
    policyNotes: "No booking or payment action should occur from intake alone.",
    internalNotes: [
      "Created from B-side intake.",
      input.company ? `Company / account: ${input.company}` : "Company / account missing.",
      input.approvalOwner ? `Approval owner: ${input.approvalOwner}` : "Approval owner missing.",
      input.decisionDeadline
        ? `Decision deadline: ${input.decisionDeadline}`
        : "Decision deadline missing.",
      input.contact ? `Reply contact: ${input.contact}` : "Reply contact missing."
    ].join(" "),
    recommendationHeadline: "Operator recommendation pending first pass.",
    approvalPrompt: "Review intake, prepare options, then define approval ask."
  };
}
