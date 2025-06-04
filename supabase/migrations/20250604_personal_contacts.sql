-- Create a separate personal contacts table for CSV imports
-- This table is completely isolated from the main CRM contacts system

CREATE TABLE IF NOT EXISTS personal_contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic contact info (common CSV fields)
  first_name TEXT,
  last_name TEXT,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  mobile TEXT,
  work_phone TEXT,
  
  -- Address fields
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT,
  
  -- Professional info
  company TEXT,
  job_title TEXT,
  department TEXT,
  website TEXT,
  linkedin TEXT,
  
  -- Additional fields
  notes TEXT,
  tags TEXT[],
  source TEXT, -- e.g., 'csv_import', 'manual', etc.
  import_batch_id TEXT, -- to track which CSV import this came from
  
  -- Custom fields for any additional CSV columns
  custom_data JSONB,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prevent duplicate imports
  UNIQUE(user_id, email),
  UNIQUE(user_id, phone)
);

-- Enable RLS for complete privacy
ALTER TABLE personal_contacts ENABLE ROW LEVEL SECURITY;

-- Create strict RLS policies - users can ONLY see their own contacts
CREATE POLICY "Users can view own personal contacts" ON personal_contacts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own personal contacts" ON personal_contacts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own personal contacts" ON personal_contacts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own personal contacts" ON personal_contacts
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_personal_contacts_user_id ON personal_contacts(user_id);
CREATE INDEX idx_personal_contacts_email ON personal_contacts(user_id, email);
CREATE INDEX idx_personal_contacts_name ON personal_contacts(user_id, last_name, first_name);
CREATE INDEX idx_personal_contacts_company ON personal_contacts(user_id, company);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_personal_contacts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_personal_contacts_updated_at
  BEFORE UPDATE ON personal_contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_personal_contacts_updated_at();

-- Create a view for easier querying with full name
CREATE OR REPLACE VIEW personal_contacts_view AS
SELECT 
  *,
  COALESCE(full_name, CONCAT(first_name, ' ', last_name)) as display_name
FROM personal_contacts;

-- Grant access to the view
GRANT SELECT ON personal_contacts_view TO authenticated;

-- Create import history table to track CSV uploads
CREATE TABLE IF NOT EXISTS personal_contacts_import_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  batch_id TEXT NOT NULL,
  file_name TEXT,
  total_rows INTEGER,
  imported_rows INTEGER,
  failed_rows INTEGER,
  error_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on import history
ALTER TABLE personal_contacts_import_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for import history
CREATE POLICY "Users can view own import history" ON personal_contacts_import_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own import history" ON personal_contacts_import_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to safely import contacts (handles duplicates)
CREATE OR REPLACE FUNCTION import_personal_contact(
  p_user_id UUID,
  p_contact JSONB
) RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  -- Try to insert or update the contact
  INSERT INTO personal_contacts (
    user_id,
    first_name,
    last_name,
    full_name,
    email,
    phone,
    mobile,
    work_phone,
    address_line1,
    address_line2,
    city,
    state,
    zip_code,
    country,
    company,
    job_title,
    department,
    website,
    linkedin,
    notes,
    tags,
    source,
    import_batch_id,
    custom_data
  ) VALUES (
    p_user_id,
    p_contact->>'first_name',
    p_contact->>'last_name',
    p_contact->>'full_name',
    p_contact->>'email',
    p_contact->>'phone',
    p_contact->>'mobile',
    p_contact->>'work_phone',
    p_contact->>'address_line1',
    p_contact->>'address_line2',
    p_contact->>'city',
    p_contact->>'state',
    p_contact->>'zip_code',
    p_contact->>'country',
    p_contact->>'company',
    p_contact->>'job_title',
    p_contact->>'department',
    p_contact->>'website',
    p_contact->>'linkedin',
    p_contact->>'notes',
    ARRAY(SELECT jsonb_array_elements_text(COALESCE(p_contact->'tags', '[]'::jsonb))),
    COALESCE(p_contact->>'source', 'csv_import'),
    p_contact->>'import_batch_id',
    p_contact->'custom_data'
  )
  ON CONFLICT (user_id, email) 
  DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    full_name = EXCLUDED.full_name,
    phone = COALESCE(EXCLUDED.phone, personal_contacts.phone),
    mobile = COALESCE(EXCLUDED.mobile, personal_contacts.mobile),
    work_phone = COALESCE(EXCLUDED.work_phone, personal_contacts.work_phone),
    company = COALESCE(EXCLUDED.company, personal_contacts.company),
    job_title = COALESCE(EXCLUDED.job_title, personal_contacts.job_title),
    custom_data = personal_contacts.custom_data || EXCLUDED.custom_data,
    updated_at = NOW()
  RETURNING jsonb_build_object('success', true, 'id', id) INTO v_result;
  
  RETURN v_result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;