"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

type Role = "learner" | "supporter" | "teacher";

const roles: { value: Role; label: string }[] = [
  { value: "learner", label: "Người học" },
  { value: "supporter", label: "Người hỗ trợ" },
  { value: "teacher", label: "Giáo viên / chuyên môn" },
];

function normalizeRole(value: string): Role {
  if (value === "supporter" || value === "teacher" || value === "learner") return value;
  const normalized = value.trim().toLowerCase();
  if (normalized.includes("hỗ trợ") || normalized.includes("ho tro") || normalized.includes("support")) return "supporter";
  if (normalized.includes("giáo viên") || normalized.includes("giao vien") || normalized.includes("chuyên môn") || normalized.includes("teacher")) return "teacher";
  return "learner";
}

function getSignupErrorMessage(message?: string) {
  const lowerMessage = message?.toLowerCase() ?? "";
  if (lowerMessage.includes("already registered") || lowerMessage.includes("already exists")) return "Email này đã được đăng ký. Vui lòng đăng nhập hoặc dùng email khác.";
  if (lowerMessage.includes("password")) return "Mật khẩu chưa hợp lệ. Vui lòng dùng mật khẩu có ít nhất 6 ký tự.";
  if (lowerMessage.includes("email")) return "Email chưa hợp lệ hoặc chưa được Supabase chấp nhận.";
  if (lowerMessage.includes("database") || lowerMessage.includes("role") || lowerMessage.includes("constraint")) return "Không thể tạo hồ sơ người dùng. Vui lòng kiểm tra giá trị vai trò và cấu hình Supabase.";
  return message ? `Không thể tạo tài khoản: ${message}` : "Không thể tạo tài khoản. Vui lòng thử lại.";
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

  useEffect(() => {
    async function checkSession() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) router.replace("/dashboard");
      } catch {
        setMessage("Thiếu biến môi trường Supabase. Vui lòng kiểm tra file .env.local.");
      }
    }
    void checkSession();
  }, [router]);

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
      const safeRole = normalizeRole(role);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: { full_name: fullName, role: safeRole },
        },
      });

      if (error) {
        console.error("Signup error:", error);
        setMessage(getSignupErrorMessage(error.message));
        return;
      }
      if (data.session) {
        router.replace("/dashboard");
        router.refresh();
        return;
      }
      setMessage("Đăng ký thành công. Vui lòng kiểm tra email để xác nhận tài khoản.");
    } catch (error) {
      console.error("Signup error:", error);
      setMessage(error instanceof Error ? getSignupErrorMessage(error.message) : "Không thể tạo tài khoản. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid flex-1 place-items-center bg-gradient-to-b from-blue-50 to-white px-4 py-10 sm:px-6 lg:px-8">
      <Card className="w-full max-w-xl rounded-[2rem] border-blue-100 shadow-xl shadow-blue-100/60">
        <CardHeader>
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"><UserPlus aria-hidden="true" /></div>
          <CardTitle className="text-3xl">Tạo tài khoản CHẠM</CardTitle>
          <p className="text-slate-600">Tạo tài khoản để lưu tiến độ học tập theo từng người dùng.</p>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={onSubmit}>
            <label className="grid gap-2"><span className="font-bold text-slate-800">Họ và tên</span><Input value={fullName} onChange={(event) => setFullName(event.target.value)} required autoComplete="name" /></label>
            <label className="grid gap-2"><span className="font-bold text-slate-800">Email</span><Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" /></label>
            <label className="grid gap-2"><span className="font-bold text-slate-800">Mật khẩu</span><Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="new-password" /></label>
            <label className="grid gap-2"><span className="font-bold text-slate-800">Xác nhận mật khẩu</span><Input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required autoComplete="new-password" /></label>
            <label className="grid gap-2">
              <span className="font-bold text-slate-800">Vai trò</span>
              <select value={role} onChange={(event) => setRole(normalizeRole(event.target.value))} className="min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-base font-semibold text-slate-900 outline-none focus:ring-4 focus:ring-blue-100">
                {roles.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </label>
            {message ? <p className="rounded-2xl bg-blue-50 p-3 font-semibold text-blue-900">{message}</p> : null}
            <Button type="submit" disabled={loading} className="rounded-full">{loading ? "Đang tạo tài khoản..." : "Đăng ký"}</Button>
            <p className="text-center text-slate-600">Đã có tài khoản? <Link href="/login" className="font-bold text-blue-700 hover:text-blue-900">Đăng nhập</Link></p>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
