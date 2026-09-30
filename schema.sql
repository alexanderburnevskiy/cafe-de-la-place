-- ============================================================
-- Café de la Place — Supabase Schema
-- Exécutez ce script dans l'éditeur SQL de Supabase
-- ============================================================

-- 1. Création de la table des réservations
create table if not exists public.reservations (
  id                uuid          primary key default gen_random_uuid(),
  created_at        timestamptz   not null default now(),
  customer_name     text          not null,
  customer_phone    text          not null,
  customer_email    text,
  guests_count      int           not null check (guests_count >= 1 and guests_count <= 8),
  reservation_date  date          not null,
  service_type      text          not null check (service_type in ('midi', 'soir')),
  reservation_time  text          not null,
  notes             text,
  status            text          not null default 'pending'
                                  check (status in ('pending', 'confirmed', 'seated', 'cancelled'))
);

-- 2. Indexes pour les requêtes fréquentes
create index if not exists idx_reservations_date
  on public.reservations (reservation_date);

create index if not exists idx_reservations_status
  on public.reservations (status);

create index if not exists idx_reservations_created_at
  on public.reservations (created_at desc);

-- 3. Activer Row Level Security
alter table public.reservations enable row level security;

-- 4. Politiques RLS ouvertes pour la démonstration
--    (À restreindre en production avec auth.uid() etc.)

-- Lecture publique (anon key)
create policy "Allow public read"
  on public.reservations
  for select
  using (true);

-- Insertion publique (formulaire client)
create policy "Allow public insert"
  on public.reservations
  for insert
  with check (true);

-- Mise à jour publique (changement de statut depuis le dashboard)
create policy "Allow public update"
  on public.reservations
  for update
  using (true)
  with check (true);

-- Suppression publique (optionnel pour la démo)
create policy "Allow public delete"
  on public.reservations
  for delete
  using (true);

-- 5. Activer la réplication Realtime
alter publication supabase_realtime add table public.reservations;

-- ============================================================
-- Données de démonstration (optionnel — à supprimer en prod)
-- ============================================================
insert into public.reservations
  (customer_name, customer_phone, customer_email, guests_count, reservation_date, service_type, reservation_time, notes, status)
values
  ('Marie Fontaine',  '+41 79 123 45 67', 'marie@example.com', 2, current_date + 1, 'midi', '12:00', null,              'confirmed'),
  ('Jean-Luc Moreau', '+41 76 987 65 43', 'jl@example.com',   4, current_date + 1, 'midi', '12:30', 'Allergie gluten', 'pending'),
  ('Sophie Blanc',    '+41 78 555 00 11', null,               3, current_date + 1, 'soir', '19:30', null,              'pending'),
  ('Daniel Müller',   '+41 79 222 33 44', 'd.muller@ex.com',  6, current_date + 1, 'soir', '20:00', 'Anniversaire',   'confirmed');
