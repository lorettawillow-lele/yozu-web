import postgres from "postgres";
import type { TripCase, TripCaseIntakeInput } from "./ops";

type CaseEventInput = {
  caseId: string;
  eventType: "case_created" | "case_updated" | "approval_state_changed";
  actor?: string;
  fromState?: TripCase["state"] | null;
  toState?: TripCase["state"] | null;
  message?: string;
  metadata?: postgres.JSONValue;
};

type CaseSql = postgres.Sql | postgres.TransactionSql;

let sqlClient: postgres.Sql | null = null;

function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured");
  }

  if (!sqlClient) {
    sqlClient = postgres(process.env.DATABASE_URL, {
      ssl: "require"
    });
  }

  return sqlClient;
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

async function insertCaseEvent(sql: CaseSql, event: CaseEventInput) {
  await sql`
    insert into case_events (
      case_id,
      event_type,
      actor,
      from_state,
      to_state,
      message,
      metadata
    ) values (
      ${event.caseId},
      ${event.eventType},
      ${event.actor ?? "system"},
      ${event.fromState ?? null},
      ${event.toState ?? null},
      ${event.message ?? ""},
      ${sql.json(event.metadata ?? {})}
    )
  `;
}

export async function listStoredCases() {
  const sql = getSql();
  const rows = await sql`
    select *
    from cases
    order by created_at desc
  `;

  return rows.map((row) => mapRowToCase(row));
}

export async function getStoredCase(id: string) {
  const sql = getSql();
  const rows = await sql`
    select *
    from cases
    where id = ${id}
    limit 1
  `;

  if (!rows.length) {
    return null;
  }

  return mapRowToCase(rows[0]);
}

async function upsertCase(sql: CaseSql, nextCase: TripCase) {
  await sql`
    insert into cases (
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
      ${sql.json(nextCase.constraints)},
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
}

export async function createCase(nextCase: TripCase, intake?: Partial<TripCaseIntakeInput>) {
  const sql = getSql();

  await sql.begin(async (transaction) => {
    await upsertCase(transaction, nextCase);
    await insertCaseEvent(transaction, {
      caseId: nextCase.id,
      eventType: "case_created",
      toState: nextCase.state,
      message: "Case created from intake submission.",
      metadata: intake ? { intake } : {}
    });
  });

  return nextCase;
}

export async function updateCase(nextCase: TripCase, previousCase: TripCase) {
  const stateChanged = previousCase.state !== nextCase.state;
  const sql = getSql();

  await sql.begin(async (transaction) => {
    await upsertCase(transaction, nextCase);
    await insertCaseEvent(transaction, {
      caseId: nextCase.id,
      eventType: stateChanged ? "approval_state_changed" : "case_updated",
      fromState: previousCase.state,
      toState: nextCase.state,
      message: stateChanged
        ? `Case state changed from ${previousCase.state} to ${nextCase.state}.`
        : "Case updated.",
      metadata: {
        previousNextAction: previousCase.nextAction,
        nextAction: nextCase.nextAction
      }
    });
  });

  return nextCase;
}

export function getCaseStoreMode() {
  return "postgres";
}
