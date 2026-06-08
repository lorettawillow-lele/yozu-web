import postgres from "postgres";
import type { AuditEvent, TripCase } from "./ops";

const memoryCases = new Map<string, TripCase>();
const memoryEvents = new Map<string, AuditEvent[]>();

function hasPostgres() {
  return Boolean(process.env.POSTGRES_URL);
}

let sqlClient: postgres.Sql | null = null;
let schemaReady = false;

function getSql() {
  if (!process.env.POSTGRES_URL) {
    throw new Error("POSTGRES_URL is not configured");
  }

  if (!sqlClient) {
    sqlClient = postgres(process.env.POSTGRES_URL, {
      ssl: "require"
    });
  }

  return sqlClient;
}

async function ensureSchema() {
  if (!hasPostgres() || schemaReady) {
    return;
  }

  const sql = getSql();
  await sql`
    create table if not exists case_core (
      id text primary key,
      trip_case_id text not null,
      company text not null,
      office_name text not null,
      requester text not null,
      traveler text not null,
      approver text not null,
      trip_purpose text not null,
      destination text not null,
      timing text not null,
      constraints jsonb not null,
      approval_context text not null,
      priority text not null,
      state text not null,
      approval_state text not null default 'draft_review',
      approval_requested_at text,
      approval_granted_at text,
      approval_blocked_reason text,
      preflight_status text,
      preflight_reason_code text,
      preflight_summary text,
      preflight_checked_at text,
      owner text not null,
      next_action text not null,
      option_set_summary text not null,
      source_evidence text not null,
      fetched_at text not null,
      policy_notes text not null,
      internal_notes text not null,
      recommendation_headline text not null default '',
      approval_prompt text not null default '',
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `;
  await sql`
    alter table case_core
    add column if not exists trip_case_id text not null default ''
  `;
  await sql`
    alter table case_core
    add column if not exists approval_state text not null default 'draft_review'
  `;
  await sql`
    alter table case_core
    add column if not exists approval_requested_at text
  `;
  await sql`
    alter table case_core
    add column if not exists approval_granted_at text
  `;
  await sql`
    alter table case_core
    add column if not exists approval_blocked_reason text
  `;
  await sql`
    alter table case_core
    add column if not exists preflight_status text
  `;
  await sql`
    alter table case_core
    add column if not exists preflight_reason_code text
  `;
  await sql`
    alter table case_core
    add column if not exists preflight_summary text
  `;
  await sql`
    alter table case_core
    add column if not exists preflight_checked_at text
  `;
  await sql`
    update case_core
    set trip_case_id = id
    where trip_case_id = ''
  `;
  await sql`
    create table if not exists audit_event (
      event_id text primary key,
      trip_case_id text not null,
      request_id text not null,
      actor_type text not null,
      action text not null,
      before_state text not null,
      after_state text not null,
      created_at timestamptz not null default now(),
      source text not null,
      summary text not null
    )
  `;
  schemaReady = true;
}

function mapRowToCase(row: Record<string, unknown>): TripCase {
  return {
    id: String(row.id),
    tripCaseId: String(row.trip_case_id || row.id),
    company: String(row.company),
    officeName: String(row.office_name),
    requester: String(row.requester),
    traveler: String(row.traveler),
    approver: String(row.approver),
    tripPurpose: String(row.trip_purpose),
    destination: String(row.destination),
    timing: String(row.timing),
    constraints: Array.isArray(row.constraints)
      ? row.constraints.map((item) => String(item))
      : [],
    approvalContext: String(row.approval_context),
    priority: row.priority as TripCase["priority"],
    state: row.state as TripCase["state"],
    approvalState: row.approval_state as TripCase["approvalState"],
    approvalRequestedAt: row.approval_requested_at ? String(row.approval_requested_at) : null,
    approvalGrantedAt: row.approval_granted_at ? String(row.approval_granted_at) : null,
    approvalBlockedReason: row.approval_blocked_reason ? String(row.approval_blocked_reason) : null,
    preflightStatus: row.preflight_status ? (String(row.preflight_status) as TripCase["preflightStatus"]) : null,
    preflightReasonCode: row.preflight_reason_code
      ? (String(row.preflight_reason_code) as TripCase["preflightReasonCode"])
      : null,
    preflightSummary: row.preflight_summary ? String(row.preflight_summary) : null,
    preflightCheckedAt: row.preflight_checked_at ? String(row.preflight_checked_at) : null,
    owner: String(row.owner),
    nextAction: String(row.next_action),
    optionSetSummary: String(row.option_set_summary),
    sourceEvidence: String(row.source_evidence),
    fetchedAt: String(row.fetched_at),
    policyNotes: String(row.policy_notes),
    internalNotes: String(row.internal_notes),
    recommendationHeadline: String(row.recommendation_headline),
    approvalPrompt: String(row.approval_prompt)
  };
}

function mapRowToEvent(row: Record<string, unknown>): AuditEvent {
  return {
    eventId: String(row.event_id),
    tripCaseId: String(row.trip_case_id),
    requestId: String(row.request_id),
    actorType: row.actor_type as AuditEvent["actorType"],
    action: row.action as AuditEvent["action"],
    beforeState: row.before_state as AuditEvent["beforeState"],
    afterState: row.after_state as AuditEvent["afterState"],
    createdAt: String(row.created_at),
    source: String(row.source),
    summary: String(row.summary)
  };
}

