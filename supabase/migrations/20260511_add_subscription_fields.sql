-- ============================================================
-- Migration: add subscription fields to profiles table
-- Run this in the Supabase SQL Editor or via the CLI:
--   supabase db push
-- ============================================================

-- 1. Add is_subscribed flag (default FALSE = trial / free user)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_subscribed BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Add subscription_status for granular state tracking
--    Possible values: 'trial' | 'active' | 'past_due' | 'cancelled' | 'expired'
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS subscription_status TEXT NOT NULL DEFAULT 'trial';

-- 3. Optional but recommended: store which plan the user is on
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS subscription_plan TEXT;  -- 'starter' | 'pro' | NULL

-- 4. Optional: track when the current period ends (for grace-period logic)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS subscription_period_end TIMESTAMPTZ;

-- 5. Add a check constraint so only valid statuses can be stored
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_subscription_status_check
  CHECK (subscription_status IN ('trial', 'active', 'past_due', 'cancelled', 'expired'));

-- 6. Index for quick paywall lookups (e.g. middleware or server components)
CREATE INDEX IF NOT EXISTS idx_profiles_is_subscribed
  ON public.profiles (is_subscribed);

-- ============================================================
-- Rollback (run manually if you need to revert):
-- ============================================================
-- ALTER TABLE public.profiles
--   DROP COLUMN IF EXISTS is_subscribed,
--   DROP COLUMN IF EXISTS subscription_status,
--   DROP COLUMN IF EXISTS subscription_plan,
--   DROP COLUMN IF EXISTS subscription_period_end;
-- DROP INDEX IF EXISTS idx_profiles_is_subscribed;
