/*
  # Create Securo Help Database Schema

  1. New Tables
    - `users` - Users and staff members with authentication
    - `clients` - Client information
    - `case_statuses` - Case status definitions
    - `insurance_companies` - Insurance company information
    - `cases` - Legal cases
    - `document_categories` - Document category definitions
    - `documents` - Case documents and files

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users

  3. Important Notes
    - Run this in Supabase SQL Editor
    - All tables use soft deletes
    - Audit fields track changes
*/

-- Create users table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text,
  role text NOT NULL CHECK (role IN ('ADMIN', 'AGENT', 'ASSISTANT', 'ACCOUNTANT')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data"
  ON public.users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all users"
  ON public.users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.id = auth.uid()
      AND public.users.role = 'ADMIN'
    )
  );

-- Create clients table
CREATE TABLE IF NOT EXISTS public.clients (
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
  city text NOT NULL,
  notes text,
  gdpr_consent boolean DEFAULT false,
  gdpr_consent_date timestamptz,
  marketing_consent boolean DEFAULT false,
  assigned_agent_id uuid REFERENCES public.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid NOT NULL REFERENCES public.users(id),
  updated_by uuid REFERENCES public.users(id),
  deleted_at timestamptz,
  deleted_by uuid REFERENCES public.users(id)
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read clients"
  ON public.clients FOR SELECT
  TO authenticated
  USING (deleted_at IS NULL);

CREATE POLICY "Authenticated users can insert clients"
  ON public.clients FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Authenticated users can update clients"
  ON public.clients FOR UPDATE
  TO authenticated
  USING (deleted_at IS NULL)
  WITH CHECK (auth.uid() = updated_by);

-- Create case_statuses table
CREATE TABLE IF NOT EXISTS public.case_statuses (
  id serial PRIMARY KEY,
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  color text,
  sort_order integer DEFAULT 0,
  is_final boolean DEFAULT false,
  is_active boolean DEFAULT true
);

ALTER TABLE public.case_statuses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active case statuses"
  ON public.case_statuses FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Insert default case statuses
INSERT INTO public.case_statuses (code, name, description, color, sort_order, is_final) VALUES
  ('new', 'Nowa', 'Nowa sprawa', '#3B82F6', 1, false),
  ('documents', 'Dokumenty', 'Zbieranie dokumentów', '#F59E0B', 2, false),
  ('sent', 'Wysłane do TU', 'Dokumenty wysłane do towarzystwa ubezpieczeniowego', '#8B5CF6', 3, false),
  ('positive', 'Pozytywna', 'Pozytywna decyzja', '#10B981', 4, true),
  ('negative', 'Negatywna', 'Negatywna decyzja', '#EF4444', 5, false),
  ('appeal', 'Odwołanie', 'Złożone odwołanie', '#F97316', 6, false),
  ('lawsuit', 'Pozew', 'Złożony pozew', '#DC2626', 7, false),
  ('closed', 'Zakończona', 'Sprawa zakończona', '#6B7280', 8, true)
ON CONFLICT (code) DO NOTHING;

-- Create insurance_companies table
CREATE TABLE IF NOT EXISTS public.insurance_companies (
  id serial PRIMARY KEY,
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  short_name text,
  nip text,
  address text,
  email text,
  phone text,
  contact_person text,
  notes text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.insurance_companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active insurance companies"
  ON public.insurance_companies FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Insert default insurance companies
INSERT INTO public.insurance_companies (code, name, short_name) VALUES
  ('pzu', 'PZU S.A.', 'PZU'),
  ('warta', 'Warta S.A.', 'Warta'),
  ('ergo', 'ERGO Hestia S.A.', 'Ergo Hestia'),
  ('allianz', 'Allianz Polska S.A.', 'Allianz'),
  ('generali', 'Generali T.U. S.A.', 'Generali')
ON CONFLICT (code) DO NOTHING;

-- Create cases table
CREATE TABLE IF NOT EXISTS public.cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_number text UNIQUE NOT NULL,
  client_id uuid NOT NULL REFERENCES public.clients(id),
  insurance_company_id integer REFERENCES public.insurance_companies(id),
  status_id integer DEFAULT 1 REFERENCES public.case_statuses(id),
  assigned_agent_id uuid REFERENCES public.users(id),
  incident_date date NOT NULL,
  policy_number text,
  claim_number text,
  claim_value decimal(12, 2),
  compensation_received decimal(12, 2),
  incident_description text,
  incident_location text,
  vehicle_brand text,
  vehicle_model text,
  vehicle_registration text,
  vehicle_year integer,
  internal_notes text,
  documents_sent_date date,
  decision_date date,
  appeal_date date,
  lawsuit_date date,
  closed_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid NOT NULL REFERENCES public.users(id),
  updated_by uuid REFERENCES public.users(id),
  deleted_at timestamptz,
  deleted_by uuid REFERENCES public.users(id)
);

ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read cases"
  ON public.cases FOR SELECT
  TO authenticated
  USING (deleted_at IS NULL);

CREATE POLICY "Authenticated users can insert cases"
  ON public.cases FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Authenticated users can update cases"
  ON public.cases FOR UPDATE
  TO authenticated
  USING (deleted_at IS NULL)
  WITH CHECK (auth.uid() = updated_by);

-- Create document_categories table
CREATE TABLE IF NOT EXISTS public.document_categories (
  id serial PRIMARY KEY,
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  required boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true
);

ALTER TABLE public.document_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active document categories"
  ON public.document_categories FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Insert default document categories
INSERT INTO public.document_categories (code, name, description, required, sort_order) VALUES
  ('id', 'Dowód osobisty', 'Kopia dowodu osobistego klienta', true, 1),
  ('policy', 'Polisa ubezpieczeniowa', 'Kopia polisy ubezpieczeniowej', true, 2),
  ('notice', 'Zawiadomienie o szkodzie', 'Zawiadomienie o szkodzie do TU', true, 3),
  ('police', 'Protokół policji', 'Protokół z miejsca zdarzenia', false, 4),
  ('medical', 'Dokumentacja medyczna', 'Zaświadczenia lekarskie, dokumentacja szpitalna', false, 5),
  ('photos', 'Zdjęcia', 'Zdjęcia uszkodzonego pojazdu', false, 6),
  ('invoice', 'Faktury', 'Faktury za naprawę, wyceny', false, 7),
  ('correspondence', 'Korespondencja', 'Pisma z TU i inne', false, 8),
  ('other', 'Inne', 'Inne dokumenty', false, 9)
ON CONFLICT (code) DO NOTHING;

-- Create documents table
CREATE TABLE IF NOT EXISTS public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.cases(id),
  client_id uuid NOT NULL REFERENCES public.clients(id),
  category_id integer NOT NULL REFERENCES public.document_categories(id),
  file_name text NOT NULL,
  original_file_name text NOT NULL,
  file_path text NOT NULL,
  file_size bigint,
  mime_type text,
  file_hash text,
  description text,
  document_date date,
  ocr_processed boolean DEFAULT false,
  ocr_text text,
  ocr_processed_at timestamptz,
  uploaded_at timestamptz DEFAULT now(),
  uploaded_by uuid NOT NULL REFERENCES public.users(id),
  deleted_at timestamptz,
  deleted_by uuid REFERENCES public.users(id)
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read documents"
  ON public.documents FOR SELECT
  TO authenticated
  USING (deleted_at IS NULL);

CREATE POLICY "Authenticated users can insert documents"
  ON public.documents FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Authenticated users can update documents"
  ON public.documents FOR UPDATE
  TO authenticated
  USING (deleted_at IS NULL)
  WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_clients_deleted_at ON public.clients(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_clients_assigned_agent ON public.clients(assigned_agent_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_cases_deleted_at ON public.cases(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_cases_client ON public.cases(client_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_cases_status ON public.cases(status_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_cases_assigned_agent ON public.cases(assigned_agent_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_documents_deleted_at ON public.documents(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_documents_case ON public.documents(case_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_documents_client ON public.documents(client_id) WHERE deleted_at IS NULL;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_clients_updated_at ON public.clients;
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cases_updated_at ON public.cases;
CREATE TRIGGER update_cases_updated_at
  BEFORE UPDATE ON public.cases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'AGENT')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new auth users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
