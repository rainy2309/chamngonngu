"use client";

import { createClient, hasSupabaseEnv, missingEnvMessage } from "@/lib/supabase/client";

export const googleLoginErrorMessage = "Không thể đăng nhập bằng Google. Vui lòng thử lại.";

export function getSiteUrl() {
  const envSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (envSiteUrl) return envSiteUrl.replace(/\/$/, "");

  if (typeof window !== "undefined" && window.location.origin) {
    return window.location.origin;
  }

  return "https://chamngonngu.vercel.app";
}

export async function signInWithGoogle() {
  if (typeof window === "undefined") {
    return { error: googleLoginErrorMessage };
  }

  if (!hasSupabaseEnv()) {
    return { error: missingEnvMessage };
  }

  try {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${getSiteUrl()}/auth/callback?next=/ho-so`,
      },
    });

    if (error) {
      console.error("Google login error:", error);
      return { error: googleLoginErrorMessage };
    }

    return { error: null };
  } catch (error) {
    console.error("Google login error:", error);
    return { error: googleLoginErrorMessage };
  }
}
