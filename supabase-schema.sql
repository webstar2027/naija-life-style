-- Nigeria Lifestyle: production-oriented Supabase schema
create table if not exists public.player_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Player',
  gender text not null default 'neutral',
  style text not null default 'street',
  city text not null default 'Abuja',
  location_id text not null default 'home',
  x numeric not null default 20,
  y numeric not null default 78,
  money bigint not null default 25000 check (money >= 0),
  health integer not null default 100 check (health between 0 and 100),
  happiness integer not null default 75 check (happiness between 0 and 100),
  energy integer not null default 90 check (energy between 0 and 100),
  reputation integer not null default 0,
  xp integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('topup','earn','spend','refund','adjustment')),
  real_amount_kobo bigint not null default 0,
  game_naira bigint not null default 0,
  provider text,
  provider_reference text unique,
  status text not null default 'pending' check (status in ('pending','success','failed','reversed')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.ad_slots (
  id text primary key,
  name text not null,
  price_game_naira bigint not null check (price_game_naira > 0),
  active boolean not null default true
);
insert into public.ad_slots(id,name,price_game_naira) values
('billboard-1','Airport Road Billboard',50000),('billboard-2','Wuse City Billboard',50000),('billboard-3','Jabi Lake Billboard',50000),('stats-1','Live City Stats',100000)
on conflict (id) do nothing;

create table if not exists public.ad_campaigns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  slot_id text not null references public.ad_slots(id),
  business_name text not null,
  target_url text not null,
  image_url text,
  starts_at timestamptz not null default now(),
  ends_at timestamptz not null,
  status text not null default 'pending' check(status in ('pending','active','expired','cancelled')),
  created_at timestamptz not null default now()
);

alter table public.player_profiles enable row level security;
alter table public.wallet_transactions enable row level security;
alter table public.ad_slots enable row level security;
alter table public.ad_campaigns enable row level security;

drop policy if exists "players can read own profile" on public.player_profiles;
drop policy if exists "players can create own profile" on public.player_profiles;
drop policy if exists "players can update own profile" on public.player_profiles;
create policy "players can read own profile" on public.player_profiles for select using (auth.uid() = id);
create policy "players can create own profile" on public.player_profiles for insert with check (auth.uid() = id);
create policy "players can update own profile" on public.player_profiles for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "players read own transactions" on public.wallet_transactions for select using (auth.uid() = user_id);
create policy "players read ad slots" on public.ad_slots for select using (active = true);
create policy "players read active ads" on public.ad_campaigns for select using (status = 'active' and ends_at > now());
create policy "players read own ads" on public.ad_campaigns for select using (auth.uid() = user_id);
create policy "players create own ads" on public.ad_campaigns for insert with check (auth.uid() = user_id);

create or replace function public.touch_player_updated_at() returns trigger language plpgsql as $$ begin new.updated_at=now(); return new; end; $$;
drop trigger if exists player_profiles_updated_at on public.player_profiles;
create trigger player_profiles_updated_at before update on public.player_profiles for each row execute function public.touch_player_updated_at();

-- Atomic server-side wallet credit. Only service-role Edge Functions should call this.
create or replace function public.fulfill_topup(p_user_id uuid,p_reference text,p_real_kobo bigint,p_game_naira bigint,p_metadata jsonb default '{}'::jsonb)
returns void language plpgsql security definer set search_path=public as $$
declare v_tx_id uuid;
begin
  if p_real_kobo <= 0 or p_game_naira <= 0 then raise exception 'invalid topup'; end if;
  if exists(select 1 from wallet_transactions where provider_reference=p_reference and status='success') then return; end if;
  update player_profiles set money=money+p_game_naira where id=p_user_id;
  if not found then raise exception 'player not found'; end if;
  insert into wallet_transactions(user_id,kind,real_amount_kobo,game_naira,provider,provider_reference,status,metadata)
  values(p_user_id,'topup',p_real_kobo,p_game_naira,'paystack',p_reference,'success',p_metadata)
  returning id into v_tx_id;
end; $$;
revoke all on function public.fulfill_topup(uuid,text,bigint,bigint,jsonb) from public;

-- Realtime presence is used for nearby players; do not expose the full profile table publicly.
