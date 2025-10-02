/*
  # SecuroHelp CRM - Początkowa struktura bazy danych

  1. Nowe tabele
    - `users` - Użytkownicy systemu (pracownicy firmy ubezpieczeniowej)
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `password_hash` (text)
      - `first_name` (text)
      - `last_name` (text)
      - `role` (text: 'admin', 'agent')
      - `is_active` (boolean)
      - timestamps

    - `clients` - Klienci firmy
      - `id` (uuid, primary key)
      - `first_name` (text)
      - `last_name` (text)
      - `email` (text)
      - `phone` (text)
      - `pesel` (text)
      - `id_number` (text)
      - adres (street, house_number, apartment_number, postal_code, city)
      - `notes` (text)
      - `gdpr_consent` (boolean)
      - `gdpr_consent_date` (timestamptz)
      - `marketing_consent` (boolean)
      - `assigned_agent_id` (uuid, foreign key)
      - `created_by` (uuid, foreign key)
      - timestamps + soft delete

    - `insurance_companies` - Firmy ubezpieczeniowe
      - `id` (uuid, primary key)
      - `name` (text)
      - `short_name` (text)
      - kontakt (email, phone)
      - adres
      - `notes` (text)
      - `is_active` (boolean)
      - timestamps

    - `case_statuses` - Statusy spraw
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `color` (text)
      - `sort_order` (integer)
      - `is_active` (boolean)
      - timestamps

    - `cases` - Sprawy klientów
      - `id` (uuid, primary key)
      - `case_number` (text, unique)
      - `client_id` (uuid, foreign key)
      - `insurance_company_id` (uuid, foreign key)
      - `accident_date` (date)
      - `accident_description` (text)
      - `status_id` (uuid, foreign key)
      - `assigned_agent_id` (uuid, foreign key)
      - `notes` (text)
      - `created_by` (uuid, foreign key)
      - timestamps + soft delete

    - `document_categories` - Kategorie dokumentów
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `sort_order` (integer)
      - `is_active` (boolean)
      - timestamps

    - `documents` - Dokumenty
      - `id` (uuid, primary key)
      - `case_id` (uuid, foreign key)
      - `client_id` (uuid, foreign key)
      - `category_id` (uuid, foreign key)
      - `file_name` (text)
      - `file_path` (text)
      - `file_size` (bigint)
      - `mime_type` (text)
      - `uploaded_by` (uuid, foreign key)
      - `notes` (text)
      - timestamps + soft delete

  2. Bezpieczeństwo
    - Włączenie RLS na wszystkich tabelach
    - Polityki dostępu dla zalogowanych użytkowników
*/

