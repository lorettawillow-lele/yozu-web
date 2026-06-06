import { NextResponse } from "next/server";
import { getStoredCase, updateCase } from "../../../lib/case-store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const tripCase = await getStoredCase(id);

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
  const tripCase = await getStoredCase(id);

  if (!tripCase) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const patch = (await request.json()) as Partial<typeof tripCase>;
  const nextCase = {
    ...tripCase,
    ...patch,
    id: tripCase.id
  };

  await updateCase(nextCase, tripCase);

  return NextResponse.json({ case: nextCase });
}
