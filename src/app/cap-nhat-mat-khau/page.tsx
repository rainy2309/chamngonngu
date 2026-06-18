"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, KeyRound } from "lucide-react";
import { ChamLogo } from "@/components/common/ChamLogo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PasswordInput } from "@/components/ui/password-input";
import { createClient, missingEnvMessage } from "@/lib/supabase/client";

const invalidRecoveryMessage =
  "Liên kết đặt lại mật khẩu đã hết hạn hoặc không hợp lệ. Vui lòng yêu cầu email mới.";

export default function UpdatePasswordPage() {
  const [checkingSession, setCheckingSession] = useState(true);
  const [recoveryReady, setRecoveryReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function prepareRecoverySession() {
      try {
        const supabase = createClient();
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
          if (!mounted) return;
          if (event === "PASSWORD_RECOVERY" && session) {
            setRecoveryReady(true);
            setMessage("");
          }
        });

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Password recovery session error:", error);
          if (mounted) setMessage(invalidRecoveryMessage);
          return () => subscription.unsubscribe();
        }

        if (mounted && session) setRecoveryReady(true);
        return () => subscription.unsubscribe();
      } catch {
        if (mounted) setMessage(missingEnvMessage);
        return undefined;
      } finally {
        if (mounted) setCheckingSession(false);
      }
    }

    let cleanup: (() => void) | undefined;
    void prepareRecoverySession().then((cleanupFn) => {
      cleanup = cleanupFn;
    });

    return () => {
      mounted = false;
      cleanup?.();
    };
  }, []);

  async function updatePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setSuccess(false);

    if (!recoveryReady) {
      setMessage(invalidRecoveryMessage);
      setLoading(false);
      return;
    }

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
        setMessage("Không thể cập nhật mật khẩu. Vui lòng thử lại.");
        return;
      }

      setSuccess(true);
      setMessage("Mật khẩu đã được cập nhật thành công.");
      setPassword("");
      setConfirmPassword("");
    } catch {
      setMessage(missingEnvMessage);
    } finally {
      setLoading(false);
    }
  }

  const showInvalidState = !checkingSession && !recoveryReady && !success;

  return (
    <main className="grid flex-1 place-items-center bg-gradient-to-b from-blue-50 to-white px-4 py-8 dark:from-slate-950 dark:to-slate-900 sm:px-6 sm:py-12 lg:px-8">
      <Card className="w-full max-w-xl rounded-[1.75rem] border-blue-100 bg-white shadow-xl shadow-blue-100/60 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none sm:rounded-[2rem]">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex items-center justify-center gap-3">
            <ChamLogo className="h-14 w-14" />
            <span className="pt-1 text-3xl font-black text-[#2EAFFF]">CHẠM</span>
          </div>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
            {success ? <CheckCircle2 aria-hidden="true" /> : showInvalidState ? <AlertCircle aria-hidden="true" /> : <KeyRound aria-hidden="true" />}
          </div>
          <CardTitle className="text-2xl text-slate-950 dark:text-white sm:text-3xl">Tạo mật khẩu mới</CardTitle>
          <p className="text-sm font-semibold leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
            Nhập mật khẩu mới cho tài khoản CHẠM của bạn.
          </p>
        </CardHeader>
        <CardContent className="grid gap-4">
          {checkingSession ? (
            <p className="rounded-2xl bg-blue-50 p-3 font-semibold text-blue-900 dark:bg-blue-500/10 dark:text-blue-100">
              Đang kiểm tra liên kết đặt lại mật khẩu...
            </p>
          ) : showInvalidState ? (
            <div className="grid gap-4">
              <p className="rounded-2xl bg-orange-50 p-3 font-semibold text-orange-900 dark:bg-orange-500/10 dark:text-orange-100">
                {message || invalidRecoveryMessage}
              </p>
              <Button asChild className="min-h-12 rounded-full">
                <Link href="/dat-lai-mat-khau">Gửi lại email đặt lại mật khẩu</Link>
              </Button>
            </div>
          ) : (
            <form className="grid gap-4" onSubmit={updatePassword}>
              <label className="grid gap-2">
                <span className="font-bold text-slate-800 dark:text-slate-100">Mật khẩu mới</span>
                <PasswordInput value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="new-password" />
              </label>
              <label className="grid gap-2">
                <span className="font-bold text-slate-800 dark:text-slate-100">Nhập lại mật khẩu</span>
                <PasswordInput value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required autoComplete="new-password" />
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
              <Button type="submit" disabled={loading || success} className="min-h-12 rounded-full">
                {loading ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
              </Button>
            </form>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <Button asChild variant="outline" className="min-h-11 rounded-full">
              <Link href="/dang-nhap">Đăng nhập</Link>
            </Button>
            <Button asChild variant="outline" className="min-h-11 rounded-full">
              <Link href="/ho-so">Về hồ sơ</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
