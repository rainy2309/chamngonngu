"use client";

import { Hand, PlaySquare, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { VocabularyItem } from "@/types/vocabulary";

export function Flashcard({ item, flipped, onFlip }: { item: VocabularyItem; flipped: boolean; onFlip: () => void }) {
  return (
    <Card className="min-h-[420px] rounded-[2rem] border-blue-100 shadow-lg shadow-blue-100/50">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <Badge className="bg-blue-50 text-blue-700 ring-blue-100">{item.category}</Badge>
          <Button variant="secondary" onClick={onFlip} className="rounded-full"><RotateCcw className="h-5 w-5" /> Lật thẻ</Button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-5">
        {!flipped ? (
          <>
            <div className="grid min-h-64 place-items-center rounded-[2rem] border border-blue-100 bg-blue-50 p-8 text-center">
              <div>
                <div className="mx-auto mb-4 grid h-20 w-20 place-items-center rounded-full bg-white text-blue-600 shadow-lg shadow-blue-100"><Hand className="h-10 w-10" /></div>
                <p className="text-2xl font-black text-blue-900">Gợi ý hình ảnh</p>
                <p className="mt-2 text-blue-800">{item.imageDescription}</p>
              </div>
            </div>
            <p className="text-center text-lg font-semibold text-slate-700">Quan sát hình và đoán từ tiếng Việt.</p>
          </>
        ) : (
          <div className="grid gap-4">
            <CardTitle className="text-4xl text-blue-700">{item.word}</CardTitle>
            <p className="text-xl leading-8 text-slate-700">{item.meaning}</p>
            <p className="rounded-2xl bg-slate-50 p-4 text-lg font-semibold text-slate-900">{item.exampleSentence}</p>
            <div className="rounded-2xl border border-dashed border-blue-200 bg-blue-50 p-4 text-blue-900">
              <div className="mb-2 flex items-center gap-2 font-bold"><PlaySquare className="h-5 w-5" /> Ký hiệu minh họa</div>
              <p>{item.signVideoPlaceholder}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