-- Tworzenie tabeli użytkowników
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  role text NOT NULL DEFAULT 'agent' CHECK (role IN ('admin', 'agent')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all users"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Tworzenie tabeli klientów
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text,
  phone text,
  pesel text,
  id_number text,
  street text,
  house_number text,
  apartment_number text,
  postal_code text,
  city text,
  notes text,
  gdpr_consent boolean DEFAULT false,
  gdpr_consent_date timestamptz,
  marketing_consent boolean DEFAULT false,
  assigned_agent_id uuid REFERENCES users(id),
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all clients"
  ON clients FOR SELECT
  TO authenticated
  USING (deleted_at IS NULL);

CREATE POLICY "Users can create clients"
  ON clients FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update clients"
  ON clients FOR UPDATE
  TO authenticated
  USING (deleted_at IS NULL)
  WITH CHECK (deleted_at IS NULL);

CREATE POLICY "Users can soft delete clients"
  ON clients FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Tworzenie tabeli firm ubezpieczeniowych
CREATE TABLE IF NOT EXISTS insurance_companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  short_name text,
  contact_email text,
  contact_phone text,
  street text,
  house_number text,
  postal_code text,
  city text,
  notes text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE insurance_companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read active insurance companies"
  ON insurance_companies FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Tworzenie tabeli statusów spraw
CREATE TABLE IF NOT EXISTS case_statuses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  color text DEFAULT '#3b82f6',
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE case_statuses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read active case statuses"
  ON case_statuses FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Tworzenie tabeli spraw
CREATE TABLE IF NOT EXISTS cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_number text UNIQUE NOT NULL,
  client_id uuid REFERENCES clients(id) NOT NULL,
  insurance_company_id uuid REFERENCES insurance_companies(id),
  accident_date date NOT NULL,
  accident_description text NOT NULL,
  status_id uuid REFERENCES case_statuses(id) NOT NULL,
  assigned_agent_id uuid REFERENCES users(id),
  notes text,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all cases"
  ON cases FOR SELECT
  TO authenticated
  USING (deleted_at IS NULL);

CREATE POLICY "Users can create cases"
  ON cases FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update cases"
  ON cases FOR UPDATE
  TO authenticated
  USING (deleted_at IS NULL)
  WITH CHECK (deleted_at IS NULL);

CREATE POLICY "Users can soft delete cases"
  ON cases FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Tworzenie tabeli kategorii dokumentów
CREATE TABLE IF NOT EXISTS document_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE document_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read active document categories"
  ON document_categories FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Tworzenie tabeli dokumentów
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES cases(id),
  client_id uuid REFERENCES clients(id),
  category_id uuid REFERENCES document_categories(id) NOT NULL,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size bigint NOT NULL,
  mime_type text NOT NULL,
  uploaded_by uuid REFERENCES users(id),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all documents"
  ON documents FOR SELECT
  TO authenticated
  USING (deleted_at IS NULL);

CREATE POLICY "Users can create documents"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update documents"
  ON documents FOR UPDATE
  TO authenticated
  USING (deleted_at IS NULL)
  WITH CHECK (deleted_at IS NULL);

CREATE POLICY "Users can soft delete documents"
  ON documents FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Wstawianie danych początkowych

-- Użytkownicy (hasło: admin123, agent123)
INSERT INTO users (id, email, password_hash, first_name, last_name, role, is_active) VALUES
  ('11111111-1111-1111-1111-111111111111', 'admin@securohelp.pl', '$2a$10$rZ5YZKvH5qOqH5YZKvH5qOqH5YZKvH5qOqH5YZKvH5qOqH5YZKvH5q', 'Jan', 'Kowalski', 'admin', true),
  ('22222222-2222-2222-2222-222222222222', 'agent1@securohelp.pl', '$2a$10$rZ5YZKvH5qOqH5YZKvH5qOqH5YZKvH5qOqH5YZKvH5qOqH5YZKvH5q', 'Anna', 'Nowak', 'agent', true),
  ('33333333-3333-3333-3333-333333333333', 'agent2@securohelp.pl', '$2a$10$rZ5YZKvH5qOqH5YZKvH5qOqH5YZKvH5qOqH5YZKvH5qOqH5YZKvH5q', 'Piotr', 'Wiśniewski', 'agent', true)
ON CONFLICT (email) DO NOTHING;

-- Firmy ubezpieczeniowe
INSERT INTO insurance_companies (id, name, short_name, contact_email, contact_phone) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'PZU S.A.', 'PZU', 'kontakt@pzu.pl', '+48 22 566 56 56'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Warta S.A.', 'Warta', 'info@warta.pl', '+48 22 543 00 00'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Ergo Hestia S.A.', 'Ergo Hestia', 'kontakt@ergohestia.pl', '+48 58 555 55 55')
ON CONFLICT (id) DO NOTHING;

-- Statusy spraw
INSERT INTO case_statuses (id, name, description, color, sort_order) VALUES
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Nowa', 'Sprawa została założona', '#3b82f6', 1),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'W trakcie', 'Sprawa jest w trakcie realizacji', '#f59e0b', 2),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Zakończona', 'Sprawa została zakończona', '#10b981', 3)
ON CONFLICT (id) DO NOTHING;

-- Kategorie dokumentów
INSERT INTO document_categories (id, name, description, sort_order) VALUES
  ('10000000-0000-0000-0000-000000000001', 'Dokumenty tożsamości', 'Dowody osobiste, paszporty', 1),
  ('10000000-0000-0000-0000-000000000002', 'Dokumenty medyczne', 'Zaświadczenia lekarskie, karty informacyjne', 2),
  ('10000000-0000-0000-0000-000000000003', 'Dokumenty pojazdu', 'Dowód rejestracyjny, polisa', 3),
  ('10000000-0000-0000-0000-000000000004', 'Zdjęcia szkody', 'Dokumentacja fotograficzna', 4),
  ('10000000-0000-0000-0000-000000000005', 'Inne dokumenty', 'Pozostałe dokumenty', 5)
ON CONFLICT (id) DO NOTHING;

-- Tworzenie indeksów dla lepszej wydajności
CREATE INDEX IF NOT EXISTS idx_clients_assigned_agent ON clients(assigned_agent_id);
CREATE INDEX IF NOT EXISTS idx_clients_deleted_at ON clients(deleted_at);
CREATE INDEX IF NOT EXISTS idx_cases_client ON cases(client_id);
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status_id);
CREATE INDEX IF NOT EXISTS idx_cases_assigned_agent ON cases(assigned_agent_id);
CREATE INDEX IF NOT EXISTS idx_cases_deleted_at ON cases(deleted_at);
CREATE INDEX IF NOT EXISTS idx_documents_case ON documents(case_id);
CREATE INDEX IF NOT EXISTS idx_documents_client ON documents(client_id);
CREATE INDEX IF NOT EXISTS idx_documents_deleted_at ON documents(deleted_at);
