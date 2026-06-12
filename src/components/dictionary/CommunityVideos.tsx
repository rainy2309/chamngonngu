"use client";

import { useEffect, useState } from "react";
import { Clock, Play, Plus, Trash2, Upload, Video, User, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/common/UserAvatar";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/client";
import { VideoUploadForm } from "./VideoUploadForm";

type Contribution = {
  id: string;
  video_url: string;
  description: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  user_id: string;
  profiles?: { full_name: string | null; role: string; avatar_url: string | null } | null;
};

function formatTimeAgo(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return "Vừa xong";
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`;
  return date.toLocaleDateString("vi-VN", { day: "numeric", month: "short", year: "numeric" });
}

export function CommunityVideos({
  wordId,
  wordText,
  compactEmpty = false,
}: {
  wordId: string;
  wordText: string;
  compactEmpty?: boolean;
}) {
  const [videos, setVideos] = useState<Contribution[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);

  useEffect(() => {
    if (!hasSupabaseEnv()) return;
    const supabase = createClient();

    async function load() {
      setLoading(true);
      try {
        let currentUserRole = null;
        const { data: { user } } = await supabase.auth.getUser();
        setIsLoggedIn(Boolean(user));
        if (user) {
          setUserId(user.id);
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .maybeSingle();
          if (profile) {
            setUserRole(profile.role);
            currentUserRole = profile.role;
          }
        }

        let query = supabase
          .from("word_contributions")
          .select("id, video_url, description, status, created_at, user_id, profiles!word_contributions_user_id_fkey(full_name, role, avatar_url)")
          .eq("word_id", wordId);

        if (user) {
          if (currentUserRole === "admin") {
            // Admins can see all submissions
          } else {
            query = query.or(`status.eq.approved,user_id.eq.${user.id}`);
          }
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

  async function deleteVideo(id: string) {
    if (!window.confirm("Bạn có chắc chắn muốn xóa video đóng góp này?")) return;
    try {
      const supabase = createClient();
      await supabase.from("word_contributions").delete().eq("id", id);
      setVideos((prev) => prev.filter((v) => v.id !== id));
    } catch (err) {
      console.error("Delete video error:", err);
    }
  }

  const approvedVideos = videos.filter((v) => v.status === "approved");
  const pendingVideos = videos.filter((v) => v.status !== "approved");

  if (showUpload) {
    return <VideoUploadForm wordId={wordId} wordText={wordText} onClose={() => setShowUpload(false)} />;
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h4 className="flex items-center gap-2 text-base font-black text-slate-900">
            <Video className="h-5 w-5 text-blue-500" />
            Ký hiệu từ cộng đồng
            {approvedVideos.length > 0 && (
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">
                {approvedVideos.length}
              </span>
            )}
          </h4>
          <p className="mt-0.5 text-xs font-medium text-slate-400">
            Video ký hiệu do cộng đồng đóng góp và đã được kiểm duyệt
          </p>
        </div>
        {isLoggedIn ? (
          <Button onClick={() => setShowUpload(true)} size="sm" className="shrink-0 gap-1.5 rounded-full">
            <Upload className="h-3.5 w-3.5" />
            Đóng góp video
          </Button>
        ) : (
          <a
            href="/dang-nhap"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 transition hover:bg-blue-100"
          >
            <LogIn className="h-3.5 w-3.5" />
            Đăng nhập để đóng góp
          </a>
        )}
      </div>

      {/* Video Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
          <span className="ml-2 text-sm font-semibold text-slate-400">Đang tải video...</span>
        </div>
      ) : approvedVideos.length === 0 && pendingVideos.length === 0 ? (
        /* Empty state */
        compactEmpty ? (
          <p className="rounded-xl bg-slate-50 p-3 text-sm font-semibold text-slate-500">
            Chưa có video cộng đồng cho từ này.
          </p>
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-gradient-to-br from-slate-50 to-blue-50/30 p-8 text-center">
            <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-blue-100 text-blue-500">
              <Video className="h-7 w-7" />
            </div>
            <p className="text-sm font-bold text-slate-600">
              Chưa có video đóng góp nào
            </p>
            <p className="mx-auto mt-1.5 max-w-sm text-xs font-medium leading-5 text-slate-400">
              Hãy là người đầu tiên chia sẻ cách bạn thực hiện ký hiệu này. Video sẽ được kiểm duyệt trước khi hiển thị.
            </p>
            {isLoggedIn ? (
              <Button onClick={() => setShowUpload(true)} size="sm" className="mt-4 gap-1.5 rounded-full">
                <Upload className="h-3.5 w-3.5" />
                Tải lên video đầu tiên
              </Button>
            ) : (
              <a
                href="/dang-nhap"
                className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-700"
              >
                <LogIn className="h-3.5 w-3.5" />
                Đăng nhập để đóng góp
              </a>
            )}
          </div>
        )
      ) : (
        <div className="space-y-3">
          {/* Approved videos - horizontal scroll */}
          {approvedVideos.length > 0 && (
            <div className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-3">
              {approvedVideos.map((vid) => (
                <VideoCard
                  key={vid.id}
                  video={vid}
                  isOwner={vid.user_id === userId}
                  isAdmin={userRole === "admin"}
                  playing={playingId === vid.id}
                  onPlay={() => setPlayingId(playingId === vid.id ? null : vid.id)}
                  onDelete={() => deleteVideo(vid.id)}
                />
              ))}
            </div>
          )}

          {/* Pending/rejected videos (only visible to owner or admin) */}
          {pendingVideos.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Video của bạn</p>
              <div className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-3">
                {pendingVideos.map((vid) => (
                  <VideoCard
                    key={vid.id}
                    video={vid}
                    isOwner={vid.user_id === userId}
                    isAdmin={userRole === "admin"}
                    playing={playingId === vid.id}
                    onPlay={() => setPlayingId(playingId === vid.id ? null : vid.id)}
                    onDelete={() => deleteVideo(vid.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Video Card ─── */
function VideoCard({
  video,
  isOwner,
  isAdmin,
  playing,
  onPlay,
  onDelete,
}: {
  video: Contribution;
  isOwner: boolean;
  isAdmin: boolean;
  playing: boolean;
  onPlay: () => void;
  onDelete: () => void;
}) {
  const profile = video.profiles;
  const author = profile?.full_name ?? "Thành viên CHẠM";
  const statusBadge = video.status === "pending"
    ? { label: "Đang chờ duyệt", className: "bg-amber-500 text-white" }
    : video.status === "rejected"
    ? { label: "Từ chối", className: "bg-red-500 text-white" }
    : null;

  return (
    <div className="group relative w-[240px] shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md sm:w-[260px]">
      {/* Video area */}
      <div className="relative aspect-video w-full bg-slate-950">
        {playing ? (
          <video
            src={video.video_url}
            className="h-full w-full object-contain"
            controls
            autoPlay
          />
        ) : (
          <button
            type="button"
            onClick={onPlay}
            className="group/play relative flex h-full w-full items-center justify-center"
          >
            {/* Dark overlay with play button */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-slate-950/40" />
            <div className="relative z-10 grid h-12 w-12 place-items-center rounded-full bg-white/90 text-blue-600 shadow-lg backdrop-blur-sm transition group-hover/play:scale-110 group-hover/play:bg-white">
              <Play className="h-5 w-5 ml-0.5" />
            </div>
          </button>
        )}

        {/* Status badge */}
        {statusBadge && (
          <span className={`absolute left-2 top-2 z-10 rounded-md px-2 py-0.5 text-[10px] font-black shadow ${statusBadge.className}`}>
            {statusBadge.label}
          </span>
        )}

        {/* Delete button */}
        {(isOwner || isAdmin) && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="absolute right-2 top-2 z-10 grid h-7 w-7 place-items-center rounded-full bg-red-600/90 text-white opacity-0 shadow transition group-hover:opacity-100 hover:bg-red-700 active:scale-95"
            aria-label="Xóa video"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Info area */}
      <div className="flex items-center gap-2.5 p-3">
        <UserAvatar
          avatarUrl={profile?.avatar_url}
          fullName={profile?.full_name}
          size="sm"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-slate-800">{author}</p>
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
            <Clock className="h-3 w-3" />
            {formatTimeAgo(video.created_at)}
          </div>
        </div>
      </div>

      {/* Description */}
      {video.description && (
        <p className="border-t border-slate-100 px-3 py-2 text-xs font-medium italic leading-relaxed text-slate-500">
          &quot;{video.description}&quot;
        </p>
      )}
    </div>
  );
}
