"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Edit, Loader2, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/client";

type DictWord = {
  id: string;
  word_key: string;
  word: string;
  meaning: string;
  category: string;
  difficulty: string;
  region: string;
  status?: string;
  video_url?: string | null;
};

export default function AdminDictionaryPage() {
  const [words, setWords] = useState<DictWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Tất cả");
  const [categories, setCategories] = useState<string[]>([]);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadWords();
  }, []);

  async function loadWords() {
    if (!hasSupabaseEnv()) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("dictionary_words")
      .select("id, word_key, word, meaning, category, difficulty, region, video_url")
      .order("word", { ascending: true });

    if (data) {
      setWords(data);
      const uniqueCategories = [...new Set(data.map((w: DictWord) => w.category))].sort();
      setCategories(uniqueCategories);
    }
    setLoading(false);
  }

  async function deleteWord(id: string) {
    if (!confirm("Bạn có chắc muốn xóa từ này?")) return;
    setDeleting(id);
    const supabase = createClient();
    await supabase.from("dictionary_words").delete().eq("id", id);
    setWords((prev) => prev.filter((w) => w.id !== id));
    setDeleting(null);
  }

  const filtered = words.filter((w) => {
    const matchesQuery =
      !query ||
      w.word.toLowerCase().includes(query.toLowerCase()) ||
      w.meaning.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = category === "Tất cả" || w.category === category;
    return matchesQuery && matchesCategory;
  });

  const difficultyLabel: Record<string, string> = {
    easy: "Dễ",
    medium: "TB",
    hard: "Khó",
  };

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-950">
            Quản lý từ vựng
          </h1>
          <p className="mt-1 font-semibold text-slate-500">
            {words.length} từ trong hệ thống
          </p>
        </div>
        <Button asChild className="rounded-full gap-2">
          <Link href="/admin/dictionary/new">
            <Plus className="h-5 w-5" /> Thêm từ mới
          </Link>
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="mb-6 grid gap-3 sm:grid-cols-[1fr_auto]">
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3">
          <Search className="h-5 w-5 text-slate-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm từ hoặc nghĩa..."
            className="border-0 focus-visible:ring-0"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="min-h-11 rounded-xl border border-slate-200 bg-white px-4 font-semibold"
        >
          <option>Tất cả</option>
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-3 py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center">
          <p className="font-bold text-slate-500">
            {words.length === 0
              ? "Chưa có từ nào. Hãy seed dữ liệu hoặc thêm từ mới."
              : "Không tìm thấy từ phù hợp."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-4 py-3 font-black text-slate-700">Từ</th>
                <th className="px-4 py-3 font-black text-slate-700">Nghĩa</th>
                <th className="hidden px-4 py-3 font-black text-slate-700 md:table-cell">
                  Chủ đề
                </th>
                <th className="hidden px-4 py-3 font-black text-slate-700 sm:table-cell">
                  Độ khó
                </th>
                <th className="hidden px-4 py-3 font-black text-slate-700 lg:table-cell">
                  Video
                </th>
                <th className="px-4 py-3 font-black text-slate-700">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 100).map((w) => (
                <tr
                  key={w.id}
                  className="border-b border-slate-50 hover:bg-blue-50/30"
                >
                  <td className="px-4 py-3 font-bold text-slate-900">
                    {w.word}
                  </td>
                  <td className="max-w-[200px] truncate px-4 py-3 text-slate-600">
                    {w.meaning}
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <Badge>{w.category}</Badge>
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <Badge className="bg-emerald-50 text-emerald-700 ring-emerald-100">
                      {difficultyLabel[w.difficulty] ?? w.difficulty}
                    </Badge>
                  </td>
                  <td className="hidden px-4 py-3 lg:table-cell">
                    {w.video_url ? (
                      <Badge className="bg-green-50 text-green-700">Có</Badge>
                    ) : (
                      <span className="text-xs text-slate-400">Chưa có</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Link
                        href={`/admin/dictionary/${w.id}/edit`}
                        className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => deleteWord(w.id)}
                        disabled={deleting === w.id}
                        className="rounded-lg p-2 text-red-500 hover:bg-red-50 disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length > 100 && (
            <p className="border-t border-slate-100 p-4 text-center text-sm font-semibold text-slate-500">
              Hiển thị 100/{filtered.length} từ. Dùng bộ lọc để thu hẹp.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
