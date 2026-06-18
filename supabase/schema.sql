-- =============================================
-- QUAMTIUM SPORTBOX - Schema de Base de Datos
-- =============================================

-- Extensión para UUIDs
create extension if not exists "uuid-ossp";

-- =============================================
-- TABLA: profiles
-- Se sincroniza con auth.users via trigger
-- =============================================
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  avatar_url text,
  email text unique not null,
  role text not null default 'user' check (role in ('user', 'admin')),
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================
-- TABLA: activity_types
-- Tipos de clases: Boxing, Funcional, etc.
-- =============================================
create table public.activity_types (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  color text not null default '#6366f1',
  icon text default 'dumbbell',
  duration_minutes integer not null default 60,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- =============================================
-- TABLA: instructors
-- Profesores/entrenadores
-- =============================================
create table public.instructors (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  bio text,
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- =============================================
-- TABLA: class_schedules
-- Clases programadas (instancias concretas)
-- =============================================
create table public.class_schedules (
  id uuid primary key default uuid_generate_v4(),
  activity_type_id uuid references public.activity_types(id) on delete cascade not null,
  instructor_id uuid references public.instructors(id) on delete set null,
  title text not null,
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  max_capacity integer not null default 15,
  is_cancelled boolean not null default false,
  cancel_reason text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint valid_time check (ends_at > starts_at)
);

-- =============================================
-- TABLA: bookings
-- Reservas de usuarios a clases
-- =============================================
create table public.bookings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  class_schedule_id uuid references public.class_schedules(id) on delete cascade not null,
  status text not null default 'confirmed' check (status in ('confirmed', 'cancelled', 'attended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Un usuario solo puede reservar una vez por clase
  unique (user_id, class_schedule_id)
);

-- =============================================
-- FUNCIÓN: get_available_spots(class_id)
-- Retorna cupos disponibles
-- =============================================
create or replace function public.get_available_spots(p_class_id uuid)
returns integer
language sql
stable
as $$
  select cs.max_capacity - count(b.id)::integer
  from public.class_schedules cs
  left join public.bookings b
    on b.class_schedule_id = cs.id and b.status = 'confirmed'
  where cs.id = p_class_id
  group by cs.max_capacity
$$;

-- =============================================
-- VISTA: classes_with_stats
-- Clases con cupos disponibles y estado de reserva
-- =============================================
create or replace view public.classes_with_stats as
select
  cs.*,
  at.name as activity_name,
  at.color as activity_color,
  at.icon as activity_icon,
  at.duration_minutes,
  i.name as instructor_name,
  i.avatar_url as instructor_avatar,

  (
    cs.max_capacity - (count(b.id) filter (where b.status = 'confirmed'))::integer
  ) as available_spots,

  (count(b.id) filter (where b.status = 'confirmed'))::integer as booked_count

from public.class_schedules cs
join public.activity_types at on at.id = cs.activity_type_id
left join public.instructors i on i.id = cs.instructor_id
left join public.bookings b on b.class_schedule_id = cs.id
group by cs.id, at.id, i.id;

-- =============================================
-- TRIGGER: sync profile on new user
-- =============================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =============================================
-- TRIGGER: updated_at automático
-- =============================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute procedure public.set_updated_at();

create trigger class_schedules_updated_at before update on public.class_schedules
  for each row execute procedure public.set_updated_at();

create trigger bookings_updated_at before update on public.bookings
  for each row execute procedure public.set_updated_at();

-- =============================================
-- RLS: Row Level Security
-- =============================================
alter table public.profiles enable row level security;
alter table public.activity_types enable row level security;
alter table public.instructors enable row level security;
alter table public.class_schedules enable row level security;
alter table public.bookings enable row level security;

-- Profiles: cada uno ve/edita solo el suyo; admin ve todos
create policy "profiles_select_own" on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own" on public.profiles for update
  using (auth.uid() = id);

create policy "profiles_admin_all" on public.profiles for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Activity types: todos leen, solo admins escriben
create policy "activity_types_select_all" on public.activity_types for select
  using (true);

create policy "activity_types_admin_write" on public.activity_types for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Instructors: todos leen, solo admins escriben
create policy "instructors_select_all" on public.instructors for select
  using (true);

create policy "instructors_admin_write" on public.instructors for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Class schedules: todos leen, solo admins escriben
create policy "class_schedules_select_all" on public.class_schedules for select
  using (true);

create policy "class_schedules_admin_write" on public.class_schedules for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Bookings: cada user ve las suyas, admins ven todas
create policy "bookings_select_own" on public.bookings for select
  using (auth.uid() = user_id);

create policy "bookings_insert_own" on public.bookings for insert
  with check (auth.uid() = user_id);

create policy "bookings_update_own" on public.bookings for update
  using (auth.uid() = user_id);

create policy "bookings_admin_all" on public.bookings for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );


insert into public.activity_types (name, description, color, icon, duration_minutes) values
  ('Boxing', 'Clases de boxeo recreativo y técnico', '#ef4444', 'boxing-glove', 60),
  ('Funcional', 'Entrenamiento funcional de alta intensidad', '#f97316', 'zap', 45),
  ('Cardio Box', 'Boxeo aeróbico con música', '#ec4899', 'music', 50),
  ('Sparring', 'Sesiones de sparring supervisado', '#8b5cf6', 'shield', 60),
  ('Fuerza', 'Entrenamiento de fuerza y musculación', '#06b6d4', 'dumbbell', 60);
