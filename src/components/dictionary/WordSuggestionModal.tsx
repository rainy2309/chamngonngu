"use client";

import { useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Bot, HelpCircle, Loader2, Upload, Video, X, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/client";
import { normalizeVietnameseText } from "@/lib/vietnameseText";
import { signCategories } from "@/data/signDictionaryData";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const ALLOWED_TYPES = ["video/mp4", "video/webm"];

type WordSuggestionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
};

export function WordSuggestionModal({ isOpen, onClose, initialQuery = "" }: WordSuggestionModalProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [user, setUser] = useState<any>(null);

  // Form states
  const [term, setTerm] = useState(initialQuery);
  const [category, setCategory] = useState(signCategories[0] || "Giao tiếp cơ bản");
  const [region, setRegion] = useState("Toàn quốc");
  const [difficulty, setDifficulty] = useState("easy");
  const [meaning, setMeaning] = useState("");
  const [simpleExplanation, setSimpleExplanation] = useState("");
  const [example, setExample] = useState("");
  const [learningStepsText, setLearningStepsText] = useState("");
  const [note, setNote] = useState("");
  const [file, setFile] = useState<File | null>(null);

  // Status states
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTerm(initialQuery);
      setSuccess(false);
      setError(null);
      setFile(null);
      setMeaning("");
      setSimpleExplanation("");
      setExample("");
      setLearningStepsText("");
      setNote("");
    }
  }, [isOpen, initialQuery]);

  useEffect(() => {
    async function checkAuth() {
      if (!hasSupabaseEnv()) {
        setIsLoggedIn(false);
        setCheckingAuth(false);
        return;
      }
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setIsLoggedIn(Boolean(user));
      setCheckingAuth(false);
    }
    void checkAuth();
  }, [isOpen]);

  function handleFile(f: File | undefined) {
    setError(null);
    if (!f) return;
    if (!ALLOWED_TYPES.includes(f.type)) {
      setError("Chỉ chấp nhận file MP4 hoặc WebM.");
      return;
    }
    if (f.size > MAX_FILE_SIZE) {
      setError("File quá lớn. Tối đa 20MB.");
      return;
    }
    setFile(f);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;

    setError(null);

    if (!term.trim()) {
      setError("Vui lòng nhập từ hoặc cụm từ đề xuất.");
      return;
    }

    if (!file) {
      setError("Vui lòng tải lên video ký hiệu minh họa cho từ này.");
      return;
    }

    setSubmitting(true);

    try {
      const supabase = createClient();
      const cleanTerm = term.trim();
      const normalizedInput = normalizeVietnameseText(cleanTerm);

      // 1. Check duplicate in dictionary_words
      const { data: dupWords, error: errWords } = await supabase
        .from("dictionary_words")
        .select("id, word")
        .or(`word.ilike.${cleanTerm},normalized_word.eq.${normalizedInput}`);

      if (errWords) {
        console.error("Check duplicate words error:", errWords);
      }

      if (dupWords && dupWords.length > 0) {
        setError("Từ này đã có trong từ điển.");
        setSubmitting(false);
        return;
      }

      // 2. Check duplicate in dictionary_word_suggestions (pending state)
      const { data: dupSuggestions, error: errSuggestions } = await supabase
        .from("dictionary_word_suggestions")
        .select("id, term")
        .eq("status", "pending")
        .or(`term.ilike.${cleanTerm},normalized_term.eq.${normalizedInput}`);

      if (errSuggestions) {
        console.error("Check duplicate suggestions error:", errSuggestions);
      }

      if (dupSuggestions && dupSuggestions.length > 0) {
        setError("Từ này đã được đề xuất và đang chờ đội ngũ CHẠM kiểm duyệt.");
        setSubmitting(false);
        return;
      }

      // 3. Upload video file
      const ext = file.name.split(".").pop() ?? "mp4";
      const path = `suggestions/${user.id}/${normalizedInput}-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("sign-videos")
        .upload(path, file, { contentType: file.type });

      if (uploadError) {
        console.error("Upload storage error:", uploadError);
        setError("Không thể tải lên video. Vui lòng thử lại.");
        setSubmitting(false);
        return;
      }

      const { data: urlData } = supabase.storage.from("sign-videos").getPublicUrl(path);

      // Parse learning steps
      const signSteps = learningStepsText
        .split("\n")
        .map((step) => step.trim())
        .filter(Boolean);

      // 4. Save proposal to dictionary_word_suggestions
      const { error: dbError } = await supabase.from("dictionary_word_suggestions").insert({
        term: cleanTerm,
        normalized_term: normalizedInput,
        category: category,
        region: region,
        difficulty: difficulty,
        meaning: meaning.trim() || null,
        simple_explanation: simpleExplanation.trim() || null,
        example: example.trim() || null,
        learning_steps: signSteps,
        note: note.trim() || null,
        video_url: urlData.publicUrl,
        video_path: path,
        submitted_by: user.id,
        status: "pending",
      });

      if (dbError) {
        console.error("Insert suggestion error:", dbError);
        setError("Không thể lưu đề xuất. Vui lòng thử lại.");
        setSubmitting(false);
        return;
      }

      setSuccess(true);
    } catch (err) {
      console.error("Submit suggestion error:", err);
      setError("Đã xảy ra lỗi hệ thống. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-sm" />
        <Dialog.Content className="scrollbar-hide fixed left-1/2 top-1/2 z-50 flex max-h-[85vh] w-[calc(100vw-24px)] max-w-[620px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[1.35rem] border border-blue-100 bg-white shadow-2xl focus:outline-none dark:border-slate-800 dark:bg-slate-900">
          
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-blue-100 p-4 dark:border-slate-800 sm:px-6">
            <h2 className="flex items-center gap-2 text-lg font-black text-slate-950 dark:text-white">
              <HelpCircle className="h-5 w-5 text-blue-500" />
              Đóng góp từ mới vào từ điển
            </h2>
            <Dialog.Close asChild>
              <button type="button" className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-600 hover:bg-blue-50 dark:bg-slate-800 dark:text-slate-200">
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {checkingAuth ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <span className="mt-2 text-sm font-bold text-slate-500">Đang kiểm tra tài khoản...</span>
              </div>
            ) : !isLoggedIn ? (
              /* Require Login View */
              <div className="py-6 text-center">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-blue-50 text-blue-600 dark:bg-slate-800 dark:text-blue-400">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-base font-black text-slate-900 dark:text-white">Yêu cầu đăng nhập</h3>
                <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-500 dark:text-slate-400">
                  Vui lòng đăng nhập để đóng góp từ mới cho từ điển CHẠM.
                </p>
                <div className="mt-6 flex justify-center gap-3">
                  <Button variant="outline" onClick={onClose} className="rounded-full">Đóng</Button>
                  <a
                    href="/dang-nhap"
                    className="inline-flex h-10 items-center justify-center rounded-full bg-blue-600 px-6 text-sm font-black text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                  >
                    Đăng nhập
                  </a>
                </div>
              </div>
            ) : success ? (
              /* Success View */
              <div className="py-6 text-center">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-slate-800 dark:text-emerald-400">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="mt-4 text-lg font-black text-slate-900 dark:text-white">🎉 Đóng góp thành công!</h3>
                <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-600 dark:text-slate-400">
                  Đã gửi đề xuất từ mới thành công. Đội ngũ CHẠM sẽ kiểm duyệt trước khi đưa vào từ điển.
                </p>
                <Button onClick={onClose} className="mt-6 rounded-full px-6">Xong</Button>
              </div>
            ) : (
              /* Form View */
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Proposed Term */}
                <label className="grid gap-1.5">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Từ / cụm từ <span className="text-red-500">*</span>
                  </span>
                  <input
                    type="text"
                    value={term}
                    required
                    onChange={(e) => setTerm(e.target.value.slice(0, 100))}
                    placeholder="VD: Mặt trời, đi học, xin chào..."
                    className="min-h-11 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                  />
                </label>

                {/* Video upload */}
                <div className="grid gap-1.5">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Video ký hiệu minh họa <span className="text-red-500">*</span>
                  </span>
                  <div
                    className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-blue-200 bg-blue-50/40 p-5 text-center transition hover:border-blue-400 hover:bg-blue-50/60 dark:border-slate-800 dark:bg-slate-950/20"
                    onClick={() => fileRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleFile(e.dataTransfer.files[0]);
                    }}
                  >
                    <input
                      ref={fileRef}
                      type="file"
                      accept="video/mp4,video/webm"
                      className="hidden"
                      onChange={(e) => handleFile(e.target.files?.[0])}
                    />
                    {file ? (
                      <div className="flex items-center gap-2">
                        <Video className="h-5 w-5 text-blue-600" />
                        <span className="text-sm font-bold text-blue-700 truncate max-w-[280px]">{file.name}</span>
                        <span className="text-xs text-slate-400">({(file.size / 1024 / 1024).toFixed(1)}MB)</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-6 w-6 text-blue-400" />
                        <p className="text-sm font-bold text-blue-700">Kéo thả video hoặc click để chọn</p>
                        <p className="text-xs text-slate-400">MP4, WebM — Tối đa 20MB</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Grid fields: Category, Region, Difficulty */}
                <div className="grid gap-3 sm:grid-cols-3">
                  <label className="grid gap-1.5">
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Chủ đề</span>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="min-h-10 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                    >
                      {signCategories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </label>

                  <label className="grid gap-1.5">
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Vùng miền</span>
                    <select
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      className="min-h-10 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                    >
                      <option value="Toàn quốc">Toàn quốc</option>
                      <option value="HN">Hà Nội</option>
                      <option value="HP">Hải Phòng</option>
                      <option value="HCM">TP.HCM</option>
                      <option value="Chưa xác định">Chưa xác định</option>
                    </select>
                  </label>

                  <label className="grid gap-1.5">
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Độ khó</span>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="min-h-10 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                    >
                      <option value="easy">Dễ</option>
                      <option value="medium">Trung bình</option>
                      <option value="hard">Khó</option>
                    </select>
                  </label>
                </div>

                {/* Meaning */}
                <label className="grid gap-1.5">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Ý nghĩa</span>
                  <textarea
                    value={meaning}
                    rows={2}
                    onChange={(e) => setMeaning(e.target.value)}
                    placeholder="Giải thích nghĩa của từ..."
                    className="rounded-xl border border-slate-200 bg-white p-3 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                  />
                </label>

                {/* Simple Explanation */}
                <label className="grid gap-1.5">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Giải thích đơn giản</span>
                  <textarea
                    value={simpleExplanation}
                    rows={2}
                    onChange={(e) => setSimpleExplanation(e.target.value)}
                    placeholder="Giải thích cách thực hiện ký hiệu một cách đơn giản..."
                    className="rounded-xl border border-slate-200 bg-white p-3 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                  />
                </label>

                {/* Example */}
                <label className="grid gap-1.5">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Ví dụ câu</span>
                  <textarea
                    value={example}
                    rows={2}
                    onChange={(e) => setExample(e.target.value)}
                    placeholder="Đặt câu chứa từ này..."
                    className="rounded-xl border border-slate-200 bg-white p-3 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                  />
                </label>

                {/* Learning steps */}
                <label className="grid gap-1.5">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Các bước thực hiện (Mỗi bước một dòng)</span>
                  <textarea
                    value={learningStepsText}
                    rows={3}
                    onChange={(e) => setLearningStepsText(e.target.value)}
                    placeholder="VD:&#10;Bước 1: Nâng bàn tay phải lên ngang vai...&#10;Bước 2: Xòe các ngón tay và xoay nhẹ..."
                    className="rounded-xl border border-slate-200 bg-white p-3 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                  />
                </label>

                {/* Note */}
                <label className="grid gap-1.5">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Lưu ý / ghi chú</span>
                  <textarea
                    value={note}
                    rows={2}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="VD: Cần lưu ý tư thế vai..."
                    className="rounded-xl border border-slate-200 bg-white p-3 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                  />
                </label>

                {/* Disclaimer banner */}
                <p className="rounded-xl bg-amber-50 p-3 text-xs font-semibold leading-5 text-amber-800 dark:bg-amber-950/20 dark:text-amber-300">
                  ⚠️ Đề xuất của bạn sẽ được kiểm duyệt bởi ban chuyên môn trước khi xuất bản chính thức lên CHẠM.
                </p>

                {/* Error alert */}
                {error && (
                  <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700 dark:bg-red-950/20 dark:text-red-400">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-5 flex justify-end gap-2 border-t border-blue-50 pt-4 dark:border-slate-850">
                  <Button type="button" variant="outline" onClick={onClose} disabled={submitting} className="rounded-full">
                    Hủy
                  </Button>
                  <Button type="submit" disabled={submitting} className="rounded-full gap-2 px-6">
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    {submitting ? "Đang gửi đề xuất..." : "Gửi đề xuất"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
