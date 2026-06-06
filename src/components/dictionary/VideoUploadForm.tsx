"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Upload, Video, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/client";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const ALLOWED_TYPES = ["video/mp4", "video/webm"];

type VideoUploadFormProps = {
  wordId: string;
  wordText: string;
  onClose: () => void;
};

export function VideoUploadForm({ wordId, wordText, onClose }: VideoUploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

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

  async function upload() {
    if (!file || uploading) return;
    setUploading(true);
    setError(null);
    try {
      if (!hasSupabaseEnv()) {
        setError("Thiếu cấu hình Supabase.");
        return;
      }
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("Bạn cần đăng nhập để đóng góp.");
        return;
      }

      const ext = file.name.split(".").pop() ?? "mp4";
      const path = `contributions/${user.id}/${wordId}-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("sign-videos")
        .upload(path, file, { contentType: file.type });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        setError("Không thể tải lên video. Vui lòng thử lại.");
        return;
      }

      const { data: urlData } = supabase.storage.from("sign-videos").getPublicUrl(path);

      // Fail-safe: Ensure user profile exists before inserting contributions
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (!profile) {
        await supabase.from("profiles").insert({
          id: user.id,
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "Thành viên CHẠM",
          role: user.user_metadata?.role || "user",
          avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
        });
      }

      const { error: dbError } = await supabase.from("word_contributions").insert({
        user_id: user.id,
        word_id: wordId,
        word_text: wordText,
        video_url: urlData.publicUrl,
        description: description.trim() || null,
      });

      if (dbError) {
        console.error("DB error:", dbError);
        setError("Không thể lưu đóng góp. Vui lòng thử lại.");
        return;
      }

      setSuccess(true);
    } catch (err) {
      console.error("Upload error:", err);
      setError("Đã xảy ra lỗi. Vui lòng thử lại.");
    } finally {
      setUploading(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center">
        <p className="text-lg font-black text-emerald-700">🎉 Cảm ơn bạn đã đóng góp!</p>
        <p className="mt-2 text-sm font-semibold text-emerald-600">
          Video sẽ được kiểm duyệt trước khi hiển thị để đảm bảo tính chính xác của ký hiệu.
        </p>
        <Button onClick={onClose} variant="outline" className="mt-4 rounded-full">Đóng</Button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-blue-100 bg-white p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-base font-black text-slate-950">
          <Video className="h-5 w-5 text-blue-500" />
          Đóng góp video ký hiệu cho &quot;{wordText}&quot;
        </h3>
        <button type="button" onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div
        className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-blue-200 bg-blue-50/60 p-6 text-center transition hover:border-blue-400 hover:bg-blue-50"
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
            <span className="text-sm font-bold text-blue-700">{file.name}</span>
            <span className="text-xs text-slate-400">({(file.size / 1024 / 1024).toFixed(1)}MB)</span>
          </div>
        ) : (
          <>
            <Upload className="h-8 w-8 text-blue-400" />
            <p className="text-sm font-bold text-blue-700">Kéo thả video hoặc click để chọn</p>
            <p className="text-xs text-slate-400">MP4, WebM — Tối đa 20MB</p>
          </>
        )}
      </div>

      <label className="mt-4 grid gap-2">
        <span className="text-sm font-bold text-slate-700">Mô tả ngắn (tùy chọn)</span>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value.slice(0, 500))}
          placeholder='VD: "Ký hiệu vùng miền Nam"'
          className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-100"
        />
      </label>

      <p className="mt-3 rounded-xl bg-amber-50 p-3 text-xs font-semibold leading-5 text-amber-800">
        ⚠️ Video sẽ được kiểm duyệt bởi Giáo viên hoặc Quản trị viên trước khi hiển thị công khai.
      </p>

      {error ? (
        <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>
      ) : null}

      <div className="mt-4 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose} className="rounded-full" disabled={uploading}>Hủy</Button>
        <Button onClick={upload} disabled={!file || uploading} className="rounded-full gap-2">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {uploading ? "Đang tải lên..." : "Gửi đóng góp"}
        </Button>
      </div>
    </div>
  );
}
