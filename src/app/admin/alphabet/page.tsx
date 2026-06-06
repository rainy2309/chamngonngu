"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Edit, Loader2, Plus, Search, Trash2, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/client";

type AlphabetItem = {
  id: string;
  letter_key: string;
  letter: string;
  title: string;
  video_url?: string | null;
  status: string;
  display_order: number;
};

export default function AdminAlphabetPage() {
  const [letters, setLetters] = useState<AlphabetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadAlphabet();
  }, []);

  async function loadAlphabet() {
    if (!hasSupabaseEnv()) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("alphabet_media")
      .select("id, letter_key, letter, title, video_url, status, display_order")
      .order("display_order", { ascending: true })
      .order("letter", { ascending: true });

    if (data) {
      setLetters(data);
    }
    setLoading(false);
  }

  async function deleteLetter(id: string) {
    if (!confirm("Bạn có chắc muốn xóa chữ cái này khỏi hệ thống?")) return;
    setDeleting(id);
    const supabase = createClient();
    await supabase.from("alphabet_media").delete().eq("id", id);
    setLetters((prev) => prev.filter((w) => w.id !== id));
    setDeleting(null);
  }

  const filtered = letters.filter((item) => {
    return (
      !query ||
      item.letter.toLowerCase().includes(query.toLowerCase()) ||
      item.title.toLowerCase().includes(query.toLowerCase())
    );
  });

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-950">
            Quản lý bảng chữ cái
          </h1>
          <p className="mt-1 font-semibold text-slate-500">
            {letters.length} chữ cái trong hệ thống
          </p>
        </div>
        <Button asChild className="rounded-full gap-2">
          <Link href="/admin/alphabet/new">
            <Plus className="h-5 w-5" /> Thêm chữ cái mới
          </Link>
        </Button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 max-w-md">
          <Search className="h-5 w-5 text-slate-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm chữ cái..."
            className="border-0 focus-visible:ring-0"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-3 py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center">
          <p className="font-bold text-slate-500">
            {letters.length === 0
              ? "Chưa có chữ cái nào. Hãy seed dữ liệu hoặc thêm mới."
              : "Không tìm thấy kết quả phù hợp."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-6 py-3 font-black text-slate-700">Chữ cái</th>
                <th className="px-6 py-3 font-black text-slate-700">Tiêu đề</th>
                <th className="px-6 py-3 font-black text-slate-700">Thứ tự hiển thị</th>
                <th className="px-6 py-3 font-black text-slate-700">Trạng thái</th>
                <th className="px-6 py-3 font-black text-slate-700">Video ký hiệu</th>
                <th className="px-6 py-3 font-black text-slate-700">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-slate-50 hover:bg-blue-50/30"
                >
                  <td className="px-6 py-3 font-extrabold text-blue-700 text-lg">
                    {item.letter}
                  </td>
                  <td className="px-6 py-3 font-bold text-slate-900">
                    {item.title}
                  </td>
                  <td className="px-6 py-3 text-slate-600 font-semibold">
                    {item.display_order}
                  </td>
                  <td className="px-6 py-3">
                    <Badge
                      className={
                        item.status === "published"
                          ? "bg-green-50 text-green-700 hover:bg-green-50"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-100"
                      }
                    >
                      {item.status === "published" ? "Published" : "Draft"}
                    </Badge>
                  </td>
                  <td className="px-6 py-3">
                    {item.video_url ? (
                      <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">Đã gắn video</Badge>
                    ) : (
                      <Badge className="bg-red-50 text-red-600 hover:bg-red-50">Chưa có video</Badge>
                    )}
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/alphabet/${item.id}/edit`}
                        className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => deleteLetter(item.id)}
                        disabled={deleting === item.id}
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
        </div>
      )}
    </div>
  );
}
