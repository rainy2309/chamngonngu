"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { ChamLogo } from "@/components/common/ChamLogo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { googleLoginErrorMessage, signInWithGoogle } from "@/lib/auth";
import { createClient, missingEnvMessage } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    async function checkSession() {
      try {
        const params = new URLSearchParams(window.location.search);
        if (params.get("error") === "oauth") setMessage(googleLoginErrorMessage);
        if (params.get("message") === "protected") setMessage("Bạn cần đăng nhập để sử dụng tính năng này.");
        if (params.get("message") === "missing-env") setMessage(missingEnvMessage);

        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) router.replace("/dashboard");
      } catch {
        setMessage(missingEnvMessage);
      }
    }
    void checkSession();
  }, [router]);

  async function loginWithGoogle() {
    setGoogleLoading(true);
    setMessage("");
    const result = await signInWithGoogle();
    if (result.error) {
      setMessage(result.error);
      setGoogleLoading(false);
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage("Không thể đăng nhập. Vui lòng kiểm tra email hoặc mật khẩu.");
        return;
      }
      router.replace("/dashboard");
      router.refresh();
    } catch {
      setMessage(missingEnvMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid flex-1 place-items-center bg-gradient-to-b from-blue-50 to-white px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <Card className="w-full max-w-xl rounded-[1.75rem] border-blue-100 shadow-xl shadow-blue-100/60 sm:rounded-[2rem]">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex items-center justify-center gap-3">
            <ChamLogo />
            <span className="text-3xl font-black text-blue-700">CHẠM</span>
          </div>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
            <LogIn aria-hidden="true" />
          </div>
          <CardTitle className="text-2xl sm:text-3xl">Đăng nhập CHẠM</CardTitle>
          <p className="text-sm font-semibold leading-7 text-slate-600 sm:text-base">Tiếp tục học ký hiệu và lưu tiến độ của bạn.</p>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Button type="button" variant="outline" disabled={googleLoading || loading} onClick={loginWithGoogle} className="min-h-12 w-full rounded-2xl border border-slate-200 bg-white font-black hover:bg-blue-50">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-white text-lg font-black text-blue-700 ring-1 ring-slate-200">G</span>
            {googleLoading ? "Đang chuyển đến Google..." : "Đăng nhập bằng Google"}
          </Button>

          <div className="flex items-center gap-3 text-sm font-bold text-slate-500">
            <span className="h-px flex-1 bg-slate-200" />
            hoặc đăng nhập bằng email
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <form className="grid gap-4" onSubmit={onSubmit}>
            <label className="grid gap-2">
              <span className="font-bold text-slate-800">Email</span>
              <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" />
            </label>
            <label className="grid gap-2">
              <span className="font-bold text-slate-800">Mật khẩu</span>
              <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" />
            </label>
            {message ? <p className="rounded-2xl bg-orange-50 p-3 font-semibold text-orange-900">{message}</p> : null}
            <Button type="submit" disabled={loading || googleLoading} className="min-h-12 rounded-full">
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
            <p className="text-center text-sm text-slate-600 sm:text-base">
              Chưa có tài khoản?{" "}
              <Link href="/dang-ky" className="font-bold text-blue-700 hover:text-blue-900">
                Đăng ký
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
