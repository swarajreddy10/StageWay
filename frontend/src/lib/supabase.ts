import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  SUPABASE_ANON_KEY,
  SUPABASE_ANON_KEY_ENV,
  SUPABASE_URL,
  SUPABASE_URL_ENV,
} from "@/lib/env";

const supabaseUrl = SUPABASE_URL;
const supabaseAnonKey = SUPABASE_ANON_KEY;

const missingConfigMessage = `Missing Supabase configuration. Set ${SUPABASE_URL_ENV} and ${SUPABASE_ANON_KEY_ENV}.`;

const createSupabaseClient = (): SupabaseClient => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return new Proxy(
      {},
      {
        get() {
          throw new Error(missingConfigMessage);
        },
      }
    ) as SupabaseClient;
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
};

export const supabase = createSupabaseClient();
