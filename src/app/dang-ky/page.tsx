"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { ChamLogo } from "@/components/common/ChamLogo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { signInWithGoogle } from "@/lib/auth";
import { createClient, missingEnvMessage } from "@/lib/supabase/client";

type Role = "learner" | "supporter" | "teacher";

const roles: { value: Role; label: string }[] = [
  { value: "learner", label: "Người học" },
  { value: "supporter", label: "Người hỗ trợ" },
  { value: "teacher", label: "Giáo viên / chuyên môn" },
];

function signupErrorMessage(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes("email rate limit exceeded")) {
    return "Supabase đang giới hạn số email đăng ký. Vui lòng thử lại sau hoặc tắt xác nhận email trong Supabase Auth để demo.";
  }
  return "Không thể tạo tài khoản. Vui lòng kiểm tra thông tin và thử lại.";
}

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<Role>("learner");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    async function checkSession() {
      try {
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

  async function continueWithGoogle() {
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
    setMessage("");

    if (password.length < 6) {
      setMessage("Mật khẩu cần có ít nhất 6 ký tự.");
      return;
    }
    if (password !== confirmPassword) {
      setMessage("Mật khẩu xác nhận chưa khớp.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/ho-so`,
          data: { full_name: fullName, role },
        },
      });

      if (error) {
        console.error("Signup error:", error);
        setMessage(signupErrorMessage(error.message));
        return;
      }
      if (data.session) {
        router.replace("/dashboard");
        router.refresh();
        return;
      }
      setMessage("Tài khoản đã được tạo. Vui lòng kiểm tra email xác nhận nếu hệ thống yêu cầu.");
    } catch (error) {
      console.error("Signup error:", error);
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
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
            <UserPlus aria-hidden="true" />
          </div>
          <CardTitle className="text-2xl sm:text-3xl">Tạo tài khoản CHẠM</CardTitle>
          <p className="text-sm font-semibold leading-7 text-slate-600 sm:text-base">Lưu từ yêu thích, tiến độ học và điểm quiz.</p>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Button type="button" variant="outline" disabled={googleLoading || loading} onClick={continueWithGoogle} className="min-h-12 w-full rounded-2xl border border-slate-200 bg-white font-black hover:bg-blue-50">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-white text-lg font-black text-blue-700 ring-1 ring-slate-200">G</span>
            {googleLoading ? "Đang chuyển đến Google..." : "Tiếp tục với Google"}
          </Button>

          <div className="flex items-center gap-3 text-sm font-bold text-slate-500">
            <span className="h-px flex-1 bg-slate-200" />
            hoặc tạo tài khoản bằng email
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <form className="grid gap-4" onSubmit={onSubmit}>
            <label className="grid gap-2">
              <span className="font-bold text-slate-800">Họ tên</span>
              <Input value={fullName} onChange={(event) => setFullName(event.target.value)} required autoComplete="name" />
            </label>
            <label className="grid gap-2">
              <span className="font-bold text-slate-800">Email</span>
              <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" />
            </label>
            <label className="grid gap-2">
              <span className="font-bold text-slate-800">Mật khẩu</span>
              <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="new-password" />
            </label>
            <label className="grid gap-2">
              <span className="font-bold text-slate-800">Nhập lại mật khẩu</span>
              <Input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required autoComplete="new-password" />
            </label>
            <label className="grid gap-2">
              <span className="font-bold text-slate-800">Vai trò</span>
              <select value={role} onChange={(event) => setRole(event.target.value as Role)} className="min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-base font-semibold text-slate-900 outline-none focus:ring-4 focus:ring-blue-100">
                {roles.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            {message ? <p className="rounded-2xl bg-blue-50 p-3 font-semibold text-blue-900">{message}</p> : null}
            <Button type="submit" disabled={loading || googleLoading} className="min-h-12 rounded-full">
              {loading ? "Đang tạo tài khoản..." : "Đăng ký"}
            </Button>
            <p className="text-center text-sm text-slate-600 sm:text-base">
              Đã có tài khoản?{" "}
              <Link href="/dang-nhap" className="font-bold text-blue-700 hover:text-blue-900">
                Đăng nhập
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
