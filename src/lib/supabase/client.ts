"use client";

import { createBrowserClient } from "@supabase/ssr";

export const missingEnvMessage = "Thiếu biến môi trường Supabase. Vui lòng kiểm tra Environment Variables trên Vercel hoặc file .env.local khi chạy local.";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error(missingEnvMessage);
  }

  return createBrowserClient(supabaseUrl, supabasePublishableKey);
}

export function hasSupabaseEnv() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY));
}