export async function listStoredCases() {
  if (!hasPostgres()) {
    return Array.from(memoryCases.values());
  }

  await ensureSchema();
  const sql = getSql();
  const rows = await sql`
    select *
    from case_core
    order by created_at desc
  `;

  return rows.map((row) => mapRowToCase(row));
}

export async function getStoredCase(id: string) {
  if (!hasPostgres()) {
    return memoryCases.get(id) ?? null;
  }

  await ensureSchema();
  const sql = getSql();
  const rows = await sql`
    select *
    from case_core
    where id = ${id}
    limit 1
  `;

  if (!rows.length) {
    return null;
  }

  return mapRowToCase(rows[0]);
}

export async function listAuditEvents(tripCaseId: string) {
  if (!hasPostgres()) {
    return memoryEvents.get(tripCaseId) ?? [];
  }

  await ensureSchema();
  const sql = getSql();
  const rows = await sql`
    select *
    from audit_event
    where trip_case_id = ${tripCaseId}
    order by created_at desc
  `;

  return rows.map((row) => mapRowToEvent(row));
}

export async function saveAuditEvent(event: AuditEvent) {
  if (!hasPostgres()) {
    const current = memoryEvents.get(event.tripCaseId) ?? [];
    memoryEvents.set(event.tripCaseId, [event, ...current]);
    return event;
  }

  await ensureSchema();
  const sql = getSql();
  await sql`
    insert into audit_event (
      event_id,
      trip_case_id,
      request_id,
      actor_type,
      action,
      before_state,
      after_state,
      source,
      summary
    ) values (
      ${event.eventId},
      ${event.tripCaseId},
      ${event.requestId},
      ${event.actorType},
      ${event.action},
      ${event.beforeState},
      ${event.afterState},
      ${event.source},
      ${event.summary}
    )
  `;

  return event;
}

export async function saveCase(nextCase: TripCase) {
  if (!hasPostgres()) {
    memoryCases.set(nextCase.id, nextCase);
    return nextCase;
  }

  await ensureSchema();
  const sql = getSql();
  await sql`
    insert into case_core (
      id,
      trip_case_id,
      company,
      office_name,
      requester,
      traveler,
      approver,
      trip_purpose,
      destination,
      timing,
      constraints,
      approval_context,
      priority,
      state,
      approval_state,
      approval_requested_at,
      approval_granted_at,
      approval_blocked_reason,
      preflight_status,
      preflight_reason_code,
      preflight_summary,
      preflight_checked_at,
      owner,
      next_action,
      option_set_summary,
      source_evidence,
      fetched_at,
      policy_notes,
      internal_notes,
      recommendation_headline,
      approval_prompt
    ) values (
      ${nextCase.id},
      ${nextCase.tripCaseId},
      ${nextCase.company},
      ${nextCase.officeName},
      ${nextCase.requester},
      ${nextCase.traveler},
      ${nextCase.approver},
      ${nextCase.tripPurpose},
      ${nextCase.destination},
      ${nextCase.timing},
      ${JSON.stringify(nextCase.constraints)},
      ${nextCase.approvalContext},
      ${nextCase.priority},
      ${nextCase.state},
      ${nextCase.approvalState},
      ${nextCase.approvalRequestedAt},
      ${nextCase.approvalGrantedAt},
      ${nextCase.approvalBlockedReason},
      ${nextCase.preflightStatus},
      ${nextCase.preflightReasonCode},
      ${nextCase.preflightSummary},
      ${nextCase.preflightCheckedAt},
      ${nextCase.owner},
      ${nextCase.nextAction},
      ${nextCase.optionSetSummary},
      ${nextCase.sourceEvidence},
      ${nextCase.fetchedAt},
      ${nextCase.policyNotes},
      ${nextCase.internalNotes},
      ${nextCase.recommendationHeadline},
      ${nextCase.approvalPrompt}
    )
    on conflict (id) do update set
      trip_case_id = excluded.trip_case_id,
      company = excluded.company,
      office_name = excluded.office_name,
      requester = excluded.requester,
      traveler = excluded.traveler,
      approver = excluded.approver,
      trip_purpose = excluded.trip_purpose,
      destination = excluded.destination,
      timing = excluded.timing,
      constraints = excluded.constraints,
      approval_context = excluded.approval_context,
      priority = excluded.priority,
      state = excluded.state,
      approval_state = excluded.approval_state,
      approval_requested_at = excluded.approval_requested_at,
      approval_granted_at = excluded.approval_granted_at,
      approval_blocked_reason = excluded.approval_blocked_reason,
      preflight_status = excluded.preflight_status,
      preflight_reason_code = excluded.preflight_reason_code,
      preflight_summary = excluded.preflight_summary,
      preflight_checked_at = excluded.preflight_checked_at,
      owner = excluded.owner,
      next_action = excluded.next_action,
      option_set_summary = excluded.option_set_summary,
      source_evidence = excluded.source_evidence,
      fetched_at = excluded.fetched_at,
      policy_notes = excluded.policy_notes,
      internal_notes = excluded.internal_notes,
      recommendation_headline = excluded.recommendation_headline,
      approval_prompt = excluded.approval_prompt,
      updated_at = now()
  `;

  return nextCase;
}

export function getCaseStoreMode() {
  return hasPostgres() ? "postgres" : "memory-fallback";
}
