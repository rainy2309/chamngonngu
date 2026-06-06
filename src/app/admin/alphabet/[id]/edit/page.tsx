"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { VideoUploader } from "@/components/admin/VideoUploader";

export default function AdminEditLetterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [letter, setLetter] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [instructionsText, setInstructionsText] = useState("");
  const [tipsText, setTipsText] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [status, setStatus] = useState("published");
  const [displayOrder, setDisplayOrder] = useState("0");

  useEffect(() => {
    async function loadLetter() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("alphabet_media")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        if (data) {
          setLetter(data.letter);
          setTitle(data.title);
          setDescription(data.description ?? "");
          setInstructionsText((data.instructions ?? []).join("\n"));
          setTipsText((data.tips ?? []).join("\n"));
          setVideoUrl(data.video_url ?? "");
          setStatus(data.status ?? "published");
          setDisplayOrder(String(data.display_order ?? 0));
        }
      } catch (err: any) {
        setMessage("Lỗi tải dữ liệu chữ cái: " + err.message);
      } finally {
        setLoading(false);
      }
    }
    void loadLetter();
  }, [id]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!letter.trim() || !title.trim()) {
      setMessage("Vui lòng nhập đầy đủ các trường bắt buộc.");
      return;
    }
    setSaving(true);
    setMessage("");

    try {
      const supabase = createClient();
      const letterKey = letter.trim().toLowerCase();

      const { error } = await supabase
        .from("alphabet_media")
        .update({
          letter_key: letterKey,
          letter: letter.trim(),
          title: title.trim(),
          description: description.trim() || null,
          instructions: instructionsText
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean),
          tips: tipsText
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean),
          video_url: videoUrl.trim() || null,
          status,
          display_order: parseInt(displayOrder, 10) || 0,
        })
        .eq("id", id);

      if (error) {
        console.error("[DEBUG] AdminEditLetterPage - Database update error details:", error);
        setMessage("Lỗi: " + error.message);
      } else {
        console.log("[DEBUG] AdminEditLetterPage - Database update successful for letter ID:", id);
        router.push("/admin/alphabet");
      }
    } catch (err: any) {
      setMessage("Lỗi hệ thống: " + (err.message || String(err)));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="font-semibold text-slate-500">Đang tải dữ liệu chữ cái...</span>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8">
      <Button asChild variant="secondary" className="mb-6 rounded-full">
        <Link href="/admin/alphabet">
          <ArrowLeft className="h-5 w-5" /> Quay lại
        </Link>
      </Button>

      <h1 className="mb-6 text-3xl font-black text-slate-950">Chỉnh sửa chữ cái</h1>

      <form
        onSubmit={onSubmit}
        className="max-w-3xl space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2">
            <span className="font-bold text-slate-800">Chữ cái (VD: A, B, C...) *</span>
            <Input
              value={letter}
              onChange={(e) => setLetter(e.target.value)}
              placeholder="VD: A"
              required
            />
          </label>
          <label className="grid gap-2">
            <span className="font-bold text-slate-800">Tiêu đề *</span>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Ký hiệu chữ A"
              required
            />
          </label>
        </div>

        <label className="grid gap-2">
          <span className="font-bold text-slate-800">Mô tả ngắn</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Mô tả sơ lược về chữ cái..."
            rows={3}
            className="w-full rounded-xl border border-slate-200 p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          />
        </label>

        <label className="grid gap-2">
          <span className="font-bold text-slate-800">Cách thực hiện ký hiệu (Mỗi câu một dòng)</span>
          <textarea
            value={instructionsText}
            onChange={(e) => setInstructionsText(e.target.value)}
            placeholder="Bước 1...\nBước 2..."
            rows={4}
            className="w-full rounded-xl border border-slate-200 p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          />
        </label>

        <label className="grid gap-2">
          <span className="font-bold text-slate-800">Lưu ý khi học (Mỗi câu một dòng)</span>
          <textarea
            value={tipsText}
            onChange={(e) => setTipsText(e.target.value)}
            placeholder="Lưu ý 1...\nLưu ý 2..."
            rows={3}
            className="w-full rounded-xl border border-slate-200 p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2">
            <span className="font-bold text-slate-800">Thứ tự hiển thị (Số nguyên)</span>
            <Input
              type="number"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(e.target.value)}
              placeholder="0"
            />
          </label>
          <label className="grid gap-2">
            <span className="font-bold text-slate-800">Trạng thái</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 font-semibold text-sm"
            >
              <option value="published">Công khai (Published)</option>
              <option value="draft">Bản nháp (Draft)</option>
            </select>
          </label>
        </div>

        <VideoUploader
          videoUrl={videoUrl}
          onChange={setVideoUrl}
          folder="alphabet"
          idKey={id}
        />

        {message && (
          <p className="rounded-xl bg-red-50 p-3 font-semibold text-red-700">
            {message}
          </p>
        )}

        <Button
          type="submit"
          disabled={saving}
          size="lg"
          className="w-full rounded-full gap-2 sm:w-auto"
        >
          {saving ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Save className="h-5 w-5" />
          )}
          {saving ? "Đang cập nhật..." : "Lưu thay đổi"}
        </Button>
      </form>
    </div>
  );
}
