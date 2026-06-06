import postgres from "postgres";
import type { TripCase } from "./ops";

const memoryCases = new Map<string, TripCase>();

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
  schemaReady = true;
}

function mapRowToCase(row: Record<string, unknown>): TripCase {
  return {
    id: String(row.id),
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
