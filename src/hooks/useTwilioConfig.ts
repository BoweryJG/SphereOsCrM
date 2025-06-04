import { useState, useEffect } from 'react';
import { useAuth } from '../auth';
import { getUserTwilioConfig, UserTwilioConfig } from '../services/twilio/userTwilioService';

interface TwilioConfigState {
  config: UserTwilioConfig | null;
  isConfigured: boolean;
  isLoading: boolean;
  error: string | null;
  phoneNumber: string | null;
  refetch: () => Promise<void>;
}

export function useTwilioConfig(): TwilioConfigState {
  const { user } = useAuth();
  const [config, setConfig] = useState<UserTwilioConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = async () => {
    if (!user) {
      setConfig(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const userConfig = await getUserTwilioConfig();
      setConfig(userConfig);
    } catch (err) {
      console.error('Error fetching Twilio config:', err);
      setError('Failed to load Twilio configuration');
      setConfig(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, [user]);

  return {
    config,
    isConfigured: config?.is_configured || false,
    isLoading,
    error,
    phoneNumber: config?.phone_number || null,
    refetch: fetchConfig
  };
}