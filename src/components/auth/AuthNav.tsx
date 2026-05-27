"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LogOut, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/client";

type AuthUser = {
  email: string | null;
  name: string | null;
};

export function AuthNav() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!hasSupabaseEnv()) return;
    const supabase = createClient();

    async function loadUser() {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      setUser(authUser ? { email: authUser.email ?? null, name: String(authUser.user_metadata.full_name ?? "") || null } : null);
    }

    void loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const authUser = session?.user;
      setUser(authUser ? { email: authUser.email ?? null, name: String(authUser.user_metadata.full_name ?? "") || null } : null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function logout() {
    setMessage("");
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();
      if (error) {
        setMessage("Không thể đăng xuất. Vui lòng thử lại.");
        return;
      }
      window.location.href = "/dang-nhap";
    } catch {
      setMessage("Không thể đăng xuất. Vui lòng thử lại.");
    }
  }

  if (user) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <span className="hidden max-w-40 truncate text-sm font-bold text-slate-600 xl:inline">{user.name || user.email}</span>
        <Button asChild variant="secondary" size="sm">
          <Link href="/ho-so">
            <UserRound className="h-4 w-4" aria-hidden="true" />
            Hồ sơ
          </Link>
        </Button>
        <Button variant="outline" size="sm" onClick={logout}>
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Đăng xuất
        </Button>
        {message ? <span className="text-xs font-bold text-orange-700">{message}</span> : null}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button asChild variant="secondary" size="sm">
        <Link href="/dang-nhap">Đăng nhập</Link>
      </Button>
      <Button asChild size="sm">
        <Link href="/dang-ky">Đăng ký</Link>
      </Button>
    </div>
  );
}
