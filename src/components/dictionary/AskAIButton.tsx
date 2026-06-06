"use client";

import { useState } from "react";
import { Bot, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

type AskAIButtonProps = {
  word: string;
  hasSignData: boolean;
  context?: string;
};

export function AskAIButton({ word, hasSignData, context }: AskAIButtonProps) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function ask() {
    if (!question.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word, question: question.trim(), hasSignData, context }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Đã xảy ra lỗi.");
        return;
      }
      setAnswer(data.explanation);
    } catch {
      setError("Hiện tại CHẠM chưa thể trả lời. Bạn hãy thử lại sau nhé.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        className="w-full rounded-full gap-2 border-blue-200 text-blue-700 hover:bg-blue-50"
      >
        <Bot className="h-4 w-4" aria-hidden="true" />
        Hỏi AI thêm về từ này
      </Button>
    );
  }

  return (
    <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
      <p className="mb-3 flex items-center gap-2 text-sm font-black text-blue-700">
        <Bot className="h-5 w-5" aria-hidden="true" />
        Hỏi AI thêm về &quot;{word}&quot;
      </p>
      <div className="flex gap-2">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value.slice(0, 300))}
          placeholder="VD: Từ này dùng trong hoàn cảnh nào?"
          disabled={loading}
          className="min-h-11 min-w-0 flex-1 rounded-xl border border-blue-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-blue-100"
          onKeyDown={(e) => e.key === "Enter" && ask()}
        />
        <Button
          onClick={ask}
          disabled={loading || !question.trim()}
          size="sm"
          className="h-11 rounded-xl px-4"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
      <p className="mt-1 text-xs font-medium text-slate-400">{question.length}/300 ký tự</p>

      {error ? (
        <p className="mt-3 rounded-xl bg-orange-50 p-3 text-sm font-semibold text-orange-900">{error}</p>
      ) : null}

      {answer ? (
        <div className="mt-3 whitespace-pre-line rounded-xl bg-white p-3 text-sm font-semibold leading-7 text-slate-700">
          {answer}
        </div>
      ) : null}
    </div>
  );
}
