export const coreFlow = [
  {
    label: "01",
    title: "Employee Request",
    body: "Start with destination, timing, travelers, constraints, and the actual business outcome the trip needs to support."
  },
  {
    label: "02",
    title: "AI Planning",
    body: "Turn messy travel intent into a smaller decision set instead of another wall of search results."
  },
  {
    label: "03",
    title: "Policy Review",
    body: "Frame each option with provenance, freshness expectations, and policy/disclosure context before it moves forward."
  },
  {
    label: "04",
    title: "Manager Approval",
    body: "Nothing advances until the case crosses an explicit approval checkpoint and the intended option is confirmed."
  },
  {
    label: "05",
    title: "Operator Coordination",
    body: "Operators handle the guarded coordination step rather than pretending supplier execution already happened."
  },
  {
    label: "06",
    title: "Ready for Booking",
    body: "Preflight makes the case decision-ready, while the public product still stops short of automatic booking."
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
