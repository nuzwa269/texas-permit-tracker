import { createClient } from '@supabase/supabase-js';

// Uses the service-role key — bypasses RLS.
// ONLY import this in server-side code (Route Handlers, Server Actions).
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
