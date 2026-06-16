"use client";

import { useState, useRef } from "react";
import { Loader2, Film, X, UploadCloud, AlertCircle, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { SafeVideo } from "@/components/ui/safe-video";
import {
  readVideoMetadata,
  validateVideoFile,
  logVideoUploadDebug,
  logVideoMetadataError,
  logVideoUploadSuccess,
  sanitizeStoragePath,
  MAX_VIDEO_DURATION_SECONDS,
  verifyUploadedSize,
} from "@/lib/videoUtils";

interface VideoUploaderProps {
  videoUrl: string;
  onChange: (url: string) => void;
  folder: "dictionary" | "alphabet" | "submissions";
  idKey?: string;
}

export function VideoUploader({ videoUrl, onChange, folder, idKey }: VideoUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setError("");
    setWarning("");

    // Debug log with browser info
    logVideoUploadDebug("Selected file", file);

    // 1. Validate type and size (hard block)
    const validation = validateVideoFile(file);
    if (!validation.valid) {
      console.warn("[VideoUploader] Validation failed:", validation.error);
      setError(validation.error!);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    if (validation.warning) {
      setWarning(validation.warning);
    }

    setUploading(true);

    try {
      // 2. Try to read metadata (non-blocking on failure)
      let metadataWarning = "";
      try {
        console.log("[VideoUploader] Reading video metadata...");
        const metadata = await readVideoMetadata(file);
        console.log("[VideoUploader] Metadata read success:", metadata);

        // Only block if duration is confirmed to be over the limit
        if (metadata.duration !== null && metadata.duration > MAX_VIDEO_DURATION_SECONDS) {
          const errorMsg = `Thời lượng video vượt quá ${MAX_VIDEO_DURATION_SECONDS} giây (Độ dài hiện tại: ${metadata.duration.toFixed(1)} giây).`;
          console.warn("[VideoUploader] Duration exceeded:", metadata.duration);
          setError(errorMsg);
          if (fileInputRef.current) fileInputRef.current.value = "";
          setUploading(false);
          return;
        }
      } catch (metaErr: any) {
        // Metadata failure is NOT a hard block — warn and continue
        logVideoMetadataError(file, metaErr);
        metadataWarning =
          "Không thể đọc metadata video trên trình duyệt hiện tại. " +
          "Bạn vẫn có thể tải video lên để kiểm duyệt. Chi tiết: " + (metaErr.message || String(metaErr));
        setWarning(metadataWarning);
        console.warn("[VideoUploader] Metadata read failed, continuing with upload:", metaErr);
      }

      // 3. Upload to Supabase Storage with correct contentType
      const supabase = createClient();
      const subFolder = idKey || "general";
      const filePath = sanitizeStoragePath(folder, subFolder, file.name);

      console.log("[VideoUploader] Uploading to storage path:", filePath);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("sign-videos")
        .upload(filePath, file, {
          contentType: file.type || "video/mp4",
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        console.error("[VideoUploader] Supabase storage upload error:", uploadError);
        throw new Error(
          `Supabase Storage Upload Error: ${uploadError.message} (Status: ${uploadError.name || "Unknown"})`
        );
      }

      console.log("[VideoUploader] Upload success:", uploadData);

      // 4. Get public URL only after successful upload
      if (uploadData) {
        const { data: urlData } = supabase.storage
          .from("sign-videos")
          .getPublicUrl(filePath);

        logVideoUploadSuccess(filePath, urlData.publicUrl);

        // 5. Verify file size on Storage
        const verification = await verifyUploadedSize(urlData.publicUrl, file.size);
        if (!verification.success) {
          console.error("[VideoUploader] Size verification failed:", verification.error);
          setError(`Lỗi xác thực tải lên: ${verification.error || "Kích thước file không khớp."}`);
          setUploading(false);
          return;
        }

        // 6. Update parent state only after everything succeeds
        onChange(urlData.publicUrl);
      }
    } catch (err: any) {
      console.error("[VideoUploader] Upload flow exception:", err);
      setError("Không thể tải video lên storage: " + (err.message || String(err)));
    } finally {
      setUploading(false);
    }
  }


  function handleRemove() {
    onChange("");
    setWarning("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-4">
      <span className="block font-bold text-slate-800">Video minh họa ký hiệu</span>

      {videoUrl ? (
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-2 shadow-inner">
          <SafeVideo
            src={videoUrl}
            className="aspect-video w-full rounded-xl bg-black object-contain"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white shadow hover:bg-red-700 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="flex min-h-[160px] cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 bg-white p-6 text-center hover:border-blue-400 hover:bg-blue-50/20 transition"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="video/mp4,video/webm"
            className="hidden"
            disabled={uploading}
          />
          {uploading ? (
            <>
              <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
              <p className="font-bold text-slate-600 animate-pulse">Đang tải video lên storage...</p>
            </>
          ) : (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <UploadCloud className="h-6 w-6" />
              </div>
              <div>
                <p className="font-bold text-slate-800">Tải file video lên</p>
                <p className="mt-1 text-xs text-slate-500">Chấp nhận MP4, WebM (Tối đa 20MB, tối đa 30 giây)</p>
              </div>
            </>
          )}
        </div>
      )}

      {warning && (
        <div className="flex items-center gap-2 rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-700">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span>{warning}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
