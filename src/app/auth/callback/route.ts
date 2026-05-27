import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function safeNextPath(next: string | null) {
  if (!next) return "/ho-so";
  if (!next.startsWith("/") || next.startsWith("//")) return "/ho-so";
  return next;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = safeNextPath(requestUrl.searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(new URL("/dang-nhap?error=oauth", request.url));
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("OAuth callback error:", error);
      return NextResponse.redirect(new URL("/dang-nhap?error=oauth", request.url));
    }

    return NextResponse.redirect(new URL(next, request.url));
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect(new URL("/dang-nhap?error=oauth", request.url));
  }
}
