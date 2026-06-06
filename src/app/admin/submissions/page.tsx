"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, X } from "lucide-react";
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
    const { data } = await supabase
      .from("word_contributions")
      .select("id, word_id, word_text, video_url, description, status, created_at, profiles(full_name)")
      .order("created_at", { ascending: false });
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
        <div className="grid gap-4">
          {submissions.map((s) => (
            <div
              key={s.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-black text-slate-900">{s.word_text}</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Từ: {s.profiles?.full_name ?? "Người dùng"} ·{" "}
                    {new Date(s.created_at).toLocaleDateString("vi-VN")}
                  </p>
                  {s.description && (
                    <p className="mt-2 text-sm font-semibold italic text-slate-600">
                      &quot;{s.description}&quot;
                    </p>
                  )}
                </div>
                <Badge className={statusColors[s.status]}>
                  {statusLabels[s.status]}
                </Badge>
              </div>

              {s.video_url && (
                <div className="mt-4 overflow-hidden rounded-xl border border-slate-100 bg-black">
                  <video
                    src={s.video_url}
                    controls
                    className="aspect-video w-full max-w-md object-contain"
                  />
                </div>
              )}

              {s.status === "pending" && (
                <div className="mt-4 flex gap-2">
                  <Button
                    onClick={() => reviewSubmission(s.id, "approved")}
                    disabled={processing === s.id}
                    className="rounded-full gap-1"
                    variant="success"
                  >
                    <Check className="h-4 w-4" /> Duyệt
                  </Button>
                  <Button
                    onClick={() => reviewSubmission(s.id, "rejected")}
                    disabled={processing === s.id}
                    variant="outline"
                    className="rounded-full gap-1"
                  >
                    <X className="h-4 w-4" /> Từ chối
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
