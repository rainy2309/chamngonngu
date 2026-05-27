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
      setUser(authUser ? { email: authUser.email ?? null, name: String(authUser.user_metadata.full_name ?? authUser.user_metadata.name ?? "") || null } : null);
    }

    void loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const authUser = session?.user;
      setUser(authUser ? { email: authUser.email ?? null, name: String(authUser.user_metadata.full_name ?? authUser.user_metadata.name ?? "") || null } : null);
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
      <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
        <span className="hidden max-w-40 truncate whitespace-nowrap text-sm font-bold text-slate-600 xl:inline">{user.name || user.email}</span>
        <Button asChild variant="secondary" size="sm" className="w-full whitespace-nowrap sm:w-auto">
          <Link href="/ho-so">
            <UserRound className="h-4 w-4" aria-hidden="true" />
            Hồ sơ
          </Link>
        </Button>
        <Button variant="outline" size="sm" onClick={logout} className="w-full whitespace-nowrap sm:w-auto">
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Đăng xuất
        </Button>
        {message ? <span className="text-xs font-bold text-orange-700 sm:max-w-44">{message}</span> : null}
      </div>
    );
  }

  return (
    <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
      <Button asChild variant="secondary" size="sm" className="w-full whitespace-nowrap sm:w-auto">
        <Link href="/dang-nhap">Đăng nhập</Link>
      </Button>
      <Button asChild size="sm" className="w-full whitespace-nowrap sm:w-auto">
        <Link href="/dang-ky">Đăng ký</Link>
      </Button>
    </div>
  );
}
