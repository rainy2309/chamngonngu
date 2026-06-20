"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Loader2, MessageSquareText, Save, Search, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/client";

type FeedbackStatus = "new" | "in_progress" | "resolved" | "ignored";
type FeedbackType = "ui_bug" | "video_data_bug" | "content_feedback" | "feature_request" | "other";

type UserFeedback = {
  id: string;
  user_id: string | null;
  user_email: string | null;
  user_name: string | null;
  feedback_type: FeedbackType;
  message: string;
  page_url: string | null;
  user_agent: string | null;
  status: FeedbackStatus;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
};

const typeLabels: Record<FeedbackType, string> = {
  ui_bug: "Lỗi giao diện",
  video_data_bug: "Lỗi video / dữ liệu",
  content_feedback: "Góp ý nội dung",
  feature_request: "Góp ý tính năng",
  other: "Khác",
};

const statusLabels: Record<FeedbackStatus, string> = {
  new: "Mới",
  in_progress: "Đang xử lý",
  resolved: "Đã xử lý",
  ignored: "Bỏ qua",
};

const statusClasses: Record<FeedbackStatus, string> = {
  new: "bg-blue-50 text-blue-700 ring-blue-100",
  in_progress: "bg-amber-50 text-amber-700 ring-amber-100",
  resolved: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  ignored: "bg-slate-100 text-slate-600 ring-slate-200",
};

const allStatuses: Array<FeedbackStatus | "all"> = ["all", "new", "in_progress", "resolved", "ignored"];
const allTypes: Array<FeedbackType | "all"> = ["all", "ui_bug", "video_data_bug", "content_feedback", "feature_request", "other"];

