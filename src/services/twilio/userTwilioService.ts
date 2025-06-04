import { supabase } from '../supabase/supabase';

export interface UserTwilioConfig {
  account_sid: string;
  auth_token: string;
  api_key: string;
  api_secret: string;
  phone_number: string;
  twiml_app_sid: string;
  is_configured: boolean;
  is_verified: boolean;
}

/**
 * Get the current user's Twilio configuration
 */
export async function getUserTwilioConfig(): Promise<UserTwilioConfig | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_twilio_config')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error || !data || !data.is_configured) {
      return null;
    }

    return data as UserTwilioConfig;
  } catch (error) {
    console.error('Error fetching user Twilio config:', error);
    return null;
  }
}

/**
 * Check if the current user has Twilio configured
 */
export async function hasUserConfiguredTwilio(): Promise<boolean> {
  const config = await getUserTwilioConfig();
  return config !== null && config.is_configured;
}

/**
 * Get the user's Twilio phone number
 */
export async function getUserTwilioPhoneNumber(): Promise<string | null> {
  const config = await getUserTwilioConfig();
  return config?.phone_number || null;
}

/**
 * Get Twilio credentials for API calls
 * This should be used server-side or in secure contexts only
 */
export async function getUserTwilioCredentials(): Promise<{
  accountSid: string;
  authToken: string;
  apiKey: string;
  apiSecret: string;
} | null> {
  const config = await getUserTwilioConfig();
  if (!config) return null;

  return {
    accountSid: config.account_sid,
    authToken: config.auth_token,
    apiKey: config.api_key,
    apiSecret: config.api_secret
  };
}

/**
 * Validate if a phone number belongs to the current user
 */
export async function isUserPhoneNumber(phoneNumber: string): Promise<boolean> {
  const userPhone = await getUserTwilioPhoneNumber();
  if (!userPhone) return false;
  
  // Normalize phone numbers for comparison
  const normalize = (phone: string) => phone.replace(/\D/g, '');
  return normalize(userPhone) === normalize(phoneNumber);
}