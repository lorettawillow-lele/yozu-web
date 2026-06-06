import { NextResponse } from "next/server";
import { buildTripCaseFromIntake, type TripCaseIntakeInput } from "../../lib/ops";
import { createCase, getCaseStoreMode, listStoredCases } from "../../lib/case-store";

export async function GET() {
  const stored = await listStoredCases();

  return NextResponse.json({
    mode: getCaseStoreMode(),
    cases: stored
  });
}

export async function POST(request: Request) {
  const payload = (await request.json()) as Partial<TripCaseIntakeInput>;
  const tripCase = buildTripCaseFromIntake({
    destination: payload.destination ?? "",
    dates: payload.dates ?? "",
    travelers: payload.travelers ?? "",
    budget: payload.budget ?? "",
    stakes: payload.stakes ?? "",
    constraints: payload.constraints ?? "",
    contact: payload.contact ?? ""
  });

  await createCase(tripCase, payload);

  return NextResponse.json({
    mode: getCaseStoreMode(),
    case: tripCase
  });
}