export default function AdminFeedbackPage() {
  const [feedback, setFeedback] = useState<UserFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<FeedbackStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<FeedbackType | "all">("all");
  const [query, setQuery] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");

  useEffect(() => {
    void loadFeedback();
  }, []);

  async function loadFeedback() {
    if (!hasSupabaseEnv()) {
      setLoading(false);
      setMessage("Thiếu biến môi trường Supabase.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const supabase = createClient();
      const { data, error } = await supabase.from("user_feedback").select("*").order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      const rows = (data ?? []) as UserFeedback[];
      setFeedback(rows);
      setNotes(Object.fromEntries(rows.map((item) => [item.id, item.admin_note ?? ""])));
    } catch (error) {
      console.error("Load feedback error:", error);
      setMessage("Không thể tải góp ý người dùng.");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, status: FeedbackStatus) {
    setSavingId(id);
    setMessage("");

    try {
      const supabase = createClient();
      const { error } = await supabase.from("user_feedback").update({ status, updated_at: new Date().toISOString() }).eq("id", id);

      if (error) {
        throw error;
      }

      setFeedback((current) => current.map((item) => (item.id === id ? { ...item, status } : item)));
    } catch (error) {
      console.error("Update feedback status error:", error);
      setMessage("Không thể cập nhật trạng thái.");
    } finally {
      setSavingId(null);
    }
  }

  async function saveNote(id: string) {
    setSavingId(id);
    setMessage("");

    try {
      const adminNote = notes[id]?.trim() || null;
      const supabase = createClient();
      const { error } = await supabase.from("user_feedback").update({ admin_note: adminNote, updated_at: new Date().toISOString() }).eq("id", id);

      if (error) {
        throw error;
      }

      setFeedback((current) => current.map((item) => (item.id === id ? { ...item, admin_note: adminNote } : item)));
    } catch (error) {
      console.error("Save feedback note error:", error);
      setMessage("Không thể lưu ghi chú nội bộ.");
    } finally {
      setSavingId(null);
    }
  }

  async function deleteFeedback(id: string) {
    if (!window.confirm("Bạn có chắc muốn xóa góp ý này?")) {
      return;
    }

    setSavingId(id);
    setMessage("");

    try {
      const supabase = createClient();
      const { error } = await supabase.from("user_feedback").delete().eq("id", id);

      if (error) {
        throw error;
      }

      setFeedback((current) => current.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Delete feedback error:", error);
      setMessage("Không thể xóa góp ý.");
    } finally {
      setSavingId(null);
    }
  }

  const filteredFeedback = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return feedback.filter((item) => {
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      const matchesType = typeFilter === "all" || item.feedback_type === typeFilter;
      const matchesQuery =
        !normalizedQuery ||
        item.message.toLowerCase().includes(normalizedQuery) ||
        (item.user_email ?? "").toLowerCase().includes(normalizedQuery) ||
        (item.user_name ?? "").toLowerCase().includes(normalizedQuery) ||
        (item.page_url ?? "").toLowerCase().includes(normalizedQuery);

      return matchesStatus && matchesType && matchesQuery;
    });
  }, [feedback, query, statusFilter, typeFilter]);

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-black uppercase text-blue-600">Admin</p>
          <h1 className="mt-1 text-3xl font-black text-slate-950">Góp ý người dùng</h1>
          <p className="mt-2 font-semibold text-slate-500">Theo dõi phản hồi, lỗi giao diện, lỗi dữ liệu và đề xuất tính năng từ cộng đồng.</p>
        </div>
        <Button type="button" variant="outline" onClick={loadFeedback} className="rounded-full bg-white">
          Làm mới
        </Button>
      </div>

      <div className="mb-6 grid gap-3 lg:grid-cols-[1fr_auto_auto]">
        <label className="flex min-h-12 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3">
          <Search className="h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm nội dung, email hoặc trang liên quan..."
            className="border-0 bg-transparent px-0 focus-visible:ring-0"
          />
        </label>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)} className="min-h-12 rounded-2xl border border-slate-200 bg-white px-4 font-bold">
          {allStatuses.map((status) => (
            <option key={status} value={status}>
              {status === "all" ? "Tất cả trạng thái" : statusLabels[status]}
            </option>
          ))}
        </select>
        <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as typeof typeFilter)} className="min-h-12 rounded-2xl border border-slate-200 bg-white px-4 font-bold">
          {allTypes.map((type) => (
            <option key={type} value={type}>
              {type === "all" ? "Tất cả loại góp ý" : typeLabels[type]}
            </option>
          ))}
        </select>
      </div>

      {message ? <p className="mb-4 rounded-2xl bg-orange-50 p-4 font-bold text-orange-800 ring-1 ring-orange-100">{message}</p> : null}

      {loading ? (
        <div className="flex items-center justify-center gap-3 py-20 text-blue-700">
          <Loader2 className="h-8 w-8 animate-spin" aria-hidden="true" />
          <span className="font-black">Đang tải góp ý...</span>
        </div>
      ) : filteredFeedback.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center">
          <MessageSquareText className="mx-auto h-10 w-10 text-slate-400" aria-hidden="true" />
          <p className="mt-3 font-bold text-slate-500">Chưa có góp ý phù hợp.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredFeedback.map((item) => (
            <article key={item.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-start">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="bg-blue-50 text-blue-700 ring-blue-100">{typeLabels[item.feedback_type] ?? item.feedback_type}</Badge>
                    <Badge className={statusClasses[item.status]}>{statusLabels[item.status] ?? item.status}</Badge>
                  </div>
                  <p className="mt-3 whitespace-pre-wrap break-words text-sm font-semibold leading-7 text-slate-800">{item.message}</p>
                </div>

                <div className="grid gap-2 text-sm font-semibold text-slate-500 lg:min-w-72">
                  <span className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" aria-hidden="true" />
                    {new Date(item.created_at).toLocaleString("vi-VN")}
                  </span>
                  <span className="break-all">Người gửi: {item.user_name || item.user_email || "Khách"}</span>
                  {item.page_url ? <span className="break-all">Trang: {item.page_url}</span> : null}
                </div>
              </div>

              <div className="mt-5 grid gap-3 border-t border-slate-100 pt-4 lg:grid-cols-[220px_1fr_auto_auto] lg:items-end">
                <label className="grid gap-1.5">
                  <span className="text-xs font-black uppercase text-slate-500">Trạng thái</span>
                  <select
                    value={item.status}
                    onChange={(event) => updateStatus(item.id, event.target.value as FeedbackStatus)}
                    disabled={savingId === item.id}
                    className="min-h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-bold"
                  >
                    {(allStatuses.filter((status) => status !== "all") as FeedbackStatus[]).map((status) => (
                      <option key={status} value={status}>
                        {statusLabels[status]}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-1.5">
                  <span className="text-xs font-black uppercase text-slate-500">Ghi chú nội bộ</span>
                  <textarea
                    value={notes[item.id] ?? ""}
                    onChange={(event) => setNotes((current) => ({ ...current, [item.id]: event.target.value }))}
                    placeholder="Ghi chú nội bộ"
                    rows={2}
                    className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </label>

                <Button type="button" variant="outline" onClick={() => saveNote(item.id)} disabled={savingId === item.id} className="rounded-full bg-white">
                  <Save className="h-4 w-4" aria-hidden="true" />
                  Lưu ghi chú
                </Button>

                <Button type="button" variant="ghost" onClick={() => deleteFeedback(item.id)} disabled={savingId === item.id} className="rounded-full text-red-600 hover:bg-red-50 hover:text-red-700">
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Xóa
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
