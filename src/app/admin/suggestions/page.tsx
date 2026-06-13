"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, X, Trash2, Calendar, BookOpen, AlertCircle, Edit2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/client";
import { getVietnameseFirstLetter, normalizeVietnameseText } from "@/lib/vietnameseText";
import { signCategories } from "@/data/signDictionaryData";

type WordSuggestion = {
  id: string;
  term: string;
  normalized_term: string;
  category: string;
  region: string;
  difficulty: string;
  meaning: string | null;
  simple_explanation: string | null;
  example: string | null;
  learning_steps: string[];
  note: string | null;
  video_url: string;
  video_path: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  submitted_by: string | null;
  profiles?: { full_name: string | null } | null;
};

export default function AdminSuggestionsPage() {
  const [suggestions, setSuggestions] = useState<WordSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  
  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTerm, setEditTerm] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editRegion, setEditRegion] = useState("");
  const [editDifficulty, setEditDifficulty] = useState("");
  const [editMeaning, setEditMeaning] = useState("");
  const [editExplanation, setEditExplanation] = useState("");
  const [editExample, setEditExample] = useState("");
  const [editStepsText, setEditStepsText] = useState("");
  const [editNote, setEditNote] = useState("");

  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "rejected">("pending");

  useEffect(() => {
    loadSuggestions();
  }, []);

  async function loadSuggestions() {
    if (!hasSupabaseEnv()) {
      setLoading(false);
      return;
    }
    const supabase = createClient();
    const { data, error } = await supabase
      .from("dictionary_word_suggestions")
      .select("*, profiles:submitted_by(full_name)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Load suggestions error:", error.message, error.details, error.hint, error.code);
    }
    if (data) {
      setSuggestions(data as unknown as WordSuggestion[]);
    }
    setLoading(false);
  }

  function startEdit(s: WordSuggestion) {
    setEditingId(s.id);
    setEditTerm(s.term);
    setEditCategory(s.category);
    setEditRegion(s.region);
    setEditDifficulty(s.difficulty);
    setEditMeaning(s.meaning || "");
    setEditExplanation(s.simple_explanation || "");
    setEditExample(s.example || "");
    setEditStepsText(s.learning_steps.join("\n"));
    setEditNote(s.note || "");
  }

  async function saveEdit(id: string) {
    setProcessing(id);
    try {
      const supabase = createClient();
      const steps = editStepsText
        .split("\n")
        .map((step) => step.trim())
        .filter(Boolean);

      const normalizedInput = normalizeVietnameseText(editTerm);

      const { error } = await supabase
        .from("dictionary_word_suggestions")
        .update({
          term: editTerm.trim(),
          normalized_term: normalizedInput,
          category: editCategory,
          region: editRegion,
          difficulty: editDifficulty,
          meaning: editMeaning.trim() || null,
          simple_explanation: editExplanation.trim() || null,
          example: editExample.trim() || null,
          learning_steps: steps,
          note: editNote.trim() || null,
        })
        .eq("id", id);

      if (error) throw error;

      setSuggestions((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                ...s,
                term: editTerm.trim(),
                normalized_term: normalizedInput,
                category: editCategory,
                region: editRegion,
                difficulty: editDifficulty,
                meaning: editMeaning.trim() || null,
                simple_explanation: editExplanation.trim() || null,
                example: editExample.trim() || null,
                learning_steps: steps,
                note: editNote.trim() || null,
              }
            : s
        )
      );
      setEditingId(null);
    } catch (err) {
      console.error("Save edit error:", err);
      alert("Không thể lưu chỉnh sửa.");
    } finally {
      setProcessing(null);
    }
  }

  async function approveSuggestion(s: WordSuggestion) {
    if (processing) return;
    setProcessing(s.id);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      const wordKey = s.normalized_term.replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

      // 1. Insert into dictionary_words
      const { error: insertError } = await supabase.from("dictionary_words").insert({
        word_key: wordKey,
        word: s.term,
        normalized_word: s.normalized_term,
        first_letter: getVietnameseFirstLetter(s.term),
        meaning: s.meaning || "",
        simple_explanation: s.simple_explanation || null,
        category: s.category,
        region: s.region,
        difficulty: s.difficulty,
        example_sentence: s.example || "",
        description: s.note || "",
        sign_steps: s.learning_steps,
        video_url: s.video_url,
        status: "published",
      });

      if (insertError) {
        console.error("Approve insert error:", insertError);
        alert(`Không thể đưa từ vào từ điển: ${insertError.message}`);
        setProcessing(null);
        return;
      }

      // 2. Update status of suggestion to approved
      const { error: updateError } = await supabase
        .from("dictionary_word_suggestions")
        .update({
          status: "approved",
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", s.id);

      if (updateError) throw updateError;

      setSuggestions((prev) =>
        prev.map((item) => (item.id === s.id ? { ...item, status: "approved" } : item))
      );
      
      alert("Đã duyệt từ mới và đưa vào từ điển thành công!");
    } catch (err) {
      console.error("Approve error:", err);
      alert("Đã xảy ra lỗi trong quá trình duyệt.");
    } finally {
      setProcessing(null);
    }
  }

  async function rejectSuggestion(id: string) {
    if (processing) return;
    if (!window.confirm("Bạn có chắc muốn từ chối đề xuất này?")) return;

    setProcessing(id);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from("dictionary_word_suggestions")
        .update({
          status: "rejected",
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      setSuggestions((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: "rejected" } : item))
      );
    } catch (err) {
      console.error("Reject error:", err);
      alert("Không thể thực hiện.");
    } finally {
      setProcessing(null);
    }
  }

  async function deleteSuggestion(id: string) {
    if (processing) return;
    if (!window.confirm("Bạn có chắc chắn muốn xóa vĩnh viễn đề xuất này không?")) return;

    setProcessing(id);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("dictionary_word_suggestions").delete().eq("id", id);
      if (error) throw error;

      setSuggestions((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error("Delete error:", err);
      alert("Không thể xóa đề xuất.");
    } finally {
      setProcessing(null);
    }
  }

  const statusColors = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
    rejected: "bg-red-50 text-red-700 border-red-200",
  };

  const statusLabels = {
    pending: "Chờ duyệt",
    approved: "Đã duyệt",
    rejected: "Từ chối",
  };

  const filtered = suggestions.filter((s) => s.status === activeTab);

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-950">Duyệt từ mới đề xuất</h1>
          <p className="mt-2 font-semibold text-slate-500">
            Quản lý và kiểm duyệt các đề xuất từ mới từ cộng đồng.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b border-slate-200 pb-px">
        {(["pending", "approved", "rejected"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setEditingId(null);
            }}
            className={`px-4 py-2.5 text-sm font-bold transition-all border-b-2 -mb-px ${
              activeTab === tab
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            {statusLabels[tab]} ({suggestions.filter((s) => s.status === tab).length})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center font-bold text-slate-500">
          Không có đề xuất nào trong trạng thái này.
        </div>
      ) : (
        <div className="space-y-6">
          {filtered.map((s) => {
            const isEditing = editingId === s.id;

            return (
              <div
                key={s.id}
                className="flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md lg:flex-row"
              >
                {/* Left: Video */}
                <div className="relative aspect-video bg-slate-900 lg:w-[320px] lg:shrink-0">
                  {s.video_url ? (
                    <video src={s.video_url} controls className="h-full w-full object-contain" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-500">
                      <span className="text-xs font-semibold">Không có video</span>
                    </div>
                  )}
                  <div className="absolute left-3 top-3 z-10">
                    <Badge className={`${statusColors[s.status]} border shadow-sm`}>
                      {statusLabels[s.status]}
                    </Badge>
                  </div>
                </div>

                {/* Right: Info/Edit Form */}
                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  {isEditing ? (
                    /* Edit Form */
                    <div className="space-y-4">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="grid gap-1.5">
                          <span className="text-xs font-bold text-slate-500">Từ / cụm từ</span>
                          <input
                            type="text"
                            value={editTerm}
                            onChange={(e) => setEditTerm(e.target.value)}
                            className="h-9 rounded-xl border border-slate-200 px-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-100"
                          />
                        </label>
                        <label className="grid gap-1.5">
                          <span className="text-xs font-bold text-slate-500">Chủ đề</span>
                          <select
                            value={editCategory}
                            onChange={(e) => setEditCategory(e.target.value)}
                            className="h-9 rounded-xl border border-slate-200 px-2 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-100"
                          >
                            {signCategories.map((cat) => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </label>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="grid gap-1.5">
                          <span className="text-xs font-bold text-slate-500">Vùng miền</span>
                          <select
                            value={editRegion}
                            onChange={(e) => setEditRegion(e.target.value)}
                            className="h-9 rounded-xl border border-slate-200 px-2 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-100"
                          >
                            <option value="Toàn quốc">Toàn quốc</option>
                            <option value="HN">Hà Nội</option>
                            <option value="HP">Hải Phòng</option>
                            <option value="HCM">TP.HCM</option>
                            <option value="Chưa xác định">Chưa xác định</option>
                          </select>
                        </label>
                        <label className="grid gap-1.5">
                          <span className="text-xs font-bold text-slate-500">Độ khó</span>
                          <select
                            value={editDifficulty}
                            onChange={(e) => setEditDifficulty(e.target.value)}
                            className="h-9 rounded-xl border border-slate-200 px-2 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-100"
                          >
                            <option value="easy">Dễ</option>
                            <option value="medium">Trung bình</option>
                            <option value="hard">Khó</option>
                          </select>
                        </label>
                      </div>

                      <label className="grid gap-1.5">
                        <span className="text-xs font-bold text-slate-500">Ý nghĩa</span>
                        <textarea
                          value={editMeaning}
                          rows={2}
                          onChange={(e) => setEditMeaning(e.target.value)}
                          className="rounded-xl border border-slate-200 p-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-100"
                        />
                      </label>

                      <label className="grid gap-1.5">
                        <span className="text-xs font-bold text-slate-500">Giải thích cách thực hiện</span>
                        <textarea
                          value={editExplanation}
                          rows={2}
                          onChange={(e) => setEditExplanation(e.target.value)}
                          className="rounded-xl border border-slate-200 p-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-100"
                        />
                      </label>

                      <label className="grid gap-1.5">
                        <span className="text-xs font-bold text-slate-500">Ví dụ câu</span>
                        <textarea
                          value={editExample}
                          rows={1}
                          onChange={(e) => setEditExample(e.target.value)}
                          className="rounded-xl border border-slate-200 p-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-100"
                        />
                      </label>

                      <label className="grid gap-1.5">
                        <span className="text-xs font-bold text-slate-500">Các bước thực hiện (Mỗi bước một dòng)</span>
                        <textarea
                          value={editStepsText}
                          rows={3}
                          onChange={(e) => setEditStepsText(e.target.value)}
                          className="rounded-xl border border-slate-200 p-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-100"
                        />
                      </label>

                      <label className="grid gap-1.5">
                        <span className="text-xs font-bold text-slate-500">Ghi chú / Lưu ý</span>
                        <textarea
                          value={editNote}
                          rows={1}
                          onChange={(e) => setEditNote(e.target.value)}
                          className="rounded-xl border border-slate-200 p-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-100"
                        />
                      </label>

                      <div className="flex justify-end gap-2 pt-2">
                        <Button
                          variant="outline"
                          onClick={() => setEditingId(null)}
                          disabled={processing === s.id}
                          className="rounded-full"
                          size="sm"
                        >
                          Hủy
                        </Button>
                        <Button
                          onClick={() => saveEdit(s.id)}
                          disabled={processing === s.id}
                          className="rounded-full gap-1"
                          size="sm"
                        >
                          <Save className="h-3.5 w-3.5" /> Lưu lại
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* Display view */
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-4">
                          <h3 className="text-2xl font-black text-slate-900">{s.term}</h3>
                          <div className="flex gap-1.5">
                            <Badge variant="outline" className="rounded-full font-bold">
                              {s.category}
                            </Badge>
                            <Badge variant="outline" className="rounded-full font-bold">
                              {s.region}
                            </Badge>
                            <Badge variant="outline" className="rounded-full font-bold">
                              Độ khó: {s.difficulty === "easy" ? "Dễ" : s.difficulty === "medium" ? "Trung bình" : "Khó"}
                            </Badge>
                          </div>
                        </div>

                        <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-slate-500">
                          <span>Người đề xuất: <span className="font-bold text-slate-700">{s.profiles?.full_name || "Thành viên"}</span></span>
                          <span>•</span>
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          <span>{new Date(s.created_at).toLocaleDateString("vi-VN")}</span>
                        </p>

                        <div className="mt-4 space-y-2 text-sm text-slate-700">
                          {s.meaning && (
                            <p>
                              <span className="font-bold text-slate-900">Ý nghĩa:</span> {s.meaning}
                            </p>
                          )}
                          {s.simple_explanation && (
                            <p>
                              <span className="font-bold text-slate-900">Cách thực hiện:</span> {s.simple_explanation}
                            </p>
                          )}
                          {s.example && (
                            <p>
                              <span className="font-bold text-slate-900">Ví dụ:</span> &quot;{s.example}&quot;
                            </p>
                          )}
                          {s.learning_steps && s.learning_steps.length > 0 && (
                            <div>
                              <span className="font-bold text-slate-900">Các bước học:</span>
                              <ol className="mt-1 list-decimal pl-5 space-y-0.5 text-slate-600">
                                {s.learning_steps.map((step, idx) => (
                                  <li key={idx} className="font-semibold">{step}</li>
                                ))}
                              </ol>
                            </div>
                          )}
                          {s.note && (
                            <p className="text-amber-800 font-semibold bg-amber-50 px-2.5 py-1.5 rounded-xl border border-amber-100 text-xs">
                              💡 {s.note}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
                        {s.status === "pending" && (
                          <>
                            <Button
                              onClick={() => approveSuggestion(s)}
                              disabled={processing !== null}
                              size="sm"
                              className="rounded-full gap-1.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              <Check className="h-4 w-4" /> Duyệt & Xuất bản
                            </Button>
                            <Button
                              onClick={() => rejectSuggestion(s.id)}
                              disabled={processing !== null}
                              size="sm"
                              variant="outline"
                              className="rounded-full gap-1.5 px-4 text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                            >
                              <X className="h-4 w-4" /> Từ chối
                            </Button>
                          </>
                        )}
                        <Button
                          onClick={() => startEdit(s)}
                          disabled={processing !== null}
                          size="sm"
                          variant="ghost"
                          className="rounded-full gap-1.5 px-4 hover:bg-slate-100 text-slate-600"
                        >
                          <Edit2 className="h-4 w-4" /> Sửa thông tin
                        </Button>
                        <Button
                          onClick={() => deleteSuggestion(s.id)}
                          disabled={processing !== null}
                          size="sm"
                          variant="ghost"
                          className="ml-auto rounded-full p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                          title="Xóa đề xuất"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
