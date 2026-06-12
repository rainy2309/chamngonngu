"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Check,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Send,
  Smile,
  ThumbsUp,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/common/UserAvatar";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/client";

/* ─── Types ─── */
type Comment = {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  parent_id?: string | null;
  profiles?: { full_name: string | null; role: string; avatar_url: string | null } | null;
};

type ReactionType = "like" | "heart" | "laugh";

type ReactionRow = {
  id: string;
  comment_id: string;
  user_id: string;
  reaction_type: ReactionType;
};

type ReactionSummary = {
  counts: Record<ReactionType, number>;
  total: number;
  userReaction: ReactionType | null;
};

const REACTION_ICONS: Record<ReactionType, { icon: string; label: string }> = {
  like: { icon: "👍", label: "Thích" },
  heart: { icon: "❤️", label: "Tim" },
  laugh: { icon: "😄", label: "Cười" },
};

const COMPOSER_EMOJIS = ["😀", "😍", "👍", "❤️", "👏", "🙏", "🤔", "😄"];

/* ─── Helpers ─── */
function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return "Vừa xong";
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`;
  return date.toLocaleDateString("vi-VN", { day: "numeric", month: "short" });
}

function buildReactionMap(
  reactions: ReactionRow[],
  userId: string | null
): Record<string, ReactionSummary> {
  const map: Record<string, ReactionSummary> = {};
  for (const r of reactions) {
    if (!map[r.comment_id]) {
      map[r.comment_id] = { counts: { like: 0, heart: 0, laugh: 0 }, total: 0, userReaction: null };
    }
    const summary = map[r.comment_id];
    summary.counts[r.reaction_type]++;
    summary.total++;
    if (r.user_id === userId) {
      summary.userReaction = r.reaction_type;
    }
  }
  return map;
}

/* ─── Main Component ─── */
export function WordComments({ wordId }: { wordId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<{ full_name: string | null; avatar_url: string | null } | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [updatingCommentId, setUpdatingCommentId] = useState<string | null>(null);
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);
  const [reactionMap, setReactionMap] = useState<Record<string, ReactionSummary>>({});
  const [togglingReaction, setTogglingReaction] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const reactionPickerRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const commentInputRef = useRef<HTMLInputElement>(null);

  /* ─── Load Data ─── */
  const loadData = useCallback(async () => {
    if (!hasSupabaseEnv()) return;
    const supabase = createClient();
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        setIsLoggedIn(true);
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, full_name, avatar_url")
          .eq("id", user.id)
          .maybeSingle();
        if (profile) {
          setUserRole(profile.role);
          setUserProfile({ full_name: profile.full_name, avatar_url: profile.avatar_url });
        }
      }

      // Load comments
      const { data: commentsData } = await supabase
        .from("word_comments")
        .select("id, content, created_at, user_id, parent_id, profiles(full_name, role, avatar_url)")
        .eq("word_id", wordId)
        .order("created_at", { ascending: true });

      if (commentsData) {
        setComments(commentsData as unknown as Comment[]);

        // Load reactions for all comments
        const commentIds = commentsData.map((c: any) => c.id);
        if (commentIds.length > 0) {
          const { data: reactionsData } = await supabase
            .from("comment_reactions")
            .select("id, comment_id, user_id, reaction_type")
            .in("comment_id", commentIds);
          if (reactionsData) {
            setReactionMap(buildReactionMap(reactionsData as ReactionRow[], user?.id ?? null));
          }
        }
      }
    } catch (err) {
      console.error("Load comments error:", err);
    } finally {
      setLoading(false);
    }
  }, [wordId]);

  useEffect(() => { void loadData(); }, [loadData]);

  // Close menus/popovers on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      if (menuRef.current && !menuRef.current.contains(target)) {
        setActiveMenuId(null);
      }
      // Only close reaction picker if click is outside the picker itself
      if (reactionPickerRef.current && !reactionPickerRef.current.contains(target)) {
        setShowReactionPicker(null);
      }
      // Close emoji picker if click is outside
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(target)) {
        setShowEmojiPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Organize comments into threads
  const topLevelComments = comments.filter((c) => !c.parent_id);
  const repliesByParent = comments.reduce<Record<string, Comment[]>>((acc, c) => {
    if (c.parent_id) {
      if (!acc[c.parent_id]) acc[c.parent_id] = [];
      acc[c.parent_id].push(c);
    }
    return acc;
  }, {});

  /* ─── Submit Comment ─── */
  async function submitComment() {
    if (!newComment.trim() || submitting || !isLoggedIn || !userId) return;
    setSubmitting(true);
    try {
      const supabase = createClient();

      // Ensure profile exists
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
        .select("id, content, created_at, user_id, parent_id, profiles(full_name, role, avatar_url)")
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

  /* ─── Submit Reply ─── */
  async function submitReply(parentId: string) {
    if (!replyContent.trim() || submittingReply || !isLoggedIn || !userId) return;
    setSubmittingReply(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("word_comments")
        .insert({
          word_id: wordId,
          content: replyContent.trim(),
          user_id: userId,
          parent_id: parentId,
        })
        .select("id, content, created_at, user_id, parent_id, profiles(full_name, role, avatar_url)")
        .single();

      if (error) {
        console.error("Submit reply error:", error);
        return;
      }
      if (data) {
        setComments((prev) => [...prev, data as unknown as Comment]);
        setReplyContent("");
        setReplyingToId(null);
        setExpandedReplies((prev) => new Set(prev).add(parentId));
      }
    } catch (err) {
      console.error("Submit reply error:", err);
    } finally {
      setSubmittingReply(false);
    }
  }

  /* ─── Update Comment ─── */
  async function updateComment(commentId: string) {
    if (!editingContent.trim() || updatingCommentId) return;
    setUpdatingCommentId(commentId);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("word_comments")
        .update({ content: editingContent.trim(), updated_at: new Date().toISOString() })
        .eq("id", commentId);

      if (error) {
        console.error("Update comment error:", error);
        return;
      }

      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, content: editingContent.trim() } : c))
      );
      setEditingCommentId(null);
      setEditingContent("");
    } catch (err) {
      console.error("Update comment error:", err);
    } finally {
      setUpdatingCommentId(null);
    }
  }

  /* ─── Delete Comment ─── */
  async function deleteComment(commentId: string) {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bình luận này?")) return;
    setActiveMenuId(null);
    try {
      const supabase = createClient();
      await supabase.from("word_comments").delete().eq("id", commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId && c.parent_id !== commentId));
    } catch (err) {
      console.error("Delete comment error:", err);
    }
  }

  /* ─── Toggle Reaction (DB-backed) ─── */
  async function toggleReaction(commentId: string, type: ReactionType) {
    if (!isLoggedIn || !userId || togglingReaction) return;
    setTogglingReaction(true);
    setShowReactionPicker(null);

    const currentReaction = reactionMap[commentId]?.userReaction ?? null;

    // Optimistic update
    setReactionMap((prev) => {
      const current = prev[commentId] ?? { counts: { like: 0, heart: 0, laugh: 0 }, total: 0, userReaction: null };
      const newCounts = { ...current.counts };
      let newTotal = current.total;

      if (currentReaction) {
        newCounts[currentReaction] = Math.max(0, newCounts[currentReaction] - 1);
        newTotal--;
      }

      if (currentReaction === type) {
        // Remove reaction
        return { ...prev, [commentId]: { counts: newCounts, total: newTotal, userReaction: null } };
      }

      // Add/change reaction
      newCounts[type]++;
      newTotal++;
      return { ...prev, [commentId]: { counts: newCounts, total: newTotal, userReaction: type } };
    });

    try {
      const supabase = createClient();

      if (currentReaction === type) {
        // Remove reaction
        await supabase
          .from("comment_reactions")
          .delete()
          .eq("comment_id", commentId)
          .eq("user_id", userId);
      } else if (currentReaction) {
        // Change reaction type
        await supabase
          .from("comment_reactions")
          .update({ reaction_type: type })
          .eq("comment_id", commentId)
          .eq("user_id", userId);
      } else {
        // Insert new reaction
        await supabase
          .from("comment_reactions")
          .insert({ comment_id: commentId, user_id: userId, reaction_type: type });
      }
    } catch (err) {
      console.error("Toggle reaction error:", err);
      // Revert on error by reloading
      void loadData();
    } finally {
      setTogglingReaction(false);
    }
  }

  /* ─── Render Comment ─── */
  function renderComment(comment: Comment, isReply = false) {
    const profile = comment.profiles;
    const role = profile?.role ?? "user";
    const isAdmin = role === "admin";
    const replies = repliesByParent[comment.id] ?? [];
    const isExpanded = expandedReplies.has(comment.id);
    const summary = reactionMap[comment.id];
    const canEdit = comment.user_id === userId;
    const canDelete = comment.user_id === userId || userRole === "admin";

    return (
      <div key={comment.id} className={`group ${isReply ? "ml-10 sm:ml-12" : ""}`}>
        <div className="flex gap-3">
          <UserAvatar
            avatarUrl={profile?.avatar_url}
            fullName={profile?.full_name}
            size="sm"
          />
          <div className="min-w-0 flex-1">
            {/* Name & Time */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">
                {profile?.full_name ?? "Người dùng"}
              </span>
              {isAdmin && (
                <span className="flex items-center gap-0.5 rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] font-black text-white">
                  ✓ CHẠM
                </span>
              )}
              <span className="text-xs text-slate-400">• {formatTime(comment.created_at)}</span>
            </div>

            {/* Content */}
            {editingCommentId === comment.id ? (
              <div className="mt-1.5 flex gap-2">
                <input
                  value={editingContent}
                  onChange={(e) => setEditingContent(e.target.value.slice(0, 1000))}
                  disabled={updatingCommentId === comment.id}
                  className="min-h-9 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                  onKeyDown={(e) => e.key === "Enter" && updateComment(comment.id)}
                  autoFocus
                />
                <button onClick={() => updateComment(comment.id)} disabled={updatingCommentId === comment.id || !editingContent.trim()} className="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
                  <Check className="h-4 w-4" />
                </button>
                <button onClick={() => { setEditingCommentId(null); setEditingContent(""); }} disabled={updatingCommentId === comment.id} className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <p className="mt-0.5 text-sm leading-relaxed text-slate-700">{comment.content}</p>
            )}

            {/* Reaction badges */}
            {summary && summary.total > 0 && (
              <div className="mt-1.5 flex items-center gap-1">
                <div className="inline-flex items-center gap-0.5 rounded-full bg-slate-100 px-2 py-0.5 text-xs">
                  {(Object.entries(summary.counts) as [ReactionType, number][])
                    .filter(([, count]) => count > 0)
                    .sort(([, a], [, b]) => b - a)
                    .map(([type]) => (
                      <span key={type}>{REACTION_ICONS[type].icon}</span>
                    ))}
                  <span className="ml-0.5 font-bold text-slate-600">{summary.total}</span>
                </div>
              </div>
            )}

            {/* Action row */}
            {editingCommentId !== comment.id && (
              <div className="mt-1.5 flex items-center gap-3 text-xs">
                {/* Like button with reaction picker */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isLoggedIn) return;
                      // Toggle picker on click; quick-like on direct click if picker not open
                      if (showReactionPicker === comment.id) {
                        toggleReaction(comment.id, "like");
                      } else {
                        setShowReactionPicker(comment.id);
                      }
                    }}
                    onMouseEnter={() => isLoggedIn && setShowReactionPicker(comment.id)}
                    className={`flex items-center gap-1 font-semibold transition ${
                      summary?.userReaction ? "text-blue-600" : "text-slate-400 hover:text-blue-600"
                    } ${!isLoggedIn ? "cursor-default opacity-60" : ""}`}
                    title={isLoggedIn ? "Thích" : "Đăng nhập để tương tác"}
                  >
                    <ThumbsUp className="h-3.5 w-3.5" />
                    {summary?.userReaction
                      ? REACTION_ICONS[summary.userReaction].label
                      : "Thích"}
                  </button>
                  {showReactionPicker === comment.id && isLoggedIn && (
                    <div
                      ref={reactionPickerRef}
                      className="absolute -top-11 left-0 z-30 flex gap-0.5 rounded-full border border-slate-200 bg-white p-1 shadow-lg"
                      onMouseLeave={() => setShowReactionPicker(null)}
                    >
                      {(Object.entries(REACTION_ICONS) as [ReactionType, { icon: string; label: string }][]).map(([type, { icon, label }]) => (
                        <button
                          key={type}
                          type="button"
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleReaction(comment.id, type);
                          }}
                          className={`grid h-8 w-8 place-items-center rounded-full text-lg transition hover:scale-125 ${
                            summary?.userReaction === type ? "bg-blue-50 ring-2 ring-blue-200" : "hover:bg-slate-50"
                          }`}
                          title={label}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Reply button */}
                {!isReply && isLoggedIn && (
                  <button
                    type="button"
                    onClick={() => { setReplyingToId(replyingToId === comment.id ? null : comment.id); setReplyContent(""); }}
                    className="flex items-center gap-1 font-semibold text-slate-400 transition hover:text-blue-600"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    Trả lời
                  </button>
                )}

                {/* Three-dot menu */}
                {(canEdit || canDelete) && (
                  <div className="relative ml-auto" ref={activeMenuId === comment.id ? menuRef : undefined}>
                    <button
                      type="button"
                      onClick={() => setActiveMenuId(activeMenuId === comment.id ? null : comment.id)}
                      className="grid h-6 w-6 place-items-center rounded-full text-slate-300 opacity-0 transition group-hover:opacity-100 hover:bg-slate-100 hover:text-slate-600"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                    {activeMenuId === comment.id && (
                      <div className="absolute right-0 top-7 z-20 min-w-[140px] rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                        {canEdit && (
                          <button
                            type="button"
                            onClick={() => { setEditingCommentId(comment.id); setEditingContent(comment.content); setActiveMenuId(null); }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                          >
                            <Pencil className="h-3.5 w-3.5" /> Chỉnh sửa
                          </button>
                        )}
                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => deleteComment(comment.id)}
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Xóa
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Replies section */}
        {!isReply && replies.length > 0 && (
          <div className="mt-2">
            {replies.length > 1 && !isExpanded ? (
              <>
                {renderComment(replies[0], true)}
                <button
                  type="button"
                  onClick={() => setExpandedReplies((prev) => new Set(prev).add(comment.id))}
                  className="ml-10 mt-1 flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 sm:ml-12"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                  Xem thêm {replies.length - 1} phản hồi
                </button>
              </>
            ) : (
              <>
                {replies.map((reply) => renderComment(reply, true))}
                {replies.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setExpandedReplies((prev) => { const next = new Set(prev); next.delete(comment.id); return next; })}
                    className="ml-10 mt-1 flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 sm:ml-12"
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                    Ẩn phản hồi
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {/* Reply input */}
        {replyingToId === comment.id && (
          <div className="ml-10 mt-2 flex gap-2 sm:ml-12">
            <UserAvatar
              avatarUrl={userProfile?.avatar_url}
              fullName={userProfile?.full_name}
              size="sm"
            />
            <div className="flex min-w-0 flex-1 gap-2">
              <input
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value.slice(0, 1000))}
                placeholder={`Trả lời ${profile?.full_name ?? ""}...`}
                disabled={submittingReply}
                className="min-h-9 min-w-0 flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
                onKeyDown={(e) => e.key === "Enter" && submitReply(comment.id)}
                autoFocus
              />
              <button
                onClick={() => submitReply(comment.id)}
                disabled={submittingReply || !replyContent.trim()}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-blue-600 text-white transition hover:bg-blue-700 disabled:opacity-40"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Comment Composer */}
      {isLoggedIn ? (
        <div className="flex gap-3">
          <UserAvatar
            avatarUrl={userProfile?.avatar_url}
            fullName={userProfile?.full_name}
            size="md"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 pl-4 pr-1.5 transition focus-within:border-blue-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100">
              <input
                ref={commentInputRef}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value.slice(0, 1000))}
                placeholder="Chia sẻ cảm nhận hoặc đặt câu hỏi về ký hiệu này..."
                disabled={submitting}
                className="min-h-[42px] min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                onKeyDown={(e) => e.key === "Enter" && submitComment()}
              />
              <div className="flex items-center gap-1">
                <div className="relative" ref={emojiPickerRef}>
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker((prev) => !prev)}
                    className="grid h-8 w-8 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                    title="Biểu cảm"
                  >
                    <Smile className="h-4 w-4" />
                  </button>
                  {showEmojiPicker && (
                    <div className="absolute right-0 bottom-full mb-2 z-[9999] grid grid-cols-4 gap-1.5 rounded-2xl border border-slate-100 bg-white p-2 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200 min-w-[160px]">
                      {COMPOSER_EMOJIS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => {
                            setNewComment((prev) => prev + emoji);
                            setShowEmojiPicker(false);
                            commentInputRef.current?.focus();
                          }}
                          className="grid h-9 w-9 place-items-center rounded-xl text-lg transition hover:scale-125 hover:bg-slate-50 active:scale-95"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <Button
                  onClick={submitComment}
                  disabled={submitting || !newComment.trim()}
                  size="sm"
                  className="h-8 rounded-full px-4 text-xs font-bold"
                >
                  Bình luận
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-blue-50 p-4 text-center">
          <p className="text-sm font-semibold text-blue-700">
            <a href="/dang-nhap" className="font-bold underline hover:text-blue-900">Đăng nhập</a> để bình luận và đóng góp cho cộng đồng.
          </p>
        </div>
      )}

      {/* Comments list */}
      <div className="mt-5">
        {loading ? (
          <p className="py-6 text-center text-sm font-semibold text-slate-400">Đang tải bình luận...</p>
        ) : topLevelComments.length === 0 ? (
          <div className="py-6 text-center">
            <MessageCircle className="mx-auto h-10 w-10 text-slate-200" />
            <p className="mt-2 text-sm font-semibold text-slate-400">
              Chưa có bình luận nào. Hãy là người đầu tiên chia sẻ!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {topLevelComments.map((comment) => renderComment(comment))}
          </div>
        )}
      </div>
    </div>
  );
}
