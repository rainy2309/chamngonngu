"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/client";

type Submission = {
  id: string;
  word_id: string;
  word_text: string;
  video_url: string;
  description: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  profiles?: { full_name: string | null } | null;
};

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    loadSubmissions();
  }, []);

  async function loadSubmissions() {
    if (!hasSupabaseEnv()) { setLoading(false); return; }
    const supabase = createClient();
    const { data, error } = await supabase
      .from("word_contributions")
      .select("id, word_id, word_text, video_url, description, status, created_at, profiles!word_contributions_user_id_fkey(full_name)")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Load submissions error:", error);
    }
    if (data) setSubmissions(data as unknown as Submission[]);
    setLoading(false);
  }

  async function reviewSubmission(id: string, status: "approved" | "rejected") {
    setProcessing(id);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    await supabase
      .from("word_contributions")
      .update({ status, reviewed_by: user?.id, reviewed_at: new Date().toISOString() })
      .eq("id", id);
    setSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status } : s))
    );
    setProcessing(null);
  }

  async function deleteSubmission(id: string) {
    if (!window.confirm("Bạn có chắc chắn muốn xóa vĩnh viễn đóng góp này không?")) return;
    setProcessing(id);
    try {
      const supabase = createClient();
      await supabase.from("word_contributions").delete().eq("id", id);
      setSubmissions((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error("Delete submission error:", err);
    } finally {
      setProcessing(null);
    }
  }

  const statusColors: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700",
    approved: "bg-emerald-50 text-emerald-700",
    rejected: "bg-red-50 text-red-700",
  };

  const statusLabels: Record<string, string> = {
    pending: "Chờ duyệt",
    approved: "Đã duyệt",
    rejected: "Từ chối",
  };

  return (
    <div className="p-6 sm:p-8">
      <h1 className="mb-2 text-3xl font-black text-slate-950">Duyệt đóng góp</h1>
      <p className="mb-6 font-semibold text-slate-500">
        {submissions.filter((s) => s.status === "pending").length} đóng góp đang chờ duyệt
      </p>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : submissions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center font-bold text-slate-500">
          Chưa có đóng góp nào từ cộng đồng.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {submissions.map((s) => (
            <div
              key={s.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="relative aspect-video w-full bg-slate-900">
                {s.video_url ? (
                  <video
                    src={s.video_url}
                    controls
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-500">
                    <span className="text-xs font-semibold">Không có video</span>
                  </div>
                )}
                <div className="absolute left-2 top-2 z-10">
                  <Badge className={`${statusColors[s.status]} shadow-sm`}>
                    {statusLabels[s.status]}
                  </Badge>
                </div>
              </div>

              <div className="flex flex-1 flex-col p-4">
                <div className="mb-3">
                  <h3 className="text-lg font-black text-slate-900 line-clamp-1">{s.word_text}</h3>
                  <p className="mt-1 text-xs font-medium text-slate-500">
                    Bởi: <span className="font-bold text-slate-700">{s.profiles?.full_name ?? "Người dùng"}</span>
                    <span className="mx-1.5">•</span>
                    {new Date(s.created_at).toLocaleDateString("vi-VN")}
                  </p>
                  {s.description && (
                    <p className="mt-2 text-sm font-medium italic text-slate-600 line-clamp-2">
                      &quot;{s.description}&quot;
                    </p>
                  )}
                </div>

                <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                  {s.status === "pending" && (
                    <>
                      <Button
                        onClick={() => reviewSubmission(s.id, "approved")}
                        disabled={processing === s.id}
                        size="sm"
                        className="flex-1 rounded-xl gap-1 h-8"
                        variant="success"
                      >
                        <Check className="h-3.5 w-3.5" /> Duyệt
                      </Button>
                      <Button
                        onClick={() => reviewSubmission(s.id, "rejected")}
                        disabled={processing === s.id}
                        size="sm"
                        variant="outline"
                        className="flex-1 rounded-xl gap-1 h-8"
                      >
                        <X className="h-3.5 w-3.5" /> Từ chối
                      </Button>
                    </>
                  )}
                  <Button
                    onClick={() => deleteSubmission(s.id)}
                    disabled={processing === s.id}
                    size="sm"
                    variant="ghost"
                    className={`h-8 shrink-0 rounded-xl px-2 text-slate-400 hover:bg-red-50 hover:text-red-600 ${s.status !== "pending" ? "flex-1 border border-slate-200" : ""}`}
                    title="Xóa đóng góp"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> {s.status !== "pending" ? "Xóa" : ""}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
