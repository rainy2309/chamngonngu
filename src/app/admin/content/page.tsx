"use client";

import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/client";

type ContentItem = {
  id: string;
  section_key: string;
  title: string | null;
  content: Record<string, any>;
};

const defaultSections = [
  { key: "home_hero", label: "Trang chủ - Hero" },
  { key: "about", label: "Giới thiệu dự án" },
  { key: "faq", label: "Câu hỏi thường gặp" },
  { key: "learning_guide", label: "Hướng dẫn học" },
];

export default function AdminContentPage() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      if (!hasSupabaseEnv()) { setLoading(false); return; }
      const supabase = createClient();
      const { data } = await supabase.from("site_content").select("*");
      if (data) setItems(data);
      setLoading(false);
    }
    void load();
  }, []);

  async function saveItem(item: ContentItem) {
    setSaving(item.id);
    setMessage("");
    const supabase = createClient();
    const { error } = await supabase
      .from("site_content")
      .upsert({ id: item.id, section_key: item.section_key, title: item.title, content: item.content });
    if (error) setMessage("Lỗi: " + error.message);
    else setMessage("Đã lưu " + item.section_key);
    setSaving(null);
  }

  function updateItem(id: string, field: string, value: any) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  }

  return (
    <div className="p-6 sm:p-8">
      <h1 className="mb-2 text-3xl font-black text-slate-950">Nội dung tĩnh</h1>
      <p className="mb-6 font-semibold text-slate-500">
        Chỉnh sửa nội dung trang chủ, giới thiệu, FAQ mà không cần sửa code.
      </p>

      {message && (
        <p className="mb-4 rounded-xl bg-blue-50 p-3 font-semibold text-blue-700">{message}</p>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center">
          <p className="font-bold text-slate-500">
            Chưa có dữ liệu site_content. Hãy chạy seed hoặc thêm thủ công trong Supabase.
          </p>
          <p className="mt-2 text-sm text-slate-400">
            Các section cần có: {defaultSections.map((s) => s.key).join(", ")}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {items.map((item) => (
            <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-black text-slate-900">{item.section_key}</h3>
                  <p className="text-xs text-slate-400">ID: {item.id}</p>
                </div>
                <Button
                  onClick={() => saveItem(item)}
                  disabled={saving === item.id}
                  size="sm"
                  className="rounded-full gap-1"
                >
                  {saving === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Lưu
                </Button>
              </div>
              <label className="mb-3 grid gap-1">
                <span className="text-sm font-bold text-slate-600">Tiêu đề</span>
                <Input
                  value={item.title ?? ""}
                  onChange={(e) => updateItem(item.id, "title", e.target.value)}
                />
              </label>
              <label className="grid gap-1">
                <span className="text-sm font-bold text-slate-600">Nội dung (JSON)</span>
                <textarea
                  value={JSON.stringify(item.content, null, 2)}
                  onChange={(e) => {
                    try {
                      updateItem(item.id, "content", JSON.parse(e.target.value));
                    } catch { /* invalid JSON, ignore */ }
                  }}
                  rows={5}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-xs"
                />
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
