import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function safeNextPath(next: string | null) {
  if (!next) return "/";
  if (!next.startsWith("/") || next.startsWith("//")) return "/";
  return next;
}

function callbackErrorRedirect(next: string, requestUrl: string) {
  const fallbackPath = next === "/cap-nhat-mat-khau" ? "/dat-lai-mat-khau?error=expired_recovery" : "/dang-nhap?error=oauth";
  return NextResponse.redirect(new URL(fallbackPath, requestUrl));
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = safeNextPath(requestUrl.searchParams.get("next"));

  if (!code) {
    return callbackErrorRedirect(next, request.url);
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("OAuth callback error:", error);
      return callbackErrorRedirect(next, request.url);
    }

    return NextResponse.redirect(new URL(next, request.url));
  } catch (error) {
    console.error("OAuth callback error:", error);
    return callbackErrorRedirect(next, request.url);
  }
}
