import { NextResponse } from "next/server";
import { buildTripCaseFromIntake, mockCases, type TripCaseIntakeInput } from "../../lib/ops";
import { getCaseStoreMode, listStoredCases, saveCase } from "../../lib/case-store";

export async function GET() {
  const stored = await listStoredCases();

  return NextResponse.json({
    mode: getCaseStoreMode(),
    cases: [...stored, ...mockCases]
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
    case: tripCase
  });
}
