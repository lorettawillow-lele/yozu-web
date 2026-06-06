import { NextResponse } from "next/server";
import { getStoredCase, saveCase } from "../../../lib/case-store";
import { getCaseById } from "../../../lib/ops";

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

  return NextResponse.json({ case: tripCase });
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

  const patch = (await request.json()) as Partial<typeof tripCase>;
  const nextCase = {
    ...tripCase,
    ...patch
  };

  await saveCase(nextCase);

  return NextResponse.json({ case: nextCase });
}
