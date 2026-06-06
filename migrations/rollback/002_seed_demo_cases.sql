begin;

delete from case_events
where case_id in ('YC-2401', 'YC-2402', 'YC-2403')
  and metadata ->> 'source' = '002_seed_demo_cases';

delete from cases
where id in ('YC-2401', 'YC-2402', 'YC-2403');

commit;
