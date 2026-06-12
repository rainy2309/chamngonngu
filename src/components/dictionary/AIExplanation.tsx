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
      <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blue-100 text-blue-600">
            <Info className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-blue-800">
              AI hỗ trợ đang trong quá trình phát triển
            </p>
            <p className="mt-1 text-xs font-medium leading-5 text-blue-600">
              Tính năng giải thích bằng AI sẽ sớm được ra mắt. Cảm ơn bạn đã quan tâm!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
      <Button
        onClick={() => setShowNotice(true)}
        variant="secondary"
        className="w-full rounded-full gap-2"
      >
        <Bot className="h-5 w-5" aria-hidden="true" />
        {hasSignData ? "Hỏi AI thêm về từ này" : "Nhờ AI giải thích nghĩa từ này"}
      </Button>
    </div>
  );
}
