begin;

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
  approval_prompt,
  created_at,
  updated_at
) values
(
  'YC-2401',
  'Willow Ventures',
  'Founder Office',
  'Annie Li',
  'Loretta Willow',
  'Founder Office principal',
  'Multi-city investor trip before partner meetings',
  'San Francisco -> Singapore -> Hong Kong',
  'June 12-18, flexible by +/- 1 day',
  '["No red-eye before Demo Day", "Keep investor breakfast windows open", "First-night hotel should be refundable"]'::jsonb,
  'Founder Office narrows options first; checkout coordination still waits for explicit approval.',
  'urgent',
  'reviewing',
  'Founder Office queue',
  'Draft 2 decision-ready investor-trip options with disclosure notes.',
  'Balanced arrival plan vs tighter lower-cost multi-city route',
  'Mock supplier references for long-haul flight and refundable hotel options',
  '2026-06-06 06:45 PT',
  'Fare rules and cancellation notes must be shown before approval.',
  'Primary Founder Office use case for enterprise-facing investor travel.',
  'Recommend the balanced arrival plan to preserve investor windows.',
  'Approve shortlist A/B before any flight or hotel coordination step.',
  '2026-06-06 13:45:00+00',
  '2026-06-06 13:45:00+00'
),
(
  'YC-2402',
  'Northstar Capital',
  'Executive Assistant desk',
  'Mina Park',
  'Daniel Reyes',
  'Chief of Staff',
  'Board meeting travel with post-meeting client dinner',
  'New York + Boston',
  'June 20-23',
  '["One checked bag", "Avoid last-flight-of-day risk", "Hotel must support late arrival"]'::jsonb,
  'EA reviews first, then forwards the selected shortlist for executive approval.',
  'high',
  'awaiting_approval',
  'EA workflow queue',
  'Hold coordination until the EA confirms option A or B with the approver.',
  'Executive-convenience route vs lower-cost split-city tradeoff',
  'Mock references for rail, flight, and hotel alternatives',
  '2026-06-06 06:40 PT',
  'Approval needed before any change from policy baseline.',
  'Primary Executive Assistant use case with approval gating.',
  'Recommend option A if arrival reliability matters more than fare delta.',
  'EA confirms preferred option, then approver signs off before coordination.',
  '2026-06-06 13:40:00+00',
  '2026-06-06 13:40:00+00'
),
(
  'YC-2403',
  'Aster Labs',
  'Office of the COO',
  'Sara Lin',
  'Leadership team (6)',
  'Chief of Staff + finance lead',
  'Leadership offsite with candidate and partner sessions',
  'Austin',
  'July 8-11',
  '["Need walkable hotel near meeting venue", "Keep arrivals before team dinner window", "Stay inside shared lodging and air budget"]'::jsonb,
  'Operations aligns on room block and travel window before the final approval checkpoint.',
  'normal',
  'new',
  'Ops triage',
  'Assign operator and normalize the offsite request fields.',
  'Pending first pass for group travel options',
  'Mock evidence not attached yet',
  'Not fetched yet',
  'Preflight only after options exist.',
  'Leadership offsite use case; useful for group-travel workflow design.',
  'Build first-pass group travel options before room-block coordination.',
  'Need ops review before approval path and budget checkpoint are finalized.',
  '2026-06-06 13:35:00+00',
  '2026-06-06 13:35:00+00'
)
on conflict (id) do nothing;

insert into case_events (case_id, event_type, actor, to_state, message, metadata, created_at)
select seed.case_id, 'case_created', 'system', seed.to_state, 'Seeded demo case.', '{"source":"002_seed_demo_cases"}'::jsonb, seed.created_at
from (
  values
    ('YC-2401', 'reviewing', '2026-06-06 13:45:00+00'::timestamptz),
    ('YC-2402', 'awaiting_approval', '2026-06-06 13:40:00+00'::timestamptz),
    ('YC-2403', 'new', '2026-06-06 13:35:00+00'::timestamptz)
) as seed(case_id, to_state, created_at)
where not exists (
  select 1
  from case_events existing
  where existing.case_id = seed.case_id
    and existing.event_type = 'case_created'
    and existing.metadata ->> 'source' = '002_seed_demo_cases'
);

commit;
