"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowRight, Award, CheckCircle2, KeyRound, Save, Search, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createClient, hasSupabaseEnv, missingEnvMessage } from "@/lib/supabase/client";
import { getBestQuizScore } from "@/lib/quiz";
import { readLearningState } from "@/lib/authLearning";
import type { StoredLearningItem } from "@/lib/localLearning";
import { addDictionaryProgressItems, dedupeLearningItemsByCanonical, getProgressDisplayInfo, isUuidLike } from "@/lib/progressDisplay";
import { readPracticeStats, type PracticeStats } from "@/lib/practiceStats";

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
      {items.slice(0, 5).map((item) => {
        const baseDisplay = getProgressDisplayInfo(item.id, item.label);
        const hasStoredLabel = item.label && item.label !== item.id && !isUuidLike(item.label);
        const display =
          baseDisplay.missingDetails && hasStoredLabel
            ? {
                ...baseDisplay,
                label: item.label,
                typeLabel: item.itemType === "dictionary" || item.itemType === "vocabulary" ? "Từ vựng" : "Mục học",
                category: item.category,
                href: item.href ?? baseDisplay.href,
                missingDetails: false,
              }
            : {
                ...baseDisplay,
                category: baseDisplay.category ?? item.category,
                href: item.href ?? baseDisplay.href,
              };

        return (
        <Link key={item.id} href={display.href} className="group flex min-w-0 items-start justify-between gap-3 rounded-2xl border border-blue-100 bg-white px-4 py-3 transition hover:border-blue-300 hover:bg-blue-50/60 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100">
          <div className="min-w-0">
            <span className="block min-w-0 break-words font-bold text-slate-800">{display.label}</span>
            <span className="mt-1 block text-xs font-bold text-slate-500">
              {display.typeLabel}
              {display.category ? ` · ${display.category}` : ""}
            </span>
          </div>
          <span className="flex shrink-0 items-center gap-2 whitespace-nowrap text-xs font-bold text-blue-700">
            {new Date(item.updatedAt).toLocaleDateString("vi-VN")}
            <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" aria-hidden="true" />
          </span>
        </Link>
        );
      })}
    </div>
  );
}

function getStoredItemIds(items: StoredLearningItem[]) {
  return Array.from(new Set(items.map((item) => item.id).filter(Boolean)));
}

