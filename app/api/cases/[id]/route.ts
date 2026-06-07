import { NextResponse } from "next/server";
import { getStoredCase, saveCase } from "../../../lib/case-store";
import { getCaseById, sanitizeCaseForPublicOps } from "../../../lib/ops";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const stored = await getStoredCase(id);
  const seed = getCaseById(id);
  const tripCase = stored ?? seed;

  if (!tripCase) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ case: stored ? sanitizeCaseForPublicOps(tripCase) : tripCase });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const stored = await getStoredCase(id);
  const seed = getCaseById(id);
  const tripCase = stored ?? seed;

  if (!tripCase) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  if (stored && !seed) {
    return NextResponse.json(
      { error: "protected_case", message: "Public demo routes cannot mutate protected intake cases." },
      { status: 403 }
    );
  }

  const patch = (await request.json()) as Partial<typeof tripCase>;
  const nextCase = {
    ...tripCase,
    ...patch
  };

  await saveCase(nextCase);

  return NextResponse.json({ case: nextCase });
}
