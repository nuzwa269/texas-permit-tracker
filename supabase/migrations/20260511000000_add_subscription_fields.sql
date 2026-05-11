-- Adds subscription fields to the profiles table
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_subscribed BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS subscription_status TEXT NOT NULL DEFAULT 'inactive';

-- Index for fast subscription lookups
CREATE INDEX IF NOT EXISTS idx_profiles_is_subscribed ON profiles (is_subscribed);

COMMENT ON COLUMN profiles.is_subscribed IS 'True when the user has an active paid subscription';
COMMENT ON COLUMN profiles.subscription_status IS 'LemonSqueezy subscription status: inactive | active | on_trial | paused | cancelled | expired';
