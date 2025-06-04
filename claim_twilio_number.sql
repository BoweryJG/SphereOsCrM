-- First, check if the user_twilio_config table exists
-- If not, run the migration first from: supabase/migrations/20250604_user_twilio_config.sql

-- Replace 'YOUR_USER_ID_HERE' with your actual user ID from Supabase Auth
-- Example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'

INSERT INTO user_twilio_config (
  user_id,
  account_sid,
  auth_token,
  api_key,
  api_secret,
  phone_number,
  twiml_app_sid,
  is_configured,
  is_verified
) VALUES (
  '5fe37075-c2f5-4acd-abef-1ef15d0c1ffd', -- Your user ID
  'YOUR_TWILIO_ACCOUNT_SID',
  'YOUR_TWILIO_AUTH_TOKEN',
  'YOUR_TWILIO_API_KEY',
  'YOUR_TWILIO_API_SECRET',
  'YOUR_TWILIO_PHONE_NUMBER',
  'YOUR_TWIML_APP_SID',
  true,
  true
) 
ON CONFLICT (user_id) 
DO UPDATE SET
  account_sid = EXCLUDED.account_sid,
  auth_token = EXCLUDED.auth_token,
  api_key = EXCLUDED.api_key,
  api_secret = EXCLUDED.api_secret,
  phone_number = EXCLUDED.phone_number,
  twiml_app_sid = EXCLUDED.twiml_app_sid,
  is_configured = EXCLUDED.is_configured,
  is_verified = EXCLUDED.is_verified,
  updated_at = NOW();

-- Verify it was inserted correctly
SELECT 
  user_id,
  phone_number,
  is_configured,
  created_at,
  updated_at
FROM user_twilio_config
WHERE phone_number = 'YOUR_TWILIO_PHONE_NUMBER';