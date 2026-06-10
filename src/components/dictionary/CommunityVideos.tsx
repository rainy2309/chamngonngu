"use client";

import { useEffect, useState } from "react";
import { Plus, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/client";
import { VideoUploadForm } from "./VideoUploadForm";

type Contribution = {
  id: string;
  video_url: string;
  description: string | null;
  status: "pending" | "approved";
  created_at: string;
  profiles?: { full_name: string | null; role: string } | null;
};

const roleLabels: Record<string, string> = {
  user: "Người dùng",
  admin: "Quản trị viên",
};

export function CommunityVideos({ wordId, wordText, compactEmpty = false }: { wordId: string; wordText: string; compactEmpty?: boolean }) {
  const [videos, setVideos] = useState<Contribution[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!hasSupabaseEnv()) return;
    const supabase = createClient();

    async function load() {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setIsLoggedIn(Boolean(user));

        // Fetch approved contributions OR user's own pending ones
        let query = supabase
          .from("word_contributions")
          .select("id, video_url, description, status, created_at, profiles(full_name, role)")
          .eq("word_id", wordId);

        if (user) {
          query = query.or(`status.eq.approved,user_id.eq.${user.id}`);
        } else {
          query = query.eq("status", "approved");
        }

        const { data } = await query.order("created_at", { ascending: false });
        if (data) setVideos(data as unknown as Contribution[]);
      } catch (err) {
        console.error("Load community videos error:", err);
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [wordId, showUpload]);

  return (
    <div className="rounded-2xl border border-blue-100 bg-white p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-base font-black text-slate-950">
          <Video className="h-5 w-5 text-blue-500" />
          Ký hiệu từ cộng đồng {videos.length > 0 ? `(${videos.length})` : ""}
        </h3>
        {isLoggedIn && !showUpload && (
          <Button onClick={() => setShowUpload(true)} size="sm" className="rounded-full gap-1">
            <Plus className="h-4 w-4" /> Đóng góp video
          </Button>
        )}
      </div>

      {showUpload ? (
        <VideoUploadForm wordId={wordId} wordText={wordText} onClose={() => setShowUpload(false)} />
      ) : (
        <>
          {loading ? (
            <p className="py-4 text-center text-sm font-semibold text-slate-400">Đang tải video...</p>
          ) : videos.length === 0 && compactEmpty ? (
            <p className="rounded-xl bg-slate-50 p-3 text-sm font-semibold text-slate-500">
              Chưa có video cộng đồng cho từ này.
            </p>
          ) : videos.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center">
              <p className="text-sm font-semibold text-slate-500">Chưa có video ký hiệu nào từ cộng đồng.</p>
              {!isLoggedIn && (
                <p className="mt-2 text-xs text-slate-400">
                  Hãy <a href="/dang-nhap" className="text-blue-600 underline">Đăng nhập</a> để là người đầu tiên đóng góp video!
                </p>
              )}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {videos.map((vid) => {
                const author = vid.profiles?.full_name ?? "Thành viên CHẠM";
                const role = vid.profiles?.role ?? "user";
                return (
                  <div key={vid.id} className="relative overflow-hidden rounded-xl border border-slate-100 bg-slate-50 p-2 shadow-sm">
                    <video
                      src={vid.video_url}
                      controls
                      className="aspect-video w-full rounded-lg bg-black object-contain"
                    />
                    <div className="mt-2 p-1">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="font-bold text-slate-700">{author}</span>
                        <span className="rounded bg-blue-100 px-1.5 py-0.5 font-bold text-blue-700">
                          {roleLabels[role] ?? role}
                        </span>
                      </div>
                      {vid.description && (
                        <p className="mt-1 text-xs font-semibold text-slate-600 italic">
                          &quot;{vid.description}&quot;
                        </p>
                      )}
                      {vid.status === "pending" && (
                        <span className="absolute left-2 top-2 rounded bg-amber-500 px-2 py-0.5 text-[10px] font-black text-white shadow">
                          Đang chờ duyệt
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
