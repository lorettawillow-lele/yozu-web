import { NextResponse } from "next/server";
import {
  buildTripCaseFromIntake,
  getCaseById,
  mockCases,
  sanitizeCaseForPublicOps,
  type TripCaseIntakeInput
} from "../../lib/ops";
import { getCaseStoreMode, listStoredCases, saveCase } from "../../lib/case-store";

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

  return NextResponse.json({
    mode: getCaseStoreMode(),
    id: tripCase.id,
    status: "created"
  });
}