function mergeStoredItems(items: StoredLearningItem[]) {
  const byId = new Map<string, StoredLearningItem>();
  for (const item of items) {
    const existing = byId.get(item.id);
    if (!existing || new Date(item.updatedAt).getTime() > new Date(existing.updatedAt).getTime()) {
      byId.set(item.id, item);
    }
  }
  return Array.from(byId.values()).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

type ResolvedLearningItem = {
  key: string;
  label: string;
  typeLabel: string;
  category?: string;
  href: string;
  updatedAt: string;
};

function resolveLearningItem(item: StoredLearningItem, index = 0): ResolvedLearningItem {
  const baseDisplay = getProgressDisplayInfo(item.id, item.label);
  const hasStoredLabel = item.label && item.label !== item.id && !isUuidLike(item.label);
  const display =
    baseDisplay.missingDetails && hasStoredLabel
      ? {
          ...baseDisplay,
          label: item.label,
          typeLabel: item.itemType === "dictionary" || item.itemType === "vocabulary" ? "Từ vựng" : "Mục học",
          category: item.category,
          href: item.href ?? baseDisplay.href,
          missingDetails: false,
        }
      : {
          ...baseDisplay,
          category: baseDisplay.category ?? item.category,
          href: item.href ?? baseDisplay.href,
        };

  return {
    key: `${item.id}-${item.updatedAt}-${index}`,
    label: display.label,
    typeLabel: display.typeLabel,
    category: display.category,
    href: item.href ?? display.href,
    updatedAt: item.updatedAt,
  };
}

function LearningItemLink({ item, onClick }: { item: ResolvedLearningItem; onClick?: () => void }) {
  return (
    <Link href={item.href} onClick={onClick} className="group flex min-w-0 items-start justify-between gap-3 rounded-2xl border border-blue-100 bg-white px-4 py-3 transition hover:border-blue-300 hover:bg-blue-50/60 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-blue-500 dark:hover:bg-blue-500/10">
      <div className="min-w-0">
        <span className="block min-w-0 break-words font-bold text-slate-800 dark:text-slate-100">{item.label}</span>
        <span className="mt-1 block text-xs font-bold text-slate-500 dark:text-slate-400">
          {item.typeLabel}
          {item.category ? ` · ${item.category}` : ""}
        </span>
      </div>
      <span className="flex shrink-0 items-center gap-2 whitespace-nowrap text-xs font-bold text-blue-700 dark:text-blue-200">
        {new Date(item.updatedAt).toLocaleDateString("vi-VN")}
        <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" aria-hidden="true" />
      </span>
    </Link>
  );
}

function LearningPreviewList({
  items,
  emptyText,
  onViewAll,
}: {
  items: StoredLearningItem[];
  emptyText: string;
  onViewAll?: () => void;
}) {
  if (!items.length) {
    return <p className="rounded-3xl bg-slate-50 p-4 text-sm font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-300">{emptyText}</p>;
  }

  const previewItems = items.slice(0, 5).map(resolveLearningItem);

  return (
    <div className="grid gap-2">
      {previewItems.map((item) => (
        <LearningItemLink key={item.key} item={item} />
      ))}
      {items.length > previewItems.length && onViewAll ? (
        <Button type="button" variant="outline" onClick={onViewAll} className="mt-1 min-h-11 rounded-full bg-white text-blue-700 dark:bg-slate-900 dark:text-blue-100">
          Xem tất cả {items.length} mục
        </Button>
      ) : null}
    </div>
  );
}

function FullLearningListModal({
  open,
  onOpenChange,
  title,
  items,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  items: StoredLearningItem[];
}) {
  const [query, setQuery] = useState("");
  const resolvedItems = useMemo(() => items.map(resolveLearningItem), [items]);
  const normalizedQuery = query.trim().toLowerCase();
  const visibleItems = normalizedQuery
    ? resolvedItems.filter((item) => `${item.label} ${item.typeLabel} ${item.category ?? ""}`.toLowerCase().includes(normalizedQuery))
    : resolvedItems;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 grid max-h-[88vh] w-[calc(100vw-24px)] max-w-2xl -translate-x-1/2 -translate-y-1/2 gap-4 overflow-hidden rounded-[1.5rem] border border-blue-100 bg-white p-4 shadow-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Dialog.Title className="text-xl font-black text-slate-950 dark:text-white sm:text-2xl">{title}</Dialog.Title>
              <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">{items.length} mục trong nhật ký học tập</p>
            </div>
            <Dialog.Close asChild>
              <button type="button" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-700 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 dark:bg-slate-800 dark:text-slate-100" aria-label="Đóng">
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </Dialog.Close>
          </div>

          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm trong danh sách..." className="h-11 rounded-full pl-10" />
          </label>

          <div className="scrollbar-hide grid max-h-[58vh] gap-2 overflow-y-auto pr-1">
            {visibleItems.length ? (
              visibleItems.map((item) => <LearningItemLink key={item.key} item={item} onClick={() => onOpenChange(false)} />)
            ) : (
              <p className="rounded-3xl bg-slate-50 p-4 text-sm font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-300">Không tìm thấy mục phù hợp.</p>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
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
  const [passwordUpdating, setPasswordUpdating] = useState(false);
  const [accountPassword, setAccountPassword] = useState("");
  const [confirmAccountPassword, setConfirmAccountPassword] = useState("");
  const [profileTableReady, setProfileTableReady] = useState(true);
  const [learnedSigns, setLearnedSigns] = useState<StoredLearningItem[]>([]);
  const [fullListModal, setFullListModal] = useState<"learned" | null>(null);
  const [bestScore, setBestScore] = useState(0);
  const [practiceStats, setPracticeStats] = useState<PracticeStats>(() => readPracticeStats());

  useEffect(() => {
    let initialLearned: StoredLearningItem[] = [];

    async function loadProfile() {
      try {
        const [learnedState, learnedAlphabetState] = await Promise.all([
          readLearningState("learned"),
          readLearningState("learnedAlphabet"),
        ]);
        initialLearned = dedupeLearningItemsByCanonical(mergeStoredItems([...learnedState.items, ...learnedAlphabetState.items]));

        setLearnedSigns(initialLearned);
        setBestScore(await getBestQuizScore());
        setPracticeStats(readPracticeStats());

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
        setPracticeStats(readPracticeStats(user.id));

        const supabaseBestScore = await getBestQuizScore();
        setBestScore((current) => Math.max(current, supabaseBestScore));

        try {
          const savedIds = getStoredItemIds(initialLearned);
          const uuidIds = savedIds.filter(isUuidLike);
          const textKeys = savedIds.filter((id) => !isUuidLike(id)).slice(0, 80);
          const matchingRows: any[] = [];

          if (uuidIds.length) {
            const { data: uuidRows, error: uuidError } = await supabase
              .from("dictionary_words")
              .select("id, word_key, word, normalized_word, category")
              .in("id", uuidIds);
            if (uuidError) throw uuidError;
            if (uuidRows) matchingRows.push(...uuidRows);
          }

          if (textKeys.length) {
            const { data: wordRows, error: wordError } = await supabase
              .from("dictionary_words")
              .select("id, word_key, word, normalized_word, category")
              .eq("status", "published")
              .limit(500);
            if (wordError) throw wordError;
            if (wordRows) matchingRows.push(...wordRows);
          }

          if (matchingRows.length) {
            addDictionaryProgressItems(matchingRows);
            initialLearned = dedupeLearningItemsByCanonical(initialLearned);
            setLearnedSigns(initialLearned);
          }
        } catch (error) {
          if (process.env.NODE_ENV === "development") {
            console.warn("Profile learning item resolver fallback:", error);
          }
        }

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
      } catch {
        setMessage("Chưa kết nối bảng hồ sơ. Thông tin đang hiển thị từ tài khoản đăng nhập.");
        setProfileTableReady(false);
      } finally {
        setLoading(false);
      }
    }

    void loadProfile();
  }, []);

  const hasJournal = useMemo(
    () => learnedSigns.length + bestScore + practiceStats.totalSessions > 0,
    [bestScore, learnedSigns.length, practiceStats.totalSessions],
  );

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

  async function updateAccountPassword() {
    setPasswordUpdating(true);
    setMessage("");

    if (!accountPassword) {
      setMessage("Vui lòng nhập mật khẩu mới.");
      setPasswordUpdating(false);
      return;
    }

    if (accountPassword.length < 8) {
      setMessage("Mật khẩu mới cần có ít nhất 8 ký tự.");
      setPasswordUpdating(false);
      return;
    }

    if (accountPassword !== confirmAccountPassword) {
      setMessage("Mật khẩu xác nhận chưa khớp.");
      setPasswordUpdating(false);
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: accountPassword });

      if (error) {
        console.error("Profile password update error:", error);
        setMessage("Không thể cập nhật mật khẩu. Vui lòng thử lại.");
        return;
      }

      setAccountPassword("");
      setConfirmAccountPassword("");
      setMessage("Mật khẩu đã được cập nhật thành công.");
    } catch {
      setMessage(missingEnvMessage);
    } finally {
      setPasswordUpdating(false);
    }
  }

  const statCards = [
    { title: "Mục đã học", value: learnedSigns.length, icon: CheckCircle2 },
    { title: "Lượt luyện tập", value: practiceStats.totalSessions, icon: Sparkles },
    { title: "Điểm luyện tập cao nhất", value: practiceStats.bestScore ? `${practiceStats.bestScore}/${practiceStats.bestTotal || 10}` : "0", icon: Award },
  ];

  return (
    <main className="flex-1 bg-gradient-to-b from-blue-50 to-white px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-5 sm:gap-6">
        <section>
          <p className="text-sm font-black uppercase text-blue-600">Khu vực cá nhân</p>
          <h1 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">Hồ sơ học tập</h1>
          <p className="mt-2 max-w-3xl text-sm font-semibold leading-7 text-slate-600 sm:text-base">Theo dõi các mục đã học và kết quả luyện tập của bạn.</p>
        </section>

        <section className="grid gap-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-slate-950 sm:text-2xl">Nhật ký học tập</h2>
              <p className="mt-1 text-sm font-semibold text-slate-600">Các hoạt động gần đây và tiến độ học của bạn.</p>
            </div>
            <Button asChild className="w-full rounded-full sm:w-auto">
              <Link href="/khoa-hoc/luyen-tap">Đi tới Luyện tập</Link>
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {statCards.map((card) => (
              <Card key={card.title} className="rounded-[1.35rem] border-blue-100 shadow-md shadow-blue-100/40">
                <CardContent className="flex items-center justify-between gap-4 p-4">
                  <div>
                    <p className="text-sm font-black text-slate-500">{card.title}</p>
                    <p className="mt-1 text-3xl font-black text-blue-700">{card.value}</p>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
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
                <CardTitle>Mục đã học</CardTitle>
              </CardHeader>
              <CardContent>
                <LearningPreviewList items={learnedSigns} emptyText="Bạn chưa đánh dấu mục nào là đã học." onViewAll={() => setFullListModal("learned")} />
              </CardContent>
            </Card>
            <Card className="rounded-[1.75rem] border-blue-100 shadow-lg shadow-blue-100/50">
              <CardHeader>
                <CardTitle>Luyện tập gần đây</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2">
                {practiceStats.recentScores.length ? (
                  practiceStats.recentScores.slice(0, 4).map((attempt) => (
                    <Link key={`${attempt.practicedAt}-${attempt.score}`} href="/khoa-hoc/luyen-tap" className="rounded-2xl border border-blue-100 bg-white px-4 py-3 transition hover:border-blue-300 hover:bg-blue-50">
                      <span className="block font-black text-slate-900">{attempt.score}/{attempt.total} câu</span>
                      <span className="mt-1 block text-xs font-bold text-slate-500">
                        {attempt.topic ? `${attempt.topic} · ` : ""}{attempt.mode} · {new Date(attempt.practicedAt).toLocaleDateString("vi-VN")}
                      </span>
                    </Link>
                  ))
                ) : (
                  <div className="grid gap-3 rounded-3xl bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-500">Bạn chưa luyện tập lần nào.</p>
                    <Button asChild size="sm" className="rounded-full">
                      <Link href="/khoa-hoc/luyen-tap">Đi tới Luyện tập</Link>
                    </Button>
                  </div>
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
                <div className="rounded-[1.5rem] border border-blue-100 bg-blue-50/60 p-4">
                  <div className="grid gap-4">
                    <div>
                      <p className="font-black text-slate-950">Tạo hoặc đổi mật khẩu</p>
                      <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
                        Bạn đang đăng nhập bằng Google. Bạn có thể tạo thêm mật khẩu để đăng nhập bằng email ở lần sau.
                      </p>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <label className="grid gap-2">
                        <span className="font-bold text-slate-800">Mật khẩu mới</span>
                        <Input
                          type="password"
                          value={accountPassword}
                          onChange={(event) => setAccountPassword(event.target.value)}
                          autoComplete="new-password"
                        />
                      </label>
                      <label className="grid gap-2">
                        <span className="font-bold text-slate-800">Nhập lại mật khẩu</span>
                        <Input
                          type="password"
                          value={confirmAccountPassword}
                          onChange={(event) => setConfirmAccountPassword(event.target.value)}
                          autoComplete="new-password"
                        />
                      </label>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={passwordUpdating || !userId}
                      onClick={updateAccountPassword}
                      className="min-h-11 w-full rounded-full bg-white sm:w-fit"
                    >
                      <KeyRound className="h-4 w-4" aria-hidden="true" />
                      {passwordUpdating ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
                    </Button>
                  </div>
                </div>
                {message ? <p className="rounded-2xl bg-blue-50 p-3 font-semibold text-blue-900">{message}</p> : null}
                <Button type="submit" disabled={saving || !userId} className="w-full rounded-full sm:w-auto">
                  <Save className="h-5 w-5" aria-hidden="true" />
                  {saving ? "Đang lưu..." : "Lưu hồ sơ"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <FullLearningListModal
          open={fullListModal === "learned"}
          onOpenChange={(open) => setFullListModal(open ? "learned" : null)}
          title="Tất cả mục đã học"
          items={learnedSigns}
        />
      </div>
    </main>
  );
}
