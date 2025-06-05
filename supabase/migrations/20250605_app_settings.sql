-- Create app_settings table for user preferences
CREATE TABLE IF NOT EXISTS public.app_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  app_mode TEXT NOT NULL DEFAULT 'demo' CHECK (app_mode IN ('demo', 'live')),
  feature_tier TEXT NOT NULL DEFAULT 'basic' CHECK (feature_tier IN ('basic', 'advanced', 'custom')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create index for faster lookups
CREATE INDEX idx_app_settings_user_id ON public.app_settings(user_id);

-- Enable RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage their own settings
CREATE POLICY "Users can view own app settings" ON public.app_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own app settings" ON public.app_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own app settings" ON public.app_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own app settings" ON public.app_settings
  FOR DELETE USING (auth.uid() = user_id);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_app_settings_updated_at BEFORE UPDATE
  ON public.app_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant access to authenticated users
GRANT ALL ON public.app_settings TO authenticated;
GRANT ALL ON public.app_settings TO service_role;