"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/client";

type Lesson = { id: string; topic: string; description: string; difficulty: string; word_ids: string[]; };

export default function AdminLessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!hasSupabaseEnv()) { setLoading(false); return; }
      const supabase = createClient();
      const { data } = await supabase.from("lessons").select("*").order("created_at");
      if (data) setLessons(data);
      setLoading(false);
    }
    void load();
  }, []);

  async function deleteLesson(id: string) {
    if (!confirm("Xóa bài học này?")) return;
    const supabase = createClient();
    await supabase.from("lessons").delete().eq("id", id);
    setLessons((prev) => prev.filter((l) => l.id !== id));
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-950">Quản lý bài học</h1>
          <p className="mt-1 font-semibold text-slate-500">{lessons.length} bài học</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
      ) : lessons.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center font-bold text-slate-500">
          Chưa có bài học. Hãy seed dữ liệu trước.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {lessons.map((l) => (
            <div key={l.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-black text-slate-900">{l.topic}</h3>
                  <p className="mt-1 text-sm text-slate-600">{l.description}</p>
                </div>
                <Badge className="bg-emerald-50 text-emerald-700">{l.difficulty}</Badge>
              </div>
              <p className="mt-3 text-xs font-semibold text-slate-400">
                {l.word_ids?.length ?? 0} từ vựng
              </p>
              <div className="mt-3 flex gap-2">
                <button onClick={() => deleteLesson(l.id)} className="rounded-lg p-2 text-red-500 hover:bg-red-50">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
