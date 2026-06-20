"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, MessageSquareWarning } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient, hasSupabaseEnv, missingEnvMessage } from "@/lib/supabase/client";

const feedbackOptions = [
  { value: "ui_bug", label: "Lỗi giao diện" },
  { value: "video_data_bug", label: "Lỗi video / dữ liệu" },
  { value: "content_feedback", label: "Góp ý nội dung" },
  { value: "feature_request", label: "Góp ý tính năng" },
  { value: "other", label: "Khác" },
] as const;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FeedbackFormProps = {
  compact?: boolean;
};

export function FeedbackForm({ compact = false }: FeedbackFormProps) {
  const [feedbackType, setFeedbackType] = useState<(typeof feedbackOptions)[number]["value"]>("ui_bug");
  const [message, setMessage] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadUser() {
      if (!hasSupabaseEnv()) {
        return;
      }

      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!active || !user) {
          return;
        }

        setUserId(user.id);
        setContactEmail(user.email ?? "");
        setUserName(String(user.user_metadata.full_name ?? user.user_metadata.name ?? ""));
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.warn("Feedback user fallback:", error);
        }
      }
    }

    void loadUser();

    return () => {
      active = false;
    };
  }, []);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatusMessage("");
    setErrorMessage("");

    const trimmedMessage = message.trim();
    const trimmedEmail = contactEmail.trim();

    if (!hasSupabaseEnv()) {
      setErrorMessage(missingEnvMessage);
      return;
    }

    if (website.trim()) {
      setStatusMessage("Cảm ơn bạn đã góp ý cho CHẠM. Tụi mình sẽ xem xét để cải thiện trải nghiệm học.");
      return;
    }

    if (!feedbackType) {
      setErrorMessage("Vui lòng chọn loại góp ý.");
      return;
    }

    if (trimmedMessage.length < 5) {
      setErrorMessage("Nội dung góp ý cần có ít nhất 5 ký tự.");
      return;
    }

    if (trimmedEmail && !emailPattern.test(trimmedEmail)) {
      setErrorMessage("Email liên hệ chưa đúng định dạng.");
      return;
    }

    setSubmitting(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const metadataName = String(user?.user_metadata.full_name ?? user?.user_metadata.name ?? userName ?? "");

      const { error } = await supabase.from("user_feedback").insert({
        user_id: user?.id ?? userId,
        user_email: (user?.email ?? trimmedEmail) || null,
        user_name: metadataName || null,
        feedback_type: feedbackType,
        message: trimmedMessage,
        page_url: typeof window !== "undefined" ? window.location.href : null,
        user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
        status: "new",
      });

      if (error) {
        throw error;
      }

      setMessage("");
      if (!user?.email) {
        setContactEmail("");
      }
      setStatusMessage("Cảm ơn bạn đã góp ý cho CHẠM. Tụi mình sẽ xem xét để cải thiện trải nghiệm học.");
    } catch (error) {
      console.error("Feedback submit error:", error);
      setErrorMessage("Không thể gửi góp ý lúc này. Vui lòng thử lại sau.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className={compact ? "grid gap-4" : "grid gap-5"}>
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={website}
        onChange={(event) => setWebsite(event.target.value)}
        className="hidden"
        aria-hidden="true"
      />

      <label className="grid gap-2">
        <span className="text-sm font-black text-slate-800 dark:text-slate-100">Loại góp ý *</span>
        <select
          value={feedbackType}
          onChange={(event) => setFeedbackType(event.target.value as typeof feedbackType)}
          className="min-h-12 w-full rounded-2xl border border-blue-100 bg-white px-4 text-base font-bold text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          required
        >
          {feedbackOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-black text-slate-800 dark:text-slate-100">Nội dung góp ý *</span>
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={compact ? 4 : 5}
          minLength={5}
          placeholder="Bạn muốn góp ý điều gì cho CHẠM?"
          className="w-full resize-y rounded-2xl border border-blue-100 bg-white px-4 py-3 text-base font-semibold leading-7 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          required
        />
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-black text-slate-800 dark:text-slate-100">Email liên hệ (không bắt buộc)</span>
        <Input
          type="email"
          value={contactEmail}
          onChange={(event) => setContactEmail(event.target.value)}
          placeholder="tenban@example.com"
          className="rounded-2xl dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />
      </label>

      {statusMessage ? (
        <p className="flex gap-2 rounded-2xl bg-emerald-50 p-4 text-sm font-bold leading-6 text-emerald-800 ring-1 ring-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-200 dark:ring-emerald-500/20">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {statusMessage}
        </p>
      ) : null}

      {errorMessage ? (
        <p className="flex gap-2 rounded-2xl bg-orange-50 p-4 text-sm font-bold leading-6 text-orange-800 ring-1 ring-orange-100 dark:bg-orange-500/10 dark:text-orange-200 dark:ring-orange-500/20">
          <MessageSquareWarning className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {errorMessage}
        </p>
      ) : null}

      <Button type="submit" disabled={submitting} className="min-h-12 w-full rounded-full">
        {submitting ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : null}
        {submitting ? "Đang gửi..." : "Gửi góp ý"}
      </Button>
    </form>
  );
}
