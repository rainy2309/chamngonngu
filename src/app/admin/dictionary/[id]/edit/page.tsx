"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { normalizeVietnameseText } from "@/lib/vietnameseText";
import { signCategories, signRegions } from "@/data/signDictionaryData";
import { VideoUploader } from "@/components/admin/VideoUploader";

export default function AdminEditWordPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [word, setWord] = useState("");
  const [meaning, setMeaning] = useState("");
  const [simpleExplanation, setSimpleExplanation] = useState("");
  const [category, setCategory] = useState(signCategories[0]);
  const [region, setRegion] = useState("Toàn quốc");
  const [difficulty, setDifficulty] = useState("easy");
  const [exampleSentence, setExampleSentence] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [relatedWords, setRelatedWords] = useState("");

  useEffect(() => {
    async function loadWord() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("dictionary_words")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        if (data) {
          setWord(data.word);
          setMeaning(data.meaning);
          setSimpleExplanation(data.simple_explanation ?? "");
          setCategory(data.category);
          setRegion(data.region);
          setDifficulty(data.difficulty);
          setExampleSentence(data.example_sentence ?? "");
          setDescription(data.description ?? "");
          setVideoUrl(data.video_url ?? "");
          setRelatedWords((data.related_words ?? []).join(", "));
        }
      } catch (err: any) {
        setMessage("Lỗi tải dữ liệu: " + err.message);
      } finally {
        setLoading(false);
      }
    }
    void loadWord();
  }, [id]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!word.trim() || !meaning.trim()) return;
    setSaving(true);
    setMessage("");

    try {
      const supabase = createClient();
      const normalized = normalizeVietnameseText(word.trim());

      const { error } = await supabase
        .from("dictionary_words")
        .update({
          word: word.trim(),
          normalized_word: normalized,
          meaning: meaning.trim(),
          simple_explanation: simpleExplanation.trim() || null,
          category,
          region,
          difficulty,
          example_sentence: exampleSentence.trim(),
          description: description.trim() || null,
          video_url: videoUrl.trim() || null,
          related_words: relatedWords
            .split(",")
            .map((w) => w.trim())
            .filter(Boolean),
        })
        .eq("id", id);

      if (error) {
        setMessage("Lỗi: " + error.message);
      } else {
        router.push("/admin/dictionary");
      }
    } catch (err: any) {
      setMessage("Lỗi: " + (err.message || String(err)));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="font-semibold text-slate-500">Đang tải dữ liệu từ...</span>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8">
      <Button asChild variant="secondary" className="mb-6 rounded-full">
        <Link href="/admin/dictionary">
          <ArrowLeft className="h-5 w-5" /> Quay lại
        </Link>
      </Button>

      <h1 className="mb-6 text-3xl font-black text-slate-950">Chỉnh sửa từ vựng</h1>

      <form
        onSubmit={onSubmit}
        className="max-w-3xl space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2">
            <span className="font-bold text-slate-800">Từ *</span>
            <Input
              value={word}
              onChange={(e) => setWord(e.target.value)}
              placeholder="VD: Xin chào"
              required
            />
          </label>
          <label className="grid gap-2">
            <span className="font-bold text-slate-800">Nghĩa tiếng Việt *</span>
            <Input
              value={meaning}
              onChange={(e) => setMeaning(e.target.value)}
              placeholder="VD: Lời chào thân thiện"
              required
            />
          </label>
        </div>

        <label className="grid gap-2">
          <span className="font-bold text-slate-800">
            Giải thích đơn giản (cho người mới)
          </span>
          <Input
            value={simpleExplanation}
            onChange={(e) => setSimpleExplanation(e.target.value)}
            placeholder="Giải thích ngắn gọn, dễ hiểu"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="grid gap-2">
            <span className="font-bold text-slate-800">Chủ đề</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 font-semibold"
            >
              {signCategories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-2">
            <span className="font-bold text-slate-800">Vùng miền</span>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 font-semibold"
            >
              {signRegions.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-2">
            <span className="font-bold text-slate-800">Độ khó</span>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 font-semibold"
            >
              <option value="easy">Dễ</option>
              <option value="medium">Trung bình</option>
              <option value="hard">Khó</option>
            </select>
          </label>
        </div>

        <label className="grid gap-2">
          <span className="font-bold text-slate-800">Câu ví dụ</span>
          <Input
            value={exampleSentence}
            onChange={(e) => setExampleSentence(e.target.value)}
            placeholder="VD: Em nói xin chào với bạn mới."
          />
        </label>

        <VideoUploader
          videoUrl={videoUrl}
          onChange={setVideoUrl}
          folder="dictionary"
          idKey={word || "temp"}
        />

        <label className="grid gap-2">
          <span className="font-bold text-slate-800">
            Từ liên quan (cách nhau bằng dấu phẩy)
          </span>
          <Input
            value={relatedWords}
            onChange={(e) => setRelatedWords(e.target.value)}
            placeholder="VD: Chào, Tạm biệt, Cảm ơn"
          />
        </label>

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
