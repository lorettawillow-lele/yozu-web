import { NextResponse } from "next/server";
import { getStoredCase, listAuditEvents, saveAuditEvent, saveCase } from "../../../lib/case-store";
import { getCaseById, sanitizeCaseForPublicOps, type AuditEvent } from "../../../lib/ops";

function createRequestId() {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function createEventId() {
  return `evt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function mapAction(nextState: NonNullable<AuditEvent["afterState"]>) {
  switch (nextState) {
    case "options_sent":
      return "approval_requested" as const;
    case "awaiting_approval":
      return "approval_hold" as const;
    case "coordinating":
      return "approval_granted" as const;
    case "reviewing":
      return "approval_returned" as const;
    default:
      return "approval_requested" as const;
  }
}

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

  const events = await listAuditEvents(tripCase.tripCaseId);

  return NextResponse.json({
    case: stored && !seed ? sanitizeCaseForPublicOps(tripCase) : tripCase,
    events
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = createRequestId();
  const { id } = await params;
  const stored = await getStoredCase(id);
  const seed = getCaseById(id);
  const tripCase = stored ?? seed;

  if (!tripCase) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  if (stored && !seed) {
    const deniedEvent: AuditEvent = {
      eventId: createEventId(),
      tripCaseId: tripCase.tripCaseId,
      requestId,
      actorType: "public_demo",
      action: "protected_mutation_denied",
      beforeState: tripCase.state,
      afterState: tripCase.state,
      createdAt: new Date().toISOString(),
      source: "public_case_patch",
      summary: "Protected intake case mutation denied on the public demo surface."
    };
    await saveAuditEvent(deniedEvent);
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
  const auditEvent: AuditEvent = {
    eventId: createEventId(),
    tripCaseId: nextCase.tripCaseId,
    requestId,
    actorType: "public_demo",
    action: mapAction(nextCase.state),
    beforeState: tripCase.state,
    afterState: nextCase.state,
    createdAt: new Date().toISOString(),
    source: "public_case_patch",
    summary: `Case moved from ${tripCase.state} to ${nextCase.state} on the public demo workflow.`
  };
  await saveAuditEvent(auditEvent);

  return NextResponse.json({ case: nextCase, requestId });
}
