"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save, SaveAll } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VideoUploader } from "@/components/admin/VideoUploader";
import { signRegions } from "@/data/signDictionaryData";
import { normalizeVocabularyTopic, vocabularyCourseTopics } from "@/data/vocabularyCourseTopics";
import { createClient } from "@/lib/supabase/client";
import { getVietnameseFirstLetter, normalizeVietnameseText } from "@/lib/vietnameseText";

const defaultSignSteps = [
  "Quan sát video minh họa nếu có.",
  "Thực hiện chậm và rõ ràng.",
  "Lặp lại 3-5 lần để ghi nhớ.",
];

function splitLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function splitCommaList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function AdminNewWordPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [word, setWord] = useState("");
  const [meaning, setMeaning] = useState("");
  const [simpleExplanation, setSimpleExplanation] = useState("");
  const [category, setCategory] = useState(vocabularyCourseTopics[0]?.name ?? "Chào hỏi, tạm biệt");
  const [region, setRegion] = useState("Toàn quốc");
  const [difficulty, setDifficulty] = useState("easy");
  const [exampleSentence, setExampleSentence] = useState("");
  const [description, setDescription] = useState("");
  const [signStepsText, setSignStepsText] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [gifUrl, setGifUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [relatedWords, setRelatedWords] = useState("");
  const [sourceName, setSourceName] = useState("Admin CHẠM");

  function resetQuickFields() {
    setWord("");
    setMeaning("");
    setSimpleExplanation("");
    setExampleSentence("");
    setDescription("");
    setSignStepsText("");
    setVideoUrl("");
    setGifUrl("");
    setThumbnailUrl("");
    setRelatedWords("");
    setSourceName("Admin CHẠM");
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const shouldContinue = submitter?.value === "continue";
    const trimmedWord = word.trim();

    if (!trimmedWord || !category.trim()) {
      setMessage("Vui lòng nhập từ / cụm từ và chọn chủ đề.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const supabase = createClient();
      const normalized = normalizeVietnameseText(trimmedWord);
      const wordKey = normalized.replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const steps = splitLines(signStepsText);
      const safeMeaning = meaning.trim() || trimmedWord;

      const { error } = await supabase.from("dictionary_words").insert({
        word_key: wordKey,
        word: trimmedWord,
        normalized_word: normalized,
        first_letter: getVietnameseFirstLetter(trimmedWord),
        meaning: safeMeaning,
        simple_explanation: simpleExplanation.trim() || null,
        category: normalizeVocabularyTopic(category),
        region,
        difficulty,
        example_sentence: exampleSentence.trim() || "",
        description: description.trim() || null,
        sign_steps: steps.length ? steps : defaultSignSteps,
        video_url: videoUrl.trim() || null,
        gif_url: gifUrl.trim() || null,
        thumbnail_url: thumbnailUrl.trim() || null,
        related_words: splitCommaList(relatedWords),
        source_name: sourceName.trim() || "Admin CHẠM",
        is_verified: true,
        status: "published",
      });

      if (error) {
        setMessage("Lỗi: " + error.message);
      } else if (shouldContinue) {
        resetQuickFields();
        setMessage("Đã lưu mục từ vựng. Bạn có thể thêm mục tiếp theo.");
      } else {
        router.push("/admin/dictionary");
      }
    } catch (err: any) {
      setMessage("Lỗi: " + (err.message || String(err)));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 sm:p-8">
      <Button asChild variant="secondary" className="mb-6 rounded-full">
        <Link href="/admin/dictionary">
          <ArrowLeft className="h-5 w-5" /> Quay lại
        </Link>
      </Button>

      <h1 className="mb-2 text-3xl font-black text-slate-950">Thêm từ mới</h1>
      <p className="mb-6 max-w-2xl font-semibold leading-7 text-slate-600">
        Chỉ cần nhập từ / cụm từ, chọn chủ đề và thêm video nếu có. Các thông tin khác có thể bổ sung sau trong phần nâng cao.
      </p>

      <form onSubmit={onSubmit} className="max-w-3xl space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2">
            <span className="font-bold text-slate-800">Từ / cụm từ *</span>
            <Input value={word} onChange={(event) => setWord(event.target.value)} placeholder="VD: Xin chào" required />
          </label>

          <label className="grid gap-2">
            <span className="font-bold text-slate-800">Chủ đề *</span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 font-semibold"
              required
            >
              {vocabularyCourseTopics.map((topic) => (
                <option key={topic.slug} value={topic.name}>
                  {topic.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="grid gap-2">
          <span className="font-bold text-slate-800">Video URL</span>
          <Input value={videoUrl} onChange={(event) => setVideoUrl(event.target.value)} placeholder="Dán URL video hoặc tải file bên dưới" />
        </label>

        <VideoUploader videoUrl={videoUrl} onChange={setVideoUrl} folder="dictionary" idKey={word || "temp"} />

        <details className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <summary className="cursor-pointer select-none font-black text-slate-900">Nâng cao</summary>
          <div className="mt-4 grid gap-4">
            <label className="grid gap-2">
              <span className="font-bold text-slate-800">Nghĩa tiếng Việt</span>
              <Input value={meaning} onChange={(event) => setMeaning(event.target.value)} placeholder="Có thể để trống khi tạo nhanh" />
            </label>

            <label className="grid gap-2">
              <span className="font-bold text-slate-800">Giải thích đơn giản</span>
              <Input value={simpleExplanation} onChange={(event) => setSimpleExplanation(event.target.value)} placeholder="Giải thích ngắn, nếu cần" />
            </label>

            <label className="grid gap-2">
              <span className="font-bold text-slate-800">Câu ví dụ</span>
              <Input value={exampleSentence} onChange={(event) => setExampleSentence(event.target.value)} placeholder="VD: Em nói xin chào với bạn mới." />
            </label>

            <label className="grid gap-2">
              <span className="font-bold text-slate-800">Ghi chú / mô tả nội bộ</span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={3}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 font-semibold outline-none focus:border-blue-400"
                placeholder="Ghi chú nội bộ cho nhóm quản trị"
              />
            </label>

            <label className="grid gap-2">
              <span className="font-bold text-slate-800">Các bước thực hiện</span>
              <textarea
                value={signStepsText}
                onChange={(event) => setSignStepsText(event.target.value)}
                rows={4}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 font-semibold outline-none focus:border-blue-400"
                placeholder="Mỗi bước một dòng"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="font-bold text-slate-800">GIF URL</span>
                <Input value={gifUrl} onChange={(event) => setGifUrl(event.target.value)} placeholder="Không bắt buộc" />
              </label>
              <label className="grid gap-2">
                <span className="font-bold text-slate-800">Thumbnail URL</span>
                <Input value={thumbnailUrl} onChange={(event) => setThumbnailUrl(event.target.value)} placeholder="Không bắt buộc" />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <label className="grid gap-2">
                <span className="font-bold text-slate-800">Vùng miền</span>
                <select value={region} onChange={(event) => setRegion(event.target.value)} className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 font-semibold">
                  {signRegions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2">
                <span className="font-bold text-slate-800">Độ khó</span>
                <select value={difficulty} onChange={(event) => setDifficulty(event.target.value)} className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 font-semibold">
                  <option value="easy">Dễ</option>
                  <option value="medium">Trung bình</option>
                  <option value="hard">Khó</option>
                </select>
              </label>

              <label className="grid gap-2">
                <span className="font-bold text-slate-800">Nguồn</span>
                <Input value={sourceName} onChange={(event) => setSourceName(event.target.value)} placeholder="Admin CHẠM" />
              </label>
            </div>

            <label className="grid gap-2">
              <span className="font-bold text-slate-800">Từ liên quan (cách nhau bằng dấu phẩy)</span>
              <Input value={relatedWords} onChange={(event) => setRelatedWords(event.target.value)} placeholder="VD: Chào, Tạm biệt, Cảm ơn" />
            </label>
          </div>
        </details>

        {message ? <p className="rounded-xl bg-blue-50 p-3 font-semibold text-blue-700">{message}</p> : null}

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="submit" name="intent" value="save" disabled={saving} size="lg" className="rounded-full gap-2">
            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
            {saving ? "Đang lưu..." : "Lưu từ mới"}
          </Button>

          <Button type="submit" name="intent" value="continue" disabled={saving} size="lg" variant="secondary" className="rounded-full gap-2">
            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <SaveAll className="h-5 w-5" />}
            Lưu và thêm tiếp
          </Button>
        </div>
      </form>
    </div>
  );
}
