"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { KeyRound, MailCheck } from "lucide-react";
import { ChamLogo } from "@/components/common/ChamLogo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createClient, missingEnvMessage } from "@/lib/supabase/client";

const resetRequestSuccessMessage =
  "Nếu email hợp lệ, hướng dẫn đặt lại mật khẩu sẽ được gửi đến hộp thư của bạn.";

type ResetMode = "request" | "update";

export default function ResetPasswordPage() {
  const [mode, setMode] = useState<ResetMode>("request");
  const [checkingSession, setCheckingSession] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function prepareResetSession() {
      try {
        const supabase = createClient();
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            console.error("Password reset session error:", error);
            setMessage("Phiên đặt lại mật khẩu không hợp lệ. Vui lòng yêu cầu email mới.");
            return;
          }

          window.history.replaceState({}, "", "/dat-lai-mat-khau");
          setMode("update");
          return;
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) setMode("update");
      } catch {
        setMessage(missingEnvMessage);
      } finally {
        setCheckingSession(false);
      }
    }

    void prepareResetSession();
  }, []);

  async function requestResetEmail(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setSuccess(false);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/dat-lai-mat-khau`,
      });

      if (error) console.error("Password reset request error:", error);
      setSuccess(true);
      setMessage(resetRequestSuccessMessage);
    } catch {
      setMessage(missingEnvMessage);
    } finally {
      setLoading(false);
    }
  }

  async function updatePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setSuccess(false);

    if (!password) {
      setMessage("Vui lòng nhập mật khẩu mới.");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setMessage("Mật khẩu mới cần có ít nhất 8 ký tự.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Mật khẩu xác nhận chưa khớp.");
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        console.error("Password update error:", error);
        setMessage("Không thể cập nhật mật khẩu. Vui lòng mở lại liên kết trong email hoặc yêu cầu email mới.");
        return;
      }

      setSuccess(true);
      setMessage("Mật khẩu đã được cập nhật. Bạn có thể đăng nhập bằng email và mật khẩu mới.");
      setPassword("");
      setConfirmPassword("");
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
            {mode === "request" ? <MailCheck aria-hidden="true" /> : <KeyRound aria-hidden="true" />}
          </div>
          <CardTitle className="text-2xl text-slate-950 dark:text-white sm:text-3xl">Đặt lại mật khẩu</CardTitle>
          <p className="text-sm font-semibold leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
            {mode === "request"
              ? "Nhập email để nhận hướng dẫn đặt hoặc đổi mật khẩu CHẠM."
              : "Nhập mật khẩu mới để tiếp tục sử dụng CHẠM."}
          </p>
        </CardHeader>
        <CardContent className="grid gap-4">
          {checkingSession ? (
            <p className="rounded-2xl bg-blue-50 p-3 font-semibold text-blue-900 dark:bg-blue-500/10 dark:text-blue-100">Đang kiểm tra liên kết đặt lại mật khẩu...</p>
          ) : mode === "request" ? (
            <form className="grid gap-4" onSubmit={requestResetEmail}>
              <label className="grid gap-2">
                <span className="font-bold text-slate-800 dark:text-slate-100">Email</span>
                <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" />
              </label>
              {message ? (
                <p className={`rounded-2xl p-3 font-semibold ${success ? "bg-blue-50 text-blue-900 dark:bg-blue-500/10 dark:text-blue-100" : "bg-orange-50 text-orange-900 dark:bg-orange-500/10 dark:text-orange-100"}`}>
                  {message}
                </p>
              ) : null}
              <Button type="submit" disabled={loading} className="min-h-12 rounded-full">
                {loading ? "Đang gửi..." : "Gửi email đặt lại mật khẩu"}
              </Button>
            </form>
          ) : (
            <form className="grid gap-4" onSubmit={updatePassword}>
              <label className="grid gap-2">
                <span className="font-bold text-slate-800 dark:text-slate-100">Mật khẩu mới</span>
                <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="new-password" />
              </label>
              <label className="grid gap-2">
                <span className="font-bold text-slate-800 dark:text-slate-100">Xác nhận mật khẩu</span>
                <Input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required autoComplete="new-password" />
              </label>
              {message ? (
                <p className={`rounded-2xl p-3 font-semibold ${success ? "bg-blue-50 text-blue-900 dark:bg-blue-500/10 dark:text-blue-100" : "bg-orange-50 text-orange-900 dark:bg-orange-500/10 dark:text-orange-100"}`}>
                  {message}
                </p>
              ) : null}
              <Button type="submit" disabled={loading} className="min-h-12 rounded-full">
                {loading ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
              </Button>
            </form>
          )}

          <Button asChild variant="outline" className="min-h-11 rounded-full">
            <Link href="/dang-nhap">Về trang đăng nhập</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
