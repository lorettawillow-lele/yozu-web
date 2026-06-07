import { NextResponse } from "next/server";
import {
  type AuditEvent,
  buildTripCaseFromIntake,
  getCaseById,
  mockCases,
  sanitizeCaseForPublicOps,
  type TripCaseIntakeInput
} from "../../lib/ops";
import {
  getCaseStoreMode,
  listStoredCases,
  saveAuditEvent,
  saveCase
} from "../../lib/case-store";

function createRequestId() {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function createEventId() {
  return `evt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function GET() {
  const stored = await listStoredCases();
  const storedById = new Map(stored.map((item) => [item.id, item]));
  const visibleStored = stored
    .filter((item) => !getCaseById(item.id))
    .map((item) => sanitizeCaseForPublicOps(item));
  const mergedMockCases = mockCases.map((item) => storedById.get(item.id) ?? item);

  return NextResponse.json({
    mode: getCaseStoreMode(),
    cases: [...visibleStored, ...mergedMockCases]
  });
}

export async function POST(request: Request) {
  const requestId = createRequestId();
  const payload = (await request.json()) as Partial<TripCaseIntakeInput>;
  const tripCase = buildTripCaseFromIntake({
    company: payload.company ?? "",
    approvalOwner: payload.approvalOwner ?? "",
    decisionDeadline: payload.decisionDeadline ?? "",
    destination: payload.destination ?? "",
    dates: payload.dates ?? "",
    travelers: payload.travelers ?? "",
    budget: payload.budget ?? "",
    stakes: payload.stakes ?? "",
    constraints: payload.constraints ?? "",
    contact: payload.contact ?? ""
  });

  await saveCase(tripCase);
  const createdEvent: AuditEvent = {
    eventId: createEventId(),
    tripCaseId: tripCase.tripCaseId,
    requestId,
    actorType: "requester",
    action: "case_created",
    beforeState: "none",
    afterState: tripCase.state,
    createdAt: new Date().toISOString(),
    source: "public_intake_create",
    summary: "Case created from intake and queued for guarded operator review."
  };
  await saveAuditEvent(createdEvent);

  return NextResponse.json({
    mode: getCaseStoreMode(),
    id: tripCase.id,
    status: "created"
  });
}
