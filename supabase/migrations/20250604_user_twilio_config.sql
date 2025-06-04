-- Create table for user-specific Twilio configurations
CREATE TABLE IF NOT EXISTS user_twilio_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Twilio credentials (encrypted in production)
  account_sid TEXT,
  auth_token TEXT,
  api_key TEXT,
  api_secret TEXT,
  phone_number TEXT,
  twiml_app_sid TEXT,
  
  -- Configuration status
  is_configured BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one config per user
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE user_twilio_config ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see/edit their own Twilio config
CREATE POLICY "Users can view own twilio config" ON user_twilio_config
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own twilio config" ON user_twilio_config
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own twilio config" ON user_twilio_config
  FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_user_twilio_config_user_id ON user_twilio_config(user_id);
CREATE INDEX idx_user_twilio_config_phone_number ON user_twilio_config(phone_number);

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_twilio_config_updated_at
  BEFORE UPDATE ON user_twilio_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert your personal Twilio config (replace with your actual user ID)
-- This ensures your 845 number is only associated with your account
-- DO $$
-- BEGIN
--   INSERT INTO user_twilio_config (
--     user_id,
--     account_sid,
--     auth_token,
--     api_key,
--     api_secret,
--     phone_number,
--     twiml_app_sid,
--     is_configured,
--     is_verified
--   ) VALUES (
--     'YOUR_USER_ID_HERE', -- Replace with your actual user ID
--     'YOUR_TWILIO_ACCOUNT_SID',
--     'YOUR_TWILIO_AUTH_TOKEN',
--     'YOUR_TWILIO_API_KEY',
--     'YOUR_TWILIO_API_SECRET',
--     'YOUR_TWILIO_PHONE_NUMBER',
--     'YOUR_TWIML_APP_SID',
--     true,
--     true
--   ) ON CONFLICT (user_id) DO NOTHING;
-- END $$;

-- Create a function to check if user has Twilio configured
CREATE OR REPLACE FUNCTION has_twilio_configured(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM user_twilio_config 
    WHERE user_id = p_user_id 
    AND is_configured = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get user's Twilio phone number
CREATE OR REPLACE FUNCTION get_user_twilio_phone(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_phone_number TEXT;
BEGIN
  SELECT phone_number INTO v_phone_number
  FROM user_twilio_config
  WHERE user_id = p_user_id
  AND is_configured = true;
  
  RETURN v_phone_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;