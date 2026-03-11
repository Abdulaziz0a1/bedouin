import { createBrowserClient } from "@supabase/ssr";

/**
 * Bedouin – Supabase browser client
 *
 * Use this in any Client Component ("use client") or in the AuthProvider.
 * createBrowserClient handles its own singleton internally — calling this
 * function multiple times is safe and returns a stable client instance.
 *
 * Auth:  supabase.auth.signInWithPassword / signUp / signOut / getSession
 * DB:    supabase.from("listings").select("*").eq("status", "approved")
 * Files: supabase.storage.from("listing-images").upload(path, file)
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
