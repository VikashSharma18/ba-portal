-- ============================================
-- BA PORTAL - COMPLETE DATABASE SCHEMA
-- Run this in Supabase → SQL Editor → New Query
-- ============================================

-- PROJECTS TABLE
create table if not exists projects (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  code text not null unique,
  description text,
  status text default 'active' check (status in ('active','completed','on_hold','cancelled')),
  progress integer default 0 check (progress >= 0 and progress <= 100),
  due_date date,
  color text default '#6366f1',
  task_counter integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- TASKS TABLE
create table if not exists tasks (
  id uuid default gen_random_uuid() primary key,
  task_id text not null unique,
  title text not null,
  description text,
  type text default 'Requirement' check (type in ('Requirement','Bug','Change Request','Internal','Documentation','Compliance Change','API Spec','Insurer Request','Process Update')),
  status text default 'Incoming' check (status in ('Incoming','In Analysis','In Discussion','In Development','In Review','Deployed','On Hold','Cancelled')),
  priority text default 'Medium' check (priority in ('Critical','High','Medium','Low')),
  progress integer default 0 check (progress >= 0 and progress <= 100),
  source text default 'Internal' check (source in ('Email','Meeting','Stakeholder Request','Internal','Client Call')),
  assigned_to text,
  assigned_role text check (assigned_role in ('BA','Backend Dev','Frontend Dev','Stakeholder','Client')),
  stakeholder_name text,
  project_id uuid references projects(id) on delete set null,
  parent_task_id uuid references tasks(id) on delete set null,
  due_date date,
  reminder_date date,
  tags text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- TASK NOTES TABLE
create table if not exists task_notes (
  id uuid default gen_random_uuid() primary key,
  task_id uuid references tasks(id) on delete cascade,
  note_text text not null,
  created_at timestamptz default now()
);

-- TASK ATTACHMENTS TABLE
create table if not exists task_attachments (
  id uuid default gen_random_uuid() primary key,
  task_id uuid references tasks(id) on delete cascade,
  file_name text not null,
  file_url text not null,
  uploaded_at timestamptz default now()
);

-- TEAM MEMBERS TABLE
create table if not exists team_members (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  role text not null check (role in ('BA','Backend Dev','Frontend Dev','Stakeholder','Client')),
  email text,
  active boolean default true,
  created_at timestamptz default now()
);

-- ============================================
-- SEED DATA
-- ============================================

-- Insert Projects
insert into projects (name, code, description, status, progress, due_date, color) values
('Onboarding Portal', 'ONB', 'Customer onboarding flow and KYC management', 'active', 45, '2026-07-15', '#6366f1'),
('Mobile CRM', 'MCRM', 'Mobile CRM app for insurance agents', 'active', 62, '2026-06-30', '#10b981'),
('Suvidha4U', 'SVU', 'Customer self-service insurance portal', 'active', 28, '2026-08-20', '#f59e0b');

-- Insert Team Members
insert into team_members (name, role, email) values
('Vikash (You)', 'BA', 'vikashcourse@gmail.com'),
('Rahul', 'Frontend Dev', 'rahul@acrossassist.com'),
('Chandan', 'Backend Dev', 'chandan@acrossassist.com'),
('Mayank', 'Stakeholder', 'mayank@acrossassist.com'),
('Rupal', 'Client', 'rupal@client.com');

-- Insert Sample Tasks (will be linked to projects via sub-query)
insert into tasks (task_id, title, description, type, status, priority, source, assigned_to, assigned_role, stakeholder_name, project_id, due_date, tags)
select 'ONB-001', 'Write BRD for KYC verification flow', 'Client requires Aadhaar + PAN verification during onboarding. Need to document API flow and screen wireframes.', 'Requirement', 'In Analysis', 'Critical', 'Email', 'Vikash (You)', 'BA', 'Rupal', id, '2026-05-30', array['kyc','brd','onboarding']
from projects where code = 'ONB';

insert into tasks (task_id, title, description, type, status, priority, source, assigned_to, assigned_role, stakeholder_name, project_id, due_date, tags)
select 'ONB-002', 'Build OTP verification screen', 'Frontend task - build OTP input screen with resend timer and validation states.', 'Requirement', 'In Development', 'High', 'Meeting', 'Rahul', 'Frontend Dev', 'Mayank', id, '2026-06-02', array['frontend','otp','ui']
from projects where code = 'ONB';

insert into tasks (task_id, title, description, type, status, priority, source, assigned_to, assigned_role, stakeholder_name, project_id, due_date, tags)
select 'ONB-003', 'Aadhaar API integration', 'Backend - integrate UIDAI Aadhaar verification API with retry logic and error handling.', 'API Spec', 'In Discussion', 'Critical', 'Internal', 'Chandan', 'Backend Dev', 'Mayank', id, '2026-05-31', array['api','aadhaar','backend']
from projects where code = 'ONB';

insert into tasks (task_id, title, description, type, status, priority, source, assigned_to, assigned_role, project_id, due_date, tags)
select 'MCRM-001', 'Agent dashboard UI design review', 'Review Figma designs for agent dashboard. Approve or add comments before dev starts.', 'Requirement', 'In Review', 'High', 'Meeting', 'Vikash (You)', 'BA', id, '2026-05-28', array['dashboard','review','crm']
from projects where code = 'MCRM';

insert into tasks (task_id, title, description, type, status, priority, source, assigned_to, assigned_role, project_id, due_date, tags)
select 'MCRM-002', 'Policy listing API endpoint', 'Build REST API for listing policies by agent ID with pagination and filters.', 'API Spec', 'In Development', 'High', 'Internal', 'Chandan', 'Backend Dev', id, '2026-06-05', array['api','policy','backend']
from projects where code = 'MCRM';

insert into tasks (task_id, title, description, type, status, priority, source, assigned_to, assigned_role, project_id, due_date, tags)
select 'MCRM-003', 'Push notification setup', 'Frontend - integrate FCM push notifications for claim status updates.', 'Requirement', 'Incoming', 'Medium', 'Email', 'Rahul', 'Frontend Dev', id, '2026-06-10', array['notifications','mobile','frontend']
from projects where code = 'MCRM';

insert into tasks (task_id, title, description, type, status, priority, source, assigned_to, assigned_role, stakeholder_name, project_id, due_date, tags)
select 'SVU-001', 'Customer self-service BRD', 'Document all self-service flows: policy download, claim filing, premium payment.', 'Requirement', 'In Analysis', 'Critical', 'Stakeholder Request', 'Vikash (You)', 'BA', 'Rupal', id, '2026-06-01', array['brd','self-service','svu']
from projects where code = 'SVU';

insert into tasks (task_id, title, description, type, status, priority, source, assigned_to, assigned_role, stakeholder_name, project_id, due_date, tags)
select 'SVU-002', 'Premium payment gateway integration', 'Integrate Razorpay for premium payments. Need PG API keys from client.', 'API Spec', 'On Hold', 'High', 'Client Call', 'Chandan', 'Backend Dev', 'Rupal', id, '2026-06-15', array['payment','razorpay','blocked']
from projects where code = 'SVU';

-- General task (no project)
insert into tasks (task_id, title, description, type, status, priority, source, assigned_to, assigned_role, due_date, tags)
values ('GEN-001', 'Update internal SOP documentation', 'Review and update all SOPs for claim escalation and insurer communication process.', 'Documentation', 'Incoming', 'Low', 'Internal', 'Vikash (You)', 'BA', '2026-06-07', array['sop','documentation','internal']);

-- ============================================
-- AUTO UPDATE project progress based on tasks
-- ============================================
create or replace function update_project_progress()
returns trigger as $$
begin
  update projects
  set progress = (
    select case when count(*) = 0 then 0
    else round(count(*) filter (where status = 'Deployed') * 100.0 / count(*))
    end
    from tasks where project_id = coalesce(new.project_id, old.project_id)
  ),
  updated_at = now()
  where id = coalesce(new.project_id, old.project_id);
  return new;
end;
$$ language plpgsql;

create or replace trigger task_progress_trigger
after insert or update or delete on tasks
for each row execute function update_project_progress();

-- Auto update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger tasks_updated_at before update on tasks
for each row execute function update_updated_at();

create trigger projects_updated_at before update on projects
for each row execute function update_updated_at();
