"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { ChamLogo } from "@/components/common/ChamLogo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getSiteUrl } from "@/lib/auth";
import { createClient, missingEnvMessage } from "@/lib/supabase/client";

const resetRequestSuccessMessage =
  "Nếu email tồn tại trong hệ thống, CHẠM đã gửi hướng dẫn đặt lại mật khẩu.";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const error = new URLSearchParams(window.location.search).get("error");
    if (error === "expired_recovery") {
      setMessage("Liên kết đặt lại mật khẩu đã hết hạn hoặc không hợp lệ. Vui lòng yêu cầu email mới.");
      setSuccess(false);
    }
  }, []);

  async function requestResetEmail(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setSuccess(false);

    if (!email.trim()) {
      setMessage("Vui lòng nhập email để nhận hướng dẫn đặt lại mật khẩu.");
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${getSiteUrl()}/auth/callback?next=/cap-nhat-mat-khau`,
      });

      if (error) {
        console.error("Password reset request error:", error);
        setMessage("Không thể gửi email đặt lại mật khẩu. Vui lòng thử lại.");
        return;
      }

      setSuccess(true);
      setMessage(resetRequestSuccessMessage);
    } catch {
      setMessage(missingEnvMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid flex-1 place-items-center bg-gradient-to-b from-blue-50 to-white px-4 py-8 dark:from-slate-950 dark:to-slate-900 sm:px-6 sm:py-12 lg:px-8">
      <Card className="w-full max-w-xl rounded-[1.75rem] border-blue-100 bg-white shadow-xl shadow-blue-100/60 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none sm:rounded-[2rem]">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex items-center justify-center gap-3">
            <ChamLogo className="h-14 w-14" />
            <span className="pt-1 text-3xl font-black text-[#2EAFFF]">CHẠM</span>
          </div>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
            <MailCheck aria-hidden="true" />
          </div>
          <CardTitle className="text-2xl text-slate-950 dark:text-white sm:text-3xl">Đặt lại mật khẩu</CardTitle>
          <p className="text-sm font-semibold leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
            Nhập email để nhận hướng dẫn đặt lại mật khẩu CHẠM.
          </p>
        </CardHeader>
        <CardContent className="grid gap-4">
          <form className="grid gap-4" onSubmit={requestResetEmail}>
            <label className="grid gap-2">
              <span className="font-bold text-slate-800 dark:text-slate-100">Email</span>
              <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" />
            </label>
            {message ? (
              <p
                className={`rounded-2xl p-3 font-semibold ${
                  success
                    ? "bg-blue-50 text-blue-900 dark:bg-blue-500/10 dark:text-blue-100"
                    : "bg-orange-50 text-orange-900 dark:bg-orange-500/10 dark:text-orange-100"
                }`}
              >
                {message}
              </p>
            ) : null}
            <Button type="submit" disabled={loading} className="min-h-12 rounded-full">
              {loading ? "Đang gửi..." : "Gửi email đặt lại mật khẩu"}
            </Button>
          </form>

          <Button asChild variant="outline" className="min-h-11 rounded-full">
            <Link href="/dang-nhap">Về trang đăng nhập</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
