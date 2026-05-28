-- ============================================
-- RLS POLICIES — PUBLIC ACCESS (anon key)
-- Run in Supabase → SQL Editor → New Query
-- NOTE: This makes all data readable/writable by anyone
-- with the anon key. Fine for an internal/demo tool,
-- NOT safe for sensitive production data.
-- ============================================

-- Make sure RLS is on (it already is, this is idempotent)
alter table projects          enable row level security;
alter table tasks             enable row level security;
alter table task_notes        enable row level security;
alter table task_attachments  enable row level security;
alter table team_members      enable row level security;

-- Allow anon + authenticated to do everything on every table
create policy "public_all_projects"         on projects         for all using (true) with check (true);
create policy "public_all_tasks"            on tasks            for all using (true) with check (true);
create policy "public_all_task_notes"       on task_notes       for all using (true) with check (true);
create policy "public_all_task_attachments" on task_attachments for all using (true) with check (true);
create policy "public_all_team_members"     on team_members     for all using (true) with check (true);
