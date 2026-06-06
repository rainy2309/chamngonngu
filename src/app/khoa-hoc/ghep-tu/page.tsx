"use client";

import { useEffect, useState } from "react";
import { Keyboard, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { learningStorageKeys, saveLearningItem } from "@/lib/localLearning";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/client";

const practiceWords = ["mẹ", "ba", "ăn", "học", "nhà", "sách", "cảm ơn", "xin chào", "hôm nay", "yêu thương"];

const toneGroups = [
  { name: "dấu sắc", pattern: /[áéíóúýắấếốớứ]/i },
  { name: "dấu huyền", pattern: /[àèìòùỳằầềồờừ]/i },
  { name: "dấu hỏi", pattern: /[ảẻỉỏủỷẳẩểổởử]/i },
  { name: "dấu ngã", pattern: /[ãẽĩõũỹẵẫễỗỡữ]/i },
  { name: "dấu nặng", pattern: /[ạẹịọụỵặậệộợự]/i },
];

function removeToneMarks(text: string) {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function splitWord(word: string) {
  return Array.from(removeToneMarks(word.toUpperCase()).replace(/[^A-ZĂÂĐÊÔƠƯ]/g, ""));
}

function detectTones(word: string) {
  return toneGroups.filter((tone) => tone.pattern.test(word)).map((tone) => tone.name);
}

export default function WordBuilderPage() {
  const [word, setWord] = useState("mẹ");
  const [submittedWord, setSubmittedWord] = useState("mẹ");
  const [alphabetMediaMap, setAlphabetMediaMap] = useState<Record<string, { video_url: string | null; gif_url: string | null }>>({});

  useEffect(() => {
    if (hasSupabaseEnv()) {
      const supabase = createClient();
      supabase
        .from("alphabet_media")
        .select("letter_key, video_url, gif_url")
        .eq("status", "published")
        .then(({ data }) => {
          if (data) {
            const map: Record<string, { video_url: string | null; gif_url: string | null }> = {};
            data.forEach((row: any) => {
              map[row.letter_key] = {
                video_url: row.video_url,
                gif_url: row.gif_url,
              };
            });
            setAlphabetMediaMap(map);
          }
        });
    }
  }, []);

  function practice(nextWord = word) {
    const trimmed = nextWord.trim();
    if (!trimmed) return;
    setWord(trimmed);
    setSubmittedWord(trimmed);
    saveLearningItem(learningStorageKeys.viewedLessons, { id: `ghep-tu-${trimmed.toLowerCase()}`, label: `Ghép từ: ${trimmed}` });
  }

  const letters = splitWord(submittedWord);
  const tones = detectTones(submittedWord);

  return (
    <main className="flex-1 bg-gradient-to-b from-blue-50 via-white to-white px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <section className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-black text-slate-950 sm:text-4xl lg:text-5xl">Ghép từ</h1>
          <p className="mt-4 text-sm font-semibold leading-7 text-slate-600 sm:text-lg sm:leading-8">Luyện ghép các chữ cái và dấu tiếng Việt để tạo thành từ.</p>
        </div>

        <div className="mt-8 rounded-[2rem] border border-blue-100 bg-white p-5 shadow-xl shadow-blue-100/50 md:p-6">
          <label className="grid gap-3">
            <span className="font-black text-slate-900">Nhập từ hoặc cụm từ ngắn</span>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input value={word} onChange={(event) => setWord(event.target.value)} placeholder="Ví dụ: mẹ, ăn, cảm ơn" className="min-h-12 text-base" />
              <Button onClick={() => practice()} className="min-h-12 w-full rounded-full sm:w-auto">
                <Keyboard className="h-5 w-5" aria-hidden="true" />
                Ghép từ
              </Button>
            </div>
          </label>

          <p className="mt-4 rounded-2xl bg-orange-50 p-4 text-sm font-semibold leading-6 text-orange-900">Phần ghép từ trong MVP lấy dữ liệu minh họa chữ cái thực tế từ cơ sở dữ liệu.</p>
        </div>

        <section className="mt-8">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-700" aria-hidden="true" />
            <h2 className="text-2xl font-black text-slate-950">Kết quả ghép từ: “{submittedWord}”</h2>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 min-[390px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {letters.map((letter, index) => {
              const key = letter.toLowerCase();
              const media = alphabetMediaMap[key];
              return (
                <article key={`${letter}-${index}`} className="rounded-[1.5rem] border border-blue-100 bg-white p-4 text-center shadow-lg shadow-blue-100/50 flex flex-col justify-between">
                  <div>
                    <p className="text-4xl font-black text-blue-700">{letter}</p>
                    <div className="mt-4 aspect-video rounded-2xl overflow-hidden bg-slate-900 border border-blue-100 flex items-center justify-center">
                      {media?.video_url ? (
                        <video src={media.video_url} className="h-full w-full object-contain" controls loop muted autoPlay playsInline />
                      ) : media?.gif_url ? (
                        <img src={media.gif_url} alt={`Chữ ${letter}`} className="h-full w-full object-contain" />
                      ) : (
                        <p className="text-xs font-semibold text-slate-400 p-2">Chưa có video minh họa</p>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
            {tones.map((tone) => (
              <article key={tone} className="rounded-[1.5rem] border border-orange-100 bg-orange-50 p-4 text-center shadow-lg shadow-orange-100/50">
                <p className="text-xl font-black text-orange-800">{tone}</p>
                <p className="mt-2 text-sm font-semibold text-orange-900">Dấu thanh được nhận diện để người học chú ý khi ghép từ.</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-black text-slate-950">Từ gợi ý luyện tập</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {practiceWords.map((item) => (
              <Button key={item} variant="secondary" className="rounded-full" onClick={() => practice(item)}>
                {item}
              </Button>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
