import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase/supabase';
import { useAuth } from '../hooks/useAuth';

export type AppMode = 'demo' | 'live';
export type FeatureTier = 'basic' | 'premium';

interface AppModeContextType {
  mode: AppMode;
  featureTier: FeatureTier;
  setMode: (mode: AppMode) => Promise<boolean>;
  setFeatureTier: (tier: FeatureTier) => Promise<boolean>;
  isDemo: boolean;
  isLive: boolean;
  isBasic: boolean;
  isPremium: boolean;
  canAccessLiveMode: boolean;
  canAccessPremiumFeatures: boolean;
  subscriptionTier: string | null;
  subscriptionStatus: 'active' | 'inactive' | 'loading';
  showUpgradeModal: boolean;
  showFeatureUpgradeModal: boolean;
  closeUpgradeModal: () => void;
  closeFeatureUpgradeModal: () => void;
}

const AppModeContext = createContext<AppModeContextType | undefined>(undefined);

export const AppModeProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const { user } = useAuth();
  const [mode, setModeState] = useState<AppMode>('demo');
  const [featureTier, setFeatureTierState] = useState<FeatureTier>('basic');
  const [subscriptionTier, setSubscriptionTier] = useState<string | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<'active' | 'inactive' | 'loading'>('loading');
  const [canAccessLiveMode, setCanAccessLiveMode] = useState(false);
  const [canAccessPremiumFeatures, setCanAccessPremiumFeatures] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showFeatureUpgradeModal, setShowFeatureUpgradeModal] = useState(false);
  
  // Load user's app mode and subscription status
  useEffect(() => {
    const loadUserSettings = async () => {
      if (!user) {
        setModeState('demo');
        setFeatureTierState('basic');
        setSubscriptionStatus('inactive');
        setCanAccessLiveMode(false);
        setCanAccessPremiumFeatures(false);
        return;
      }
      
      setSubscriptionStatus('loading');
      
      try {
        // Get user's subscription
        const { data: subscriptionData, error: subscriptionError } = await supabase
          .from('user_subscriptions')
          .select('subscription_tier, is_active')
          .eq('user_id', user.id)
          .single();
          
        if (subscriptionError && subscriptionError.code !== 'PGRST116') {
          console.error('Error fetching subscription:', subscriptionError);
        }
        
        const hasActiveSubscription = subscriptionData?.is_active || false;
        const tier = subscriptionData?.subscription_tier || 'free';
        setSubscriptionTier(tier);
        setSubscriptionStatus(hasActiveSubscription ? 'active' : 'inactive');
        setCanAccessLiveMode(hasActiveSubscription);
        
        // Determine if user can access premium features based on subscription tier
        const canAccessPremium = hasActiveSubscription && (tier === 'premium' || tier === 'enterprise');
        setCanAccessPremiumFeatures(canAccessPremium);
        
        // Get user's app settings
        const { data: settingsData, error: settingsError } = await supabase
          .from('app_settings')
          .select('app_mode, feature_tier')
          .eq('user_id', user.id)
          .single();
          
        if (settingsError) {
          if (settingsError.code !== 'PGRST116') {
            console.warn('App settings table not accessible, using defaults:', settingsError.message);
          }
        }
        
        // Only set to live mode if user has an active subscription
        const savedMode = settingsData?.app_mode as AppMode;
        const savedFeatureTier = settingsData?.feature_tier as FeatureTier || 'basic';
        
        if (savedMode === 'live' && !hasActiveSubscription) {
          // User doesn't have access to live mode anymore
          setModeState('demo');
          // Update their settings to demo mode
          await supabase
            .from('app_settings')
            .upsert({ 
              user_id: user.id, 
              app_mode: 'demo',
              feature_tier: savedFeatureTier || 'basic'
            });
        } else if (settingsData) {
          setModeState(savedMode);
          setFeatureTierState(savedFeatureTier);
        } else {
          // Create default settings for new user
          await supabase
            .from('app_settings')
            .insert({ 
              user_id: user.id, 
              app_mode: 'demo',
              feature_tier: 'basic'
            });
        }
        
        // If user doesn't have premium access but has premium tier set, downgrade to basic
        if (savedFeatureTier === 'premium' && !canAccessPremium) {
          setFeatureTierState('basic');
          if (user) {
            await supabase
              .from('app_settings')
              .upsert({ 
                user_id: user.id, 
                feature_tier: 'basic' 
              });
          }
        }
      } catch (error) {
        console.error('Error loading user settings:', error);
        setModeState('demo');
        setSubscriptionStatus('inactive');
        setCanAccessLiveMode(false);
      }
    };
    
    loadUserSettings();
  }, [user]);
  
  // Function to change mode with subscription check
  const setMode = async (newMode: AppMode): Promise<boolean> => {
    if (newMode === 'live' && !canAccessLiveMode) {
      setShowUpgradeModal(true);
      return false;
    }
    
    setModeState(newMode);
    
    // Save user's preference if logged in
    if (user) {
      try {
        await supabase
          .from('app_settings')
          .upsert({ 
            user_id: user.id, 
            app_mode: newMode 
          });
        return true;
      } catch (error) {
        console.error('Error saving app mode:', error);
        return false;
      }
    }
    
    return true;
  };
  
  // Function to change feature tier with subscription check
  const setFeatureTier = async (newTier: FeatureTier): Promise<boolean> => {
    if (newTier === 'premium' && !canAccessPremiumFeatures) {
      setShowFeatureUpgradeModal(true);
      return false;
    }
    
    setFeatureTierState(newTier);
    
    // Save user's preference if logged in
    if (user) {
      try {
        await supabase
          .from('app_settings')
          .upsert({ 
            user_id: user.id, 
            feature_tier: newTier 
          });
        return true;
      } catch (error) {
        console.error('Error saving feature tier:', error);
        return false;
      }
    }
    
    return true;
  };
  
  const closeUpgradeModal = () => {
    setShowUpgradeModal(false);
  };
  
  const closeFeatureUpgradeModal = () => {
    setShowFeatureUpgradeModal(false);
  };
  
  const value = {
    mode,
    featureTier,
    setMode,
    setFeatureTier,
    isDemo: mode === 'demo',
    isLive: mode === 'live',
    isBasic: featureTier === 'basic',
    isPremium: featureTier === 'premium',
    canAccessLiveMode,
    canAccessPremiumFeatures,
    subscriptionTier,
    subscriptionStatus,
    showUpgradeModal,
    showFeatureUpgradeModal,
    closeUpgradeModal,
    closeFeatureUpgradeModal
  };
  
  return (
    <AppModeContext.Provider value={value}>
      {children}
    </AppModeContext.Provider>
  );
};

export const useAppMode = (): AppModeContextType => {
  const context = useContext(AppModeContext);
  if (context === undefined) {
    throw new Error('useAppMode must be used within an AppModeProvider');
  }
  return context;
};
