"use client";

import { useEffect, useState } from "react";
import { Database, AlertTriangle, CheckCircle2, Play, Loader2, Info, ChevronRight, Video, FileCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/client";
import { generate1000Words } from "@/lib/dictionaryGenerator";
import { alphabetSignData } from "@/data/alphabetSignData";
import { lessons as localLessons } from "@/data/vocabularyData";

export default function AdminSeedPage() {
  const [hasEnv, setHasEnv] = useState(false);
  const [tablesExist, setTablesExist] = useState<Record<string, boolean | null>>({
    dictionary_words: null,
    alphabet_media: null,
    lessons: null,
  });
  const [loadingCheck, setLoadingCheck] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [dbCounts, setDbCounts] = useState({ words: 0, alphabet: 0, lessons: 0 });

  useEffect(() => {
    const envOk = hasSupabaseEnv();
    setHasEnv(envOk);
    if (envOk) {
      void checkTables();
    } else {
      setLoadingCheck(false);
    }
  }, []);

  async function checkTables() {
    setLoadingCheck(true);
    const supabase = createClient();
    
    // Check dictionary_words
    const { data: dictData, error: dictError } = await supabase
      .from("dictionary_words")
      .select("count", { count: "exact", head: true });
    
    // Check alphabet_media
    const { data: alphaData, error: alphaError } = await supabase
      .from("alphabet_media")
      .select("count", { count: "exact", head: true });

    // Check lessons
    const { data: lessonsData, error: lessonsError } = await supabase
      .from("lessons")
      .select("count", { count: "exact", head: true });

    const dictOk = !dictError || dictError.code !== "PGRST205";
    const alphaOk = !alphaError || alphaError.code !== "PGRST205";
    const lessonsOk = !lessonsError || lessonsError.code !== "PGRST205";

    setTablesExist({
      dictionary_words: dictOk,
      alphabet_media: alphaOk,
      lessons: lessonsOk,
    });

    if (dictOk && !dictError) {
      const { count } = await supabase.from("dictionary_words").select("*", { count: "exact", head: true });
      const { count: aCount } = await supabase.from("alphabet_media").select("*", { count: "exact", head: true });
      const { count: lCount } = await supabase.from("lessons").select("*", { count: "exact", head: true });
      setDbCounts({ words: count ?? 0, alphabet: aCount ?? 0, lessons: lCount ?? 0 });
    }

    setLoadingCheck(false);
  }

  async function handleSeed() {
    if (seeding) return;
    setSeeding(true);
    setProgress(0);
    setStatusMessage("Đang chuẩn bị dữ liệu từ điển...");

    try {
      const supabase = createClient();

      // 1. Seed Alphabet Media
      setStatusMessage("Đang nạp dữ liệu bảng chữ cái kiểu biểu đồ...");
      const alphaRows = alphabetSignData.map((item) => ({
        letter_key: item.letter_key,
        letter: item.letter,
        display_label: item.display_label,
        type: item.type,
        title: item.title,
        description: item.description,
        explanation: item.explanation,
        display_order: item.display_order,
        status: item.status,
        video_url: null, // User will update this with real video URLs later
        gif_url: null,
        instructions: item.instructions,
        tips: item.tips,
        is_verified: true,
      }));

      // Upsert to support multiple runs without duplicates
      const { error: alphaErr } = await supabase
        .from("alphabet_media")
        .upsert(alphaRows, { onConflict: "letter_key" });

      if (alphaErr) {
        throw new Error("Lỗi khi thêm bảng chữ cái: " + alphaErr.message);
      }

      // 2. Seed Lessons (5 lessons)
      setStatusMessage("Đang nạp dữ liệu các bài học...");
      const lessonRows = localLessons.map((item) => ({
        id: item.id,
        topic: item.topic,
        description: item.description,
        difficulty: item.difficulty,
        word_ids: item.wordIds,
      }));

      const { error: lessonErr } = await supabase
        .from("lessons")
        .upsert(lessonRows, { onConflict: "id" });

      if (lessonErr) {
        throw new Error("Lỗi khi thêm bài học: " + lessonErr.message);
      }
      
      setProgress(10);
      setStatusMessage("Đang tạo 1000 từ vựng...");

      // 3. Generate 1000 words
      const words = generate1000Words();
      const batchSize = 100;
      const totalBatches = Math.ceil(words.length / batchSize);

      for (let i = 0; i < totalBatches; i++) {
        const batch = words.slice(i * batchSize, (i + 1) * batchSize);
        setStatusMessage(`Đang tải lên từ vựng: lô ${i + 1}/${totalBatches}...`);

        const { error: batchErr } = await supabase
          .from("dictionary_words")
          .upsert(batch, { onConflict: "word_key" });

        if (batchErr) {
          throw new Error(`Lỗi ở lô ${i + 1}: ` + batchErr.message);
        }

        setProgress(10 + Math.round((i + 1) / totalBatches * 90));
      }

      setStatusMessage("Khởi tạo dữ liệu thành công! 1000 từ vựng, 29 chữ cái và 5 bài học đã sẵn sàng.");
      await checkTables();
    } catch (err: any) {
      console.error(err);
      setStatusMessage("Lỗi: " + (err.message || String(err)));
    } finally {
      setSeeding(false);
    }
  }

  return (
    <main className="flex-1 bg-gradient-to-b from-blue-50 to-white px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <p className="font-black uppercase tracking-[0.25em] text-blue-500">Quản trị viên CHẠM</p>
          <h1 className="mt-3 text-4xl font-black text-slate-950 sm:text-5xl">Cơ sở dữ liệu Từ điển & Bảng chữ cái</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">Kiểm tra kết nối và khởi tạo 1000 từ vựng giải thích cùng video ký hiệu bảng chữ cái.</p>
        </div>

        {!hasEnv ? (
          <Card className="border-red-100 bg-red-50/50 p-6 text-center rounded-[2rem] mb-6">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-bold text-red-950">Chưa cấu hình biến môi trường Supabase</h2>
            <p className="mt-2 text-slate-600">Vui lòng thiết lập biến môi trường trong file `.env.local` trước khi tiếp tục.</p>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Step 1: Migration Instructions */}
            <Card className="rounded-[2rem] border-blue-100 bg-white shadow-xl shadow-blue-100/40 overflow-hidden">
              <div className="bg-blue-600 px-6 py-4 text-white flex items-center gap-3">
                <Database className="h-6 w-6" />
                <h2 className="text-lg font-black">Bước 1: Tạo bảng trong Supabase Dashboard</h2>
              </div>
              <CardContent className="p-6 space-y-4">
                <p className="text-sm font-semibold text-slate-600">
                  Trước khi nạp dữ liệu, bạn cần chạy mã SQL migration để tạo các bảng và thiết lập phân quyền (RLS) phù hợp.
                </p>
                <div className="rounded-2xl bg-slate-950 p-4 font-mono text-xs text-slate-200 overflow-x-auto">
                  <p className="text-slate-400"># Đường dẫn file SQL chứa mã nguồn tạo bảng:</p>
                  <p className="text-blue-400 font-bold">/supabase/migration_dictionary.sql</p>
                </div>
                <div className="flex items-center gap-3 rounded-2xl bg-blue-50 p-4 text-sm font-bold text-blue-900">
                  <Info className="h-5 w-5 text-blue-600 shrink-0" />
                  <span>Hãy copy nội dung file này và chạy trong mục SQL Editor của Supabase Dashboard.</span>
                </div>
              </CardContent>
            </Card>

            {/* Step 2: Database Status */}
            <Card className="rounded-[2rem] border-blue-100 bg-white shadow-xl shadow-blue-100/40">
              <CardContent className="p-6 space-y-6">
                <h2 className="text-xl font-black text-slate-950">Bước 2: Trạng thái cơ sở dữ liệu hiện tại</h2>

                {loadingCheck ? (
                  <div className="flex items-center justify-center gap-3 py-6 font-semibold text-blue-600">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    Đang kiểm tra kết nối database...
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className={`p-5 rounded-2xl border ${tablesExist.dictionary_words ? "border-emerald-100 bg-emerald-50/50" : "border-amber-100 bg-amber-50/50"}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-black text-slate-900">Bảng dictionary_words</h3>
                          <p className="text-xs text-slate-500 mt-1">Lưu trữ từ điển và giải thích.</p>
                        </div>
                        {tablesExist.dictionary_words ? (
                          <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                        ) : (
                          <AlertTriangle className="h-6 w-6 text-amber-600" />
                        )}
                      </div>
                      <p className="mt-4 text-sm font-bold text-slate-700">
                        Trạng thái: {tablesExist.dictionary_words ? `Đã có (${dbCounts.words} từ)` : "Chưa được tạo"}
                      </p>
                    </div>

                    <div className={`p-5 rounded-2xl border ${tablesExist.alphabet_media ? "border-emerald-100 bg-emerald-50/50" : "border-amber-100 bg-amber-50/50"}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-black text-slate-900">Bảng alphabet_media</h3>
                          <p className="text-xs text-slate-500 mt-1">Lưu trữ ký hiệu chữ cái.</p>
                        </div>
                        {tablesExist.alphabet_media ? (
                          <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                        ) : (
                          <AlertTriangle className="h-6 w-6 text-amber-600" />
                        )}
                      </div>
                      <p className="mt-4 text-sm font-bold text-slate-700">
                        Trạng thái: {tablesExist.alphabet_media ? `Đã có (${dbCounts.alphabet} chữ cái)` : "Chưa được tạo"}
                      </p>
                    </div>

                    <div className={`p-5 rounded-2xl border ${tablesExist.lessons ? "border-emerald-100 bg-emerald-50/50" : "border-amber-100 bg-amber-50/50"}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-black text-slate-900">Bảng lessons</h3>
                          <p className="text-xs text-slate-500 mt-1">Lưu trữ khóa học & bài học.</p>
                        </div>
                        {tablesExist.lessons ? (
                          <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                        ) : (
                          <AlertTriangle className="h-6 w-6 text-amber-600" />
                        )}
                      </div>
                      <p className="mt-4 text-sm font-bold text-slate-700">
                        Trạng thái: {tablesExist.lessons ? `Đã có (${dbCounts.lessons} bài)` : "Chưa được tạo"}
                      </p>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-100 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-black text-slate-950">Nạp từ điển, bảng chữ cái và bài học</h3>
                    <p className="text-sm text-slate-500 mt-1">Khởi tạo nhanh toàn bộ cơ sở dữ liệu động từ file gốc.</p>
                  </div>
                  <Button
                    onClick={handleSeed}
                    disabled={seeding || loadingCheck || !tablesExist.dictionary_words || !tablesExist.alphabet_media || !tablesExist.lessons}
                    size="lg"
                    className="rounded-full gap-2 shrink-0"
                  >
                    {seeding ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Đang nạp...
                      </>
                    ) : (
                      <>
                        <Play className="h-5 w-5 fill-white" />
                        Bắt đầu Nạp dữ liệu
                      </>
                    )}
                  </Button>
                </div>

                {seeding || statusMessage ? (
                  <div className="mt-4 space-y-3 p-4 bg-slate-50 rounded-2xl">
                    <p className="text-sm font-bold text-blue-900">{statusMessage}</p>
                    {seeding ? <Progress value={progress} className="h-2" /> : null}
                  </div>
                ) : null}
              </CardContent>
            </Card>

            {/* Step 3: Alphabet Video upload explanation */}
            <Card className="rounded-[2rem] border-blue-100 bg-white shadow-xl shadow-blue-100/40">
              <div className="bg-sky-600 px-6 py-4 text-white flex items-center gap-3">
                <Video className="h-6 w-6" />
                <h2 className="text-lg font-black">Hướng dẫn tích hợp Video bảng chữ cái</h2>
              </div>
              <CardContent className="p-6 space-y-4 text-slate-700 text-sm font-semibold leading-relaxed">
                <p>Để thêm các video bảng chữ cái vào web, bạn hãy thực hiện theo 3 bước đơn giản sau:</p>
                <div className="grid gap-4">
                  <div className="flex gap-3 items-start">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-xs">1</span>
                    <div>
                      <p className="font-bold text-slate-900">Upload video lên Storage Bucket</p>
                      <p className="text-slate-500 mt-1">Vào Supabase Dashboard &gt; Storage &gt; Chọn bucket tên <code className="bg-slate-100 px-2 py-0.5 rounded font-bold text-blue-600">alphabet-videos</code>. Thực hiện kéo thả các file video (ví dụ: <code className="bg-slate-100 px-1 rounded">a.mp4</code>, <code className="bg-slate-100 px-1 rounded">b.mp4</code>) lên đây.</p>
                    </div>
                  </div>

                  <div className="flex gap-3 items-start">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-xs">2</span>
                    <div>
                      <p className="font-bold text-slate-900">Lấy URL công khai của video</p>
                      <p className="text-slate-500 mt-1">Bấm chuột phải vào video đã upload trong Supabase Storage và chọn <span className="font-bold text-slate-900">Copy URL</span>. Link sẽ có dạng: <code className="text-xs break-all bg-slate-50 p-1 block rounded border mt-1">https://[your-project].supabase.co/storage/v1/object/public/alphabet-videos/[filename].mp4</code></p>
                    </div>
                  </div>

                  <div className="flex gap-3 items-start">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-xs">3</span>
                    <div>
                      <p className="font-bold text-slate-900">Cập nhật vào bảng database</p>
                      <p className="text-slate-500 mt-1">Vào Supabase Dashboard &gt; Table Editor &gt; Chọn bảng <code className="font-bold text-blue-600">alphabet_media</code>. Tìm chữ cái tương ứng (ví dụ: chữ A) và paste link video vừa lấy vào cột <code className="font-bold">video_url</code>.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
}
