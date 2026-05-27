"use client";

import { useEffect, useState } from "react";
import { Save, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

const roleLabels: Record<string, string> = {
  learner: "Người học",
  supporter: "Người hỗ trợ",
  teacher: "Giáo viên / chuyên môn",
};

export default function ProfilePage() {
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("learner");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileTableReady, setProfileTableReady] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setMessage("Bạn cần đăng nhập để sử dụng tính năng này.");
          return;
        }

        setUserId(user.id);
        setEmail(user.email ?? "");
        setFullName(String(user.user_metadata.full_name ?? ""));
        setRole(String(user.user_metadata.role ?? "learner"));

        const { data, error } = await supabase.from("profiles").select("full_name,role").eq("id", user.id).maybeSingle();
        if (error) {
          setProfileTableReady(false);
          setMessage("Chưa kết nối bảng hồ sơ. Thông tin đang hiển thị từ tài khoản đăng nhập.");
          return;
        }
        setFullName(data?.full_name ?? String(user.user_metadata.full_name ?? ""));
        setRole(data?.role ?? String(user.user_metadata.role ?? "learner"));
      } catch {
        setMessage("Chưa kết nối bảng hồ sơ. Thông tin đang hiển thị từ tài khoản đăng nhập.");
        setProfileTableReady(false);
      } finally {
        setLoading(false);
      }
    }
    void loadProfile();
  }, []);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const supabase = createClient();
      if (profileTableReady) {
        const { error } = await supabase.from("profiles").upsert({ id: userId, full_name: fullName, role, updated_at: new Date().toISOString() });
        if (error) throw error;
      }
      await supabase.auth.updateUser({ data: { full_name: fullName, role } });
      setMessage("Đã cập nhật hồ sơ.");
    } catch {
      setMessage("Không thể lưu hồ sơ. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="grid flex-1 place-items-center bg-gradient-to-b from-blue-50 to-white px-4 py-10 sm:px-6 lg:px-8">
      <Card className="w-full max-w-3xl rounded-[2rem] border-blue-100 shadow-xl shadow-blue-100/60">
        <CardHeader>
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700"><UserRound aria-hidden="true" /></div>
          <CardTitle className="text-3xl">Hồ sơ học tập</CardTitle>
          <p className="text-slate-600">Quản lý thông tin cơ bản dùng cho CHẠM.</p>
        </CardHeader>
        <CardContent>
          {loading ? <p className="text-slate-600">Đang tải hồ sơ...</p> : (
            <form className="grid gap-4" onSubmit={onSubmit}>
              <label className="grid gap-2"><span className="font-bold text-slate-800">Email</span><Input value={email} disabled /></label>
              <label className="grid gap-2"><span className="font-bold text-slate-800">Họ tên</span><Input value={fullName} onChange={(event) => setFullName(event.target.value)} required /></label>
              <label className="grid gap-2">
                <span className="font-bold text-slate-800">Vai trò</span>
                <select value={role} onChange={(event) => setRole(event.target.value)} className="min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-base font-semibold text-slate-900 outline-none focus:ring-4 focus:ring-blue-100">
                  {Object.entries(roleLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
              {message ? <p className="rounded-2xl bg-blue-50 p-3 font-semibold text-blue-900">{message}</p> : null}
              <Button type="submit" disabled={saving || !userId} className="rounded-full"><Save className="h-5 w-5" aria-hidden="true" />{saving ? "Đang lưu..." : "Lưu hồ sơ"}</Button>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
