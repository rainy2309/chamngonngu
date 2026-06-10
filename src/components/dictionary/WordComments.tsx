"use client";

import { useEffect, useState } from "react";
import { MessageCircle, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/client";

type Comment = {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles?: { full_name: string | null; role: string; avatar_url: string | null } | null;
};

const roleLabels: Record<string, string> = {
  user: "Người dùng",
  admin: "Quản trị viên",
};

const roleBadgeColors: Record<string, string> = {
  user: "bg-blue-50 text-blue-700",
  admin: "bg-amber-50 text-amber-700",
};

export function WordComments({ wordId, compact = false }: { wordId: string; compact?: boolean }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (!hasSupabaseEnv()) return;
    const supabase = createClient();

    async function load() {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
          setIsLoggedIn(true);
        }

        const { data } = await supabase
          .from("word_comments")
          .select("id, content, created_at, user_id, profiles(full_name, role, avatar_url)")
          .eq("word_id", wordId)
          .order("created_at", { ascending: true });

        if (data) setComments(data as unknown as Comment[]);
      } catch (err) {
        console.error("Load comments error:", err);
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [wordId]);

  async function submitComment() {
    if (!newComment.trim() || submitting || !isLoggedIn || !userId) return;
    setSubmitting(true);
    try {
      const supabase = createClient();

      // Fail-safe: Ensure user profile exists before inserting comments
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", userId)
        .maybeSingle();

      if (!profile) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from("profiles").insert({
            id: userId,
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "Thành viên CHẠM",
            role: user.user_metadata?.role || "user",
            avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
          });
        }
      }

      const { data, error } = await supabase
        .from("word_comments")
        .insert({ word_id: wordId, content: newComment.trim(), user_id: userId })
        .select("id, content, created_at, user_id, profiles(full_name, role, avatar_url)")
        .single();

      if (error) {
        console.error("Submit comment error:", error);
        return;
      }
      if (data) {
        setComments((prev) => [...prev, data as unknown as Comment]);
        setNewComment("");
      }
    } catch (err) {
      console.error("Submit comment error:", err);
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteComment(commentId: string) {
    try {
      const supabase = createClient();
      await supabase.from("word_comments").delete().eq("id", commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      console.error("Delete comment error:", err);
    }
  }

  function formatTime(dateStr: string) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return "Vừa xong";
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    return `${Math.floor(diff / 86400)} ngày trước`;
  }

  return (
    <div className={`rounded-2xl border border-blue-100 bg-white ${compact ? "p-3" : "p-4 sm:p-5"}`}>
      <h3 className={`${compact ? "mb-3" : "mb-4"} flex items-center gap-2 text-base font-black text-slate-950`}>
        <MessageCircle className="h-5 w-5 text-blue-500" aria-hidden="true" />
        Bình luận từ cộng đồng {comments.length > 0 ? `(${comments.length})` : ""}
      </h3>

      {loading ? (
        <p className="py-4 text-center text-sm font-semibold text-slate-400">Đang tải bình luận...</p>
      ) : comments.length === 0 ? (
        <p className="rounded-xl bg-slate-50 p-3 text-center text-sm font-semibold text-slate-500">
          Chưa có bình luận nào. Hãy là người đầu tiên chia sẻ!
        </p>
      ) : (
        <div className="grid gap-3">
          {comments.map((comment) => {
            const profile = comment.profiles;
            const role = profile?.role ?? "user";
            return (
              <div key={comment.id} className="rounded-xl bg-slate-50 p-3">
                <div className="flex items-center gap-2 text-xs">
                  <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-blue-100 text-xs font-black text-blue-700">
                    {(profile?.full_name ?? "?")[0]?.toUpperCase()}
                  </div>
                  <span className="font-bold text-slate-800">{profile?.full_name ?? "Người dùng"}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${roleBadgeColors[role] ?? roleBadgeColors.user}`}>
                    {roleLabels[role] ?? role}
                  </span>
                  <span className="text-slate-400">{formatTime(comment.created_at)}</span>
                  {comment.user_id === userId ? (
                    <button
                      type="button"
                      onClick={() => deleteComment(comment.id)}
                      className="ml-auto text-slate-400 hover:text-red-500"
                      aria-label="Xóa bình luận"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  ) : null}
                </div>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">{comment.content}</p>
              </div>
            );
          })}
        </div>
      )}

      {isLoggedIn ? (
        <div className="mt-4 flex gap-2">
          <input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value.slice(0, 1000))}
            placeholder="Viết bình luận bổ sung nghĩa..."
            disabled={submitting}
            className="min-h-11 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-blue-100"
            onKeyDown={(e) => e.key === "Enter" && submitComment()}
          />
          <Button
            onClick={submitComment}
            disabled={submitting || !newComment.trim()}
            size="sm"
            className="h-11 rounded-xl px-4"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <p className="mt-4 rounded-xl bg-blue-50 p-3 text-center text-sm font-semibold text-blue-700">
          <a href="/dang-nhap" className="underline hover:text-blue-900">Đăng nhập</a> để bình luận và đóng góp cho cộng đồng.
        </p>
      )}
    </div>
  );
}
