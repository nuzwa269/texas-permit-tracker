-- ============================================================
-- Migration: profiles table + subscription fields
-- Run this in the Supabase SQL Editor or via the CLI:
--   supabase db push
--
-- Safe to run more than once (all statements are idempotent).
-- ============================================================

-- 1. Create the profiles table if it doesn't already exist.
--    One row per auth.users row — auto-populated by the trigger below.
CREATE TABLE IF NOT EXISTS public.profiles (
  id                      UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email                   TEXT,
  full_name               TEXT,
  -- Subscription fields
  is_subscribed           BOOLEAN     NOT NULL DEFAULT FALSE,
  subscription_status     TEXT        NOT NULL DEFAULT 'trial',
  subscription_plan       TEXT,           -- 'starter' | 'pro' | NULL
  subscription_period_end TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. If the table already existed, add the subscription columns safely.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_subscribed           BOOLEAN     NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS subscription_status     TEXT        NOT NULL DEFAULT 'trial',
  ADD COLUMN IF NOT EXISTS subscription_plan       TEXT,
  ADD COLUMN IF NOT EXISTS subscription_period_end TIMESTAMPTZ;

-- 3. Check constraint — only valid statuses allowed.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_subscription_status_check'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_subscription_status_check
      CHECK (subscription_status IN ('trial', 'active', 'past_due', 'cancelled', 'expired'));
  END IF;
END$$;

-- 4. Index for quick paywall lookups.
CREATE INDEX IF NOT EXISTS idx_profiles_is_subscribed
  ON public.profiles (is_subscribed);

-- 5. Keep updated_at current on every UPDATE.
CREATE OR REPLACE FUNCTION public.set_profiles_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.set_profiles_updated_at();

-- ============================================================
-- 6. Row Level Security
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'profiles' AND policyname = 'profiles: select own'
  ) THEN
    CREATE POLICY "profiles: select own"
      ON public.profiles FOR SELECT
      USING (auth.uid() = id);
  END IF;
END$$;

-- Users can update their own profile (but NOT is_subscribed — that's server-only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'profiles' AND policyname = 'profiles: update own'
  ) THEN
    CREATE POLICY "profiles: update own"
      ON public.profiles FOR UPDATE
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;
END$$;

-- ============================================================
-- 7. Auto-create a profile row whenever a new user signs up.
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================
-- Rollback (run manually if you need to revert everything):
-- ============================================================
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- DROP FUNCTION IF EXISTS public.handle_new_user();
-- DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
-- DROP FUNCTION IF EXISTS public.set_profiles_updated_at();
-- DROP TABLE IF EXISTS public.profiles;
