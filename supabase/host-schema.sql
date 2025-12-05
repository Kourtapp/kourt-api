-- Court Suggestions Schema
-- Run this in Supabase SQL Editor

-- Court suggestions table (for users suggesting new courts)
CREATE TABLE IF NOT EXISTS court_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('public', 'private', 'arena')),
  name VARCHAR(200) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  neighborhood VARCHAR(100),
  description TEXT,
  sports TEXT[] DEFAULT '{}',
  amenities TEXT[] DEFAULT '{}',
  number_of_courts INTEGER DEFAULT 1,
  is_free BOOLEAN DEFAULT TRUE,
  price_per_hour DECIMAL(10,2),
  opening_hours VARCHAR(10),
  closing_hours VARCHAR(10),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Host applications table (for businesses wanting to register)
CREATE TABLE IF NOT EXISTS host_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  business_name VARCHAR(200) NOT NULL,
  cnpj VARCHAR(14) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(11) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(2) NOT NULL,
  zip_code VARCHAR(8),
  description TEXT,
  number_of_courts INTEGER DEFAULT 1,
  owner_name VARCHAR(200) NOT NULL,
  owner_cpf VARCHAR(11),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'approved', 'rejected')),
  documents JSONB DEFAULT '{}',
  admin_notes TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hosts table (approved host accounts)
CREATE TABLE IF NOT EXISTS hosts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  application_id UUID REFERENCES host_applications(id),
  business_name VARCHAR(200) NOT NULL,
  cnpj VARCHAR(14) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(11),
  is_verified BOOLEAN DEFAULT FALSE,
  subscription_tier VARCHAR(20) DEFAULT 'basic' CHECK (subscription_tier IN ('basic', 'pro', 'enterprise')),
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  commission_rate DECIMAL(5,2) DEFAULT 10.00,
  total_earnings DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_court_suggestions_user ON court_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_court_suggestions_status ON court_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_host_applications_user ON host_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_host_applications_status ON host_applications(status);
CREATE INDEX IF NOT EXISTS idx_hosts_user ON hosts(user_id);

-- Enable RLS
ALTER TABLE court_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE host_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE hosts ENABLE ROW LEVEL SECURITY;

-- Court Suggestions RLS
CREATE POLICY "court_suggestions_read_own"
ON court_suggestions FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "court_suggestions_insert_authenticated"
ON court_suggestions FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Host Applications RLS
CREATE POLICY "host_applications_read_own"
ON host_applications FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "host_applications_insert_authenticated"
ON host_applications FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Hosts RLS
CREATE POLICY "hosts_read_public"
ON hosts FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "hosts_update_own"
ON hosts FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS court_suggestions_updated_at ON court_suggestions;
CREATE TRIGGER court_suggestions_updated_at
  BEFORE UPDATE ON court_suggestions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS host_applications_updated_at ON host_applications;
CREATE TRIGGER host_applications_updated_at
  BEFORE UPDATE ON host_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS hosts_updated_at ON hosts;
CREATE TRIGGER hosts_updated_at
  BEFORE UPDATE ON hosts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-create host when application is approved
CREATE OR REPLACE FUNCTION handle_host_application_approval()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    INSERT INTO hosts (
      user_id,
      application_id,
      business_name,
      cnpj,
      email,
      phone
    ) VALUES (
      NEW.user_id,
      NEW.id,
      NEW.business_name,
      NEW.cnpj,
      NEW.email,
      NEW.phone
    )
    ON CONFLICT (user_id) DO UPDATE SET
      business_name = EXCLUDED.business_name,
      cnpj = EXCLUDED.cnpj,
      email = EXCLUDED.email,
      phone = EXCLUDED.phone,
      updated_at = NOW();

    NEW.approved_at = NOW();

    -- Update user subscription to pro
    UPDATE profiles SET subscription = 'pro' WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS host_application_approval_trigger ON host_applications;
CREATE TRIGGER host_application_approval_trigger
  BEFORE UPDATE ON host_applications
  FOR EACH ROW
  EXECUTE FUNCTION handle_host_application_approval();
