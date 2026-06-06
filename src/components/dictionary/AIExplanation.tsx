"use client";

import { useState } from "react";
import { Bot, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type AIExplanationProps = {
  word: string;
  hasSignData: boolean;
  context?: string;
};

export function AIExplanation({ word, hasSignData, context }: AIExplanationProps) {
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetched, setFetched] = useState(false);

  async function fetchExplanation() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word, hasSignData, context }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Đã xảy ra lỗi.");
        return;
      }
      setExplanation(data.explanation);
      setFetched(true);
    } catch {
      setError("Hiện tại CHẠM chưa thể giải thích từ này bằng AI. Bạn hãy thử lại sau nhé.");
    } finally {
      setLoading(false);
    }
  }

  if (!fetched && !loading) {
    return (
      <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
        <Button
          onClick={fetchExplanation}
          disabled={loading}
          variant="secondary"
          className="w-full rounded-full gap-2"
        >
          <Bot className="h-5 w-5" aria-hidden="true" />
          {hasSignData ? "Hỏi AI thêm về từ này" : "Nhờ AI giải thích nghĩa từ này"}
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 sm:p-5">
      <div className="mb-3 flex items-center gap-2 text-sm font-black text-blue-700">
        <Bot className="h-5 w-5" aria-hidden="true" />
        AI giải thích
      </div>
      {loading ? (
        <div className="flex items-center gap-3 py-4 text-sm font-semibold text-blue-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          CHẠM đang giải thích...
        </div>
      ) : error ? (
        <div className="rounded-xl bg-orange-50 p-3 text-sm font-semibold text-orange-900">
          {error}
          <Button
            onClick={fetchExplanation}
            variant="outline"
            size="sm"
            className="mt-3 rounded-full"
          >
            Thử lại
          </Button>
        </div>
      ) : explanation ? (
        <div className="whitespace-pre-line text-sm font-semibold leading-7 text-slate-700 sm:text-base sm:leading-8">
          {explanation}
        </div>
      ) : null}
    </div>
  );
}
