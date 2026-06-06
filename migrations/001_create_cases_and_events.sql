begin;

create table if not exists cases (
  id text primary key,
  company text not null,
  office_name text not null,
  requester text not null,
  traveler text not null,
  approver text not null,
  trip_purpose text not null,
  destination text not null,
  timing text not null,
  constraints jsonb not null default '[]'::jsonb,
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
  updated_at timestamptz not null default now(),
  constraint cases_constraints_array check (jsonb_typeof(constraints) = 'array'),
  constraint cases_priority_check check (priority in ('urgent', 'high', 'normal')),
  constraint cases_state_check check (
    state in ('new', 'reviewing', 'options_sent', 'awaiting_approval', 'coordinating', 'closed')
  )
);

create table if not exists case_events (
  id bigserial primary key,
  case_id text not null references cases(id) on delete cascade,
  event_type text not null,
  actor text not null default 'system',
  from_state text,
  to_state text,
  message text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint case_events_metadata_object check (jsonb_typeof(metadata) = 'object'),
  constraint case_events_from_state_check check (
    from_state is null or from_state in (
      'new',
      'reviewing',
      'options_sent',
      'awaiting_approval',
      'coordinating',
      'closed'
    )
  ),
  constraint case_events_to_state_check check (
    to_state is null or to_state in (
      'new',
      'reviewing',
      'options_sent',
      'awaiting_approval',
      'coordinating',
      'closed'
    )
  )
);

create index if not exists cases_created_at_idx on cases (created_at desc);
create index if not exists cases_state_idx on cases (state);
create index if not exists cases_priority_idx on cases (priority);
create index if not exists case_events_case_id_created_at_idx on case_events (case_id, created_at desc);
create index if not exists case_events_event_type_idx on case_events (event_type);

commit;
