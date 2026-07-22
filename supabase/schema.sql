-- Höstplan · träningslogg — körs en gång i SQL-editorn i det nya Supabase-projektet.
-- En rad per pass (vecka 1–12 × slot 0–3). Planen själv ligger i js/plan.js.

create table public.session_log (
  week int not null check (week between 1 and 12),
  slot int not null check (slot between 0 and 3),
  done boolean not null default false,
  date_completed date,
  rpe int check (rpe between 1 and 10),
  note text,
  metrics jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (week, slot)
);

-- Enanvändarlogg: anon-nyckeln får läsa och skriva (samma modell som pingisstegen).
alter table public.session_log enable row level security;

create policy "anon select" on public.session_log
  for select to anon, authenticated using (true);

create policy "anon insert" on public.session_log
  for insert to anon, authenticated with check (true);

create policy "anon update" on public.session_log
  for update to anon, authenticated using (true) with check (true);

-- Realtime så telefon och laptop ser varandras ändringar direkt.
alter publication supabase_realtime add table public.session_log;
