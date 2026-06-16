"use client";

import { useState } from "react";
import { Bot, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

type AIExplanationProps = {
  word: string;
  hasSignData: boolean;
  context?: string;
};

export function AIExplanation({ word, hasSignData }: AIExplanationProps) {
  const [showNotice, setShowNotice] = useState(false);

  if (showNotice) {
    return (
      <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-3">
        <div className="flex items-start gap-2.5">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-blue-100 text-blue-600">
            <Info className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-blue-800">
              AI hỗ trợ đang trong quá trình phát triển
            </p>
            <p className="mt-0.5 text-[11px] font-medium leading-4 text-blue-600">
              Tính năng giải thích bằng AI sẽ sớm được ra mắt. Cảm ơn bạn đã quan tâm!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-2 text-center">
      <button
        type="button"
        onClick={() => setShowNotice(true)}
        className="mx-auto flex h-8 items-center justify-center gap-1.5 rounded-full border border-blue-100 bg-white px-4 text-xs font-semibold text-blue-600 shadow-sm transition hover:bg-blue-50 hover:text-blue-700 active:scale-95"
      >
        <Bot className="h-4 w-4" aria-hidden="true" />
        {hasSignData ? "Hỏi AI thêm về từ này" : "Nhờ AI giải thích nghĩa từ này"}
      </button>
    </div>
  );
}
