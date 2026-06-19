"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LogOut, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mergeGuestLearningIntoUser, migrateLegacyLearningKeys } from "@/lib/authLearning";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type AuthUser = {
  email: string | null;
  name: string | null;
};

type AuthNavProps = {
  variant?: "default" | "compact";
};

export function AuthNav({ variant = "default" }: AuthNavProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [message, setMessage] = useState("");
  const compact = variant === "compact";

  useEffect(() => {
    if (!hasSupabaseEnv()) return;
    const supabase = createClient();

    async function loadUser() {
      migrateLegacyLearningKeys();
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (authUser) {
        void mergeGuestLearningIntoUser(authUser.id);
      }
      setUser(authUser ? { email: authUser.email ?? null, name: String(authUser.user_metadata.full_name ?? authUser.user_metadata.name ?? "") || null } : null);
    }

    void loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const authUser = session?.user;
      if (authUser) {
        void mergeGuestLearningIntoUser(authUser.id);
      }
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
      <div className={cn("flex shrink-0 gap-2", compact ? "items-center" : "w-full flex-col sm:w-auto sm:flex-row sm:items-center")}>
        <span className={cn("max-w-40 truncate whitespace-nowrap text-sm font-bold text-slate-600 dark:text-slate-300", compact ? "hidden" : "hidden xl:inline")}>{user.name || user.email}</span>
        <Button asChild variant="secondary" size="sm" className={cn("whitespace-nowrap", compact ? "h-10 rounded-full px-3 text-xs" : "w-full sm:w-auto")}>
          <Link href="/ho-so">
            <UserRound className="h-4 w-4" aria-hidden="true" />
            Hồ sơ
          </Link>
        </Button>
        <Button variant="outline" size="sm" onClick={logout} className={cn("whitespace-nowrap", compact ? "hidden" : "w-full sm:w-auto")}>
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Đăng xuất
        </Button>
        {message && !compact ? <span className="text-xs font-bold text-orange-700 sm:max-w-44">{message}</span> : null}
      </div>
    );
  }

  return (
    <div className={cn("flex shrink-0 gap-2", compact ? "items-center" : "w-full flex-col sm:w-auto sm:flex-row sm:items-center")}>
      <Button asChild variant="secondary" size="sm" className={cn("whitespace-nowrap", compact ? "h-10 rounded-full px-3 text-xs" : "w-full sm:w-auto")}>
        <Link href="/dang-nhap">Đăng nhập</Link>
      </Button>
      <Button asChild size="sm" className={cn("whitespace-nowrap", compact ? "hidden" : "w-full sm:w-auto")}>
        <Link href="/dang-ky">Đăng ký</Link>
      </Button>
    </div>
  );
}
