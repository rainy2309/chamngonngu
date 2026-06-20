create table if not exists public.user_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null references auth.users(id) on delete set null,
  user_email text null,
  user_name text null,
  feedback_type text not null,
  message text not null,
  page_url text null,
  user_agent text null,
  status text not null default 'new',
  admin_note text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_feedback_type_check check (
    feedback_type in (
      'ui_bug',
      'video_data_bug',
      'content_feedback',
      'feature_request',
      'other'
    )
  ),
  constraint user_feedback_status_check check (
    status in ('new', 'in_progress', 'resolved', 'ignored')
  )
);

create index if not exists user_feedback_created_at_idx
  on public.user_feedback (created_at desc);

create index if not exists user_feedback_status_idx
  on public.user_feedback (status);

create index if not exists user_feedback_type_idx
  on public.user_feedback (feedback_type);

create or replace function public.set_user_feedback_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_user_feedback_updated_at on public.user_feedback;

create trigger set_user_feedback_updated_at
before update on public.user_feedback
for each row
execute function public.set_user_feedback_updated_at();

alter table public.user_feedback enable row level security;

drop policy if exists "Anyone can submit feedback" on public.user_feedback;
create policy "Anyone can submit feedback"
on public.user_feedback
for insert
to anon, authenticated
with check (
  status = 'new'
  and admin_note is null
  and (
    (auth.uid() is null and user_id is null)
    or (auth.uid() is not null and (user_id is null or user_id = auth.uid()))
  )
);

grant insert on public.user_feedback to anon, authenticated;
grant select, update, delete on public.user_feedback to authenticated;

drop policy if exists "Admins can read feedback" on public.user_feedback;
create policy "Admins can read feedback"
on public.user_feedback
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('admin', 'AD')
  )
);

drop policy if exists "Admins can update feedback" on public.user_feedback;
create policy "Admins can update feedback"
on public.user_feedback
for update
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('admin', 'AD')
  )
)
with check (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('admin', 'AD')
  )
);

drop policy if exists "Admins can delete feedback" on public.user_feedback;
create policy "Admins can delete feedback"
on public.user_feedback
for delete
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('admin', 'AD')
  )
);
