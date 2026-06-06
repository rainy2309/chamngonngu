"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Award, BookOpen, Heart, Save, Sparkles, UserRound, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createClient, hasSupabaseEnv, missingEnvMessage } from "@/lib/supabase/client";
import { getBestQuizScore } from "@/lib/quiz";
import { learningStorageKeys, readBestQuizScore, readLearningItems, type StoredLearningItem } from "@/lib/localLearning";

const roleLabels: Record<string, string> = {
  user: "Người dùng",
  admin: "Quản trị viên",
};



function getInitials(name: string, email: string) {
  const source = name || email || "CHẠM";
  return source
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function RecentList({ items, emptyText }: { items: StoredLearningItem[]; emptyText: string }) {
  if (!items.length) {
    return <p className="rounded-3xl bg-slate-50 p-4 text-sm font-semibold text-slate-500">{emptyText}</p>;
  }

  return (
    <div className="grid gap-2">
      {items.slice(0, 5).map((item) => (
        <div key={item.id} className="flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-blue-100 bg-white px-4 py-3">
          <span className="min-w-0 break-words font-bold text-slate-800">{item.label}</span>
          <span className="whitespace-nowrap text-xs font-bold text-blue-700">{new Date(item.updatedAt).toLocaleDateString("vi-VN")}</span>
        </div>
      ))}
    </div>
  );
}

export default function ProfilePage() {
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("user");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [joinedAt, setJoinedAt] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileTableReady, setProfileTableReady] = useState(true);
  const [learnedSigns, setLearnedSigns] = useState<StoredLearningItem[]>([]);
  const [favoriteSigns, setFavoriteSigns] = useState<StoredLearningItem[]>([]);
  const [viewedLessons, setViewedLessons] = useState<StoredLearningItem[]>([]);
  const [bestScore, setBestScore] = useState(0);
  const [courses, setCourses] = useState<{ title: string; href: string }[]>([]);

  useEffect(() => {
    setLearnedSigns(readLearningItems(learningStorageKeys.learned));
    setFavoriteSigns(readLearningItems(learningStorageKeys.favorites));
    setViewedLessons(readLearningItems(learningStorageKeys.viewedLessons));
    setBestScore(readBestQuizScore());

    async function loadProfile() {
      try {
        if (!hasSupabaseEnv()) {
          setMessage(missingEnvMessage);
          setProfileTableReady(false);
          return;
        }

        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setMessage("Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.");
          return;
        }

        const metadataName = String(user.user_metadata.full_name ?? user.user_metadata.name ?? "");
        const metadataRole = String(user.user_metadata.role ?? "user");
        const metadataAvatar = String(user.user_metadata.avatar_url ?? user.user_metadata.picture ?? "");

        setUserId(user.id);
        setEmail(user.email ?? "");
        setFullName(metadataName);
        setRole(metadataRole || "user");
        setAvatarUrl(metadataAvatar);
        setJoinedAt(user.created_at ?? "");

        const supabaseBestScore = await getBestQuizScore();
        setBestScore((current) => Math.max(current, supabaseBestScore));

        const { data, error } = await supabase.from("profiles").select("full_name,role,avatar_url,created_at").eq("id", user.id).maybeSingle();
        if (error) {
          setProfileTableReady(false);
          setMessage("Chưa kết nối bảng hồ sơ. Thông tin đang hiển thị từ tài khoản đăng nhập.");
          return;
        }

        const profileName = data?.full_name || metadataName;
        const profileRole = data?.role || metadataRole || "user";
        const profileAvatar = data?.avatar_url || metadataAvatar;

        setFullName(profileName);
        setRole(profileRole);
        setAvatarUrl(profileAvatar);
        setJoinedAt(data?.created_at ?? user.created_at ?? "");

        const shouldUpsert = !data?.full_name || !data?.avatar_url || !data?.role;
        if (shouldUpsert) {
          const { error: upsertError } = await supabase.from("profiles").upsert({
            id: user.id,
            full_name: profileName,
            role: profileRole,
            avatar_url: profileAvatar,
            updated_at: new Date().toISOString(),
          });
          if (upsertError) {
            console.error("Profile upsert error:", upsertError);
            setProfileTableReady(false);
          }
        }

        // Fetch lessons dynamically
        try {
          const { data: dbLessons } = await supabase
            .from("lessons")
            .select("id, topic")
            .eq("status", "published")
            .order("sort_order")
            .limit(4);
          if (dbLessons && dbLessons.length > 0) {
            setCourses(dbLessons.map((l: any) => ({
              title: l.topic,
              href: `/lessons/${l.id}`
            })));
          } else {
            throw new Error("No lessons");
          }
        } catch {
          if (process.env.NODE_ENV === "development") {
            setCourses([
              { title: "Chào hỏi cơ bản", href: "/khoa-hoc/ghep-cau" },
              { title: "Gia đình", href: "/tu-dien" },
              { title: "Số đếm", href: "/khoa-hoc/bang-chu-cai" },
              { title: "Cảm xúc", href: "/khoa-hoc/ghep-tu" },
            ]);
          }
        }
      } catch {
        setMessage("Chưa kết nối bảng hồ sơ. Thông tin đang hiển thị từ tài khoản đăng nhập.");
        setProfileTableReady(false);
        if (process.env.NODE_ENV === "development") {
          setCourses([
            { title: "Chào hỏi cơ bản", href: "/khoa-hoc/ghep-cau" },
            { title: "Gia đình", href: "/tu-dien" },
            { title: "Số đếm", href: "/khoa-hoc/bang-chu-cai" },
            { title: "Cảm xúc", href: "/khoa-hoc/ghep-tu" },
          ]);
        }
      } finally {
        setLoading(false);
      }
    }

    void loadProfile();
  }, []);

  const hasJournal = useMemo(() => learnedSigns.length + favoriteSigns.length + viewedLessons.length + bestScore > 0, [bestScore, favoriteSigns.length, learnedSigns.length, viewedLessons.length]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const supabase = createClient();
      if (profileTableReady) {
        // Không gửi role khi update - user không được tự đổi role
        const { error } = await supabase.from("profiles").upsert({ id: userId, full_name: fullName, avatar_url: avatarUrl, updated_at: new Date().toISOString() });
        if (error) throw error;
      }
      // Không gửi role trong auth metadata
      await supabase.auth.updateUser({ data: { full_name: fullName, avatar_url: avatarUrl } });
      setMessage("Đã cập nhật hồ sơ.");
    } catch {
      setMessage("Không thể lưu hồ sơ. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  }

  const statCards = [
    { title: "Từ đã học", value: learnedSigns.length, icon: CheckCircle2 },
    { title: "Từ yêu thích", value: favoriteSigns.length, icon: Heart },
    { title: "Bài học đã xem", value: viewedLessons.length, icon: BookOpen },
    { title: "Điểm luyện tập cao nhất", value: bestScore, icon: Award },
  ];

  return (
    <main className="flex-1 bg-gradient-to-b from-blue-50 to-white px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 sm:gap-8">
        <section>
          <p className="text-sm font-black uppercase text-blue-600">Khu vực cá nhân</p>
          <h1 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl lg:text-5xl">Hồ sơ học tập</h1>
          <p className="mt-3 max-w-3xl text-sm font-semibold leading-7 text-slate-600 sm:text-lg sm:leading-8">Theo dõi nhật ký học ký hiệu, từ yêu thích và thông tin tài khoản CHẠM của bạn.</p>
        </section>

        <section className="grid gap-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black text-slate-950">Nhật ký học tập</h2>
              <p className="mt-1 font-semibold text-slate-600">Dữ liệu MVP được lưu trên trình duyệt và điểm luyện tập có thể đồng bộ Supabase nếu đã kết nối.</p>
            </div>
            <Button asChild className="w-full rounded-full sm:w-auto">
              <Link href="/khoa-hoc">Tiếp tục học</Link>
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {statCards.map((card) => (
              <Card key={card.title} className="rounded-[1.5rem] border-blue-100 shadow-lg shadow-blue-100/50">
                <CardContent className="flex items-center justify-between gap-4 p-5">
                  <div>
                    <p className="text-sm font-black text-slate-500">{card.title}</p>
                    <p className="mt-2 text-4xl font-black text-blue-700">{card.value}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                    <card.icon aria-hidden="true" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {!hasJournal ? (
            <div className="rounded-[2rem] border border-dashed border-blue-200 bg-white p-6 text-center shadow-lg shadow-blue-100/40">
              <Sparkles className="mx-auto h-10 w-10 text-blue-700" aria-hidden="true" />
              <p className="mt-3 text-lg font-black text-slate-900">Bạn chưa có nhật ký học tập. Hãy bắt đầu với Từ điển hoặc Khóa học.</p>
            </div>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="rounded-[1.75rem] border-blue-100 shadow-lg shadow-blue-100/50">
              <CardHeader>
                <CardTitle>Từ đã học gần đây</CardTitle>
              </CardHeader>
              <CardContent>
                <RecentList items={learnedSigns} emptyText="Bạn chưa đánh dấu từ nào là đã học." />
              </CardContent>
            </Card>
            <Card className="rounded-[1.75rem] border-blue-100 shadow-lg shadow-blue-100/50">
              <CardHeader>
                <CardTitle>Từ yêu thích gần đây</CardTitle>
              </CardHeader>
              <CardContent>
                <RecentList items={favoriteSigns} emptyText="Bạn chưa lưu từ yêu thích nào." />
              </CardContent>
            </Card>
            <Card className="rounded-[1.75rem] border-blue-100 shadow-lg shadow-blue-100/50">
              <CardHeader>
                <CardTitle>Khóa học đang tiếp tục</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2">
                {courses.length > 0 ? (
                  courses.map((course) => (
                    <Link key={course.title} href={course.href} className="rounded-2xl border border-blue-100 bg-blue-50/60 px-4 py-3 font-bold text-blue-800 hover:bg-blue-100">
                      {course.title}
                    </Link>
                  ))
                ) : (
                  <p className="text-sm font-semibold text-slate-500 rounded-3xl bg-slate-50 p-4">Không có bài học khả dụng.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        <Card className="rounded-[1.5rem] border-blue-100 shadow-xl shadow-blue-100/60 sm:rounded-[2rem]">
          <CardHeader>
            <div className="mb-4 flex items-center gap-4">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt={`Ảnh đại diện của ${fullName || email}`} className="h-16 w-16 rounded-2xl object-cover ring-4 ring-blue-50" referrerPolicy="no-referrer" />
              ) : (
                <div className="grid h-16 w-16 place-items-center rounded-2xl bg-blue-100 text-xl font-black text-blue-700">{getInitials(fullName, email)}</div>
              )}
              <div>
                <CardTitle className="text-2xl sm:text-3xl">Thông tin tài khoản</CardTitle>
                <p className="break-all text-slate-600">{email}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-slate-600">Đang tải hồ sơ...</p>
            ) : (
              <form className="grid gap-4" onSubmit={onSubmit}>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="grid gap-2">
                    <span className="font-bold text-slate-800">Email / Gmail</span>
                    <Input value={email} disabled className="break-all" />
                  </label>
                  <label className="grid gap-2">
                    <span className="font-bold text-slate-800">Ngày tham gia</span>
                    <Input value={joinedAt ? new Date(joinedAt).toLocaleDateString("vi-VN") : "Chưa có dữ liệu"} disabled />
                  </label>
                </div>
                <label className="grid gap-2">
                  <span className="font-bold text-slate-800">Họ tên</span>
                  <Input value={fullName} onChange={(event) => setFullName(event.target.value)} required />
                </label>
                <label className="grid gap-2">
                  <span className="font-bold text-slate-800">Vai trò</span>
                  <Input value={roleLabels[role] ?? role} disabled />
                </label>
                {message ? <p className="rounded-2xl bg-blue-50 p-3 font-semibold text-blue-900">{message}</p> : null}
                <Button type="submit" disabled={saving || !userId} className="w-full rounded-full sm:w-auto">
                  <Save className="h-5 w-5" aria-hidden="true" />
                  {saving ? "Đang lưu..." : "Lưu hồ sơ"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
