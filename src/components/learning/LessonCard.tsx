import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { difficultyLabel } from "@/lib/utils";
import type { Lesson } from "@/types/vocabulary";

export function LessonCard({ lesson, progress }: { lesson: Lesson; progress: number }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-blue-800">{difficultyLabel(lesson.difficulty)}</span>
          <span className="text-sm font-semibold text-slate-500">{lesson.wordIds.length} từ</span>
        </div>
        <CardTitle>{lesson.topic}</CardTitle>
        <p className="leading-7 text-slate-600">{lesson.description}</p>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div>
          <div className="mb-2 flex justify-between text-sm font-semibold text-slate-600">
            <span>Tiến độ</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} />
        </div>
        <Button asChild>
          <Link href="/khoa-hoc">Bắt đầu học <ArrowRight className="h-5 w-5" /></Link>
        </Button>
      </CardContent>
    </Card>
  );
}
