"use client";

import { useState, useRef } from "react";
import { Loader2, Film, X, UploadCloud, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface VideoUploaderProps {
  videoUrl: string;
  onChange: (url: string) => void;
  folder: "dictionary" | "alphabet" | "submissions";
  idKey?: string;
}

// Helper function to read video duration using standard HTML5 video element metadata
function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      resolve(video.duration);
    };
    video.onerror = () => {
      window.URL.revokeObjectURL(video.src);
      reject("Không thể đọc metadata của file video.");
    };
    video.src = window.URL.createObjectURL(file);
  });
}

export function VideoUploader({ videoUrl, onChange, folder, idKey }: VideoUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setError("");

    console.log("[DEBUG] VideoUploader - Selected file details:", {
      name: file.name,
      type: file.type,
      sizeBytes: file.size,
      sizeMB: (file.size / (1024 * 1024)).toFixed(2) + " MB",
    });

    // 1. Validate type (MP4/WebM)
    const validTypes = ["video/mp4", "video/webm"];
    if (!validTypes.includes(file.type)) {
      const errorMsg = "Chỉ chấp nhận file video định dạng MP4 hoặc WebM.";
      console.warn("[DEBUG] VideoUploader - Validation failed (type):", file.type);
      setError(errorMsg);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // 2. Validate size (20MB)
    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {
      const errorMsg = `Dung lượng file vượt quá giới hạn 20MB (File size: ${(file.size / (1024 * 1024)).toFixed(2)} MB).`;
      console.warn("[DEBUG] VideoUploader - Validation failed (size):", file.size);
      setError(errorMsg);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setUploading(true);

    try {
      // 3. Validate duration (<= 30s)
      console.log("[DEBUG] VideoUploader - Reading video duration...");
      const duration = await getVideoDuration(file);
      console.log("[DEBUG] VideoUploader - Video duration:", duration, "seconds");

      if (duration > 30) {
        const errorMsg = `Thời lượng video vượt quá 30 giây (Độ dài hiện tại: ${duration.toFixed(1)} giây).`;
        console.warn("[DEBUG] VideoUploader - Validation failed (duration):", duration);
        setError(errorMsg);
        if (fileInputRef.current) fileInputRef.current.value = "";
        setUploading(false);
        return;
      }

      const supabase = createClient();
      const timestamp = Date.now();
      const cleanedFileName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
      
      // Clean up idKey to be safe for directory structure
      const subFolder = idKey ? idKey.replace(/[^a-zA-Z0-9-]/g, "_") : "general";
      const filePath = `${folder}/${subFolder}/${timestamp}-${cleanedFileName}`;

      console.log("[DEBUG] VideoUploader - Target file path in storage:", filePath);

      // 4. Upload file to Supabase Storage bucket 'sign-videos'
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("sign-videos")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        console.error("[DEBUG] VideoUploader - Supabase storage upload API error:", uploadError);
        throw new Error(`Supabase Storage Upload Error: ${uploadError.message} (Status: ${uploadError.name || "Unknown"})`);
      }

      console.log("[DEBUG] VideoUploader - Upload success data:", uploadData);

      // 5. Call getPublicUrl only after successful upload
      if (uploadData) {
        const { data: urlData } = supabase.storage
          .from("sign-videos")
          .getPublicUrl(filePath);
        
        console.log("[DEBUG] VideoUploader - Generated public URL:", urlData.publicUrl);
        
        // 6. Update video_url state/parent only after successful getPublicUrl
        onChange(urlData.publicUrl);
      }
    } catch (err: any) {
      console.error("[DEBUG] VideoUploader - Execution exception during upload flow:", err);
      setError("Không thể tải video lên storage: " + (err.message || String(err)));
    } finally {
      setUploading(false);
    }
  }


  function handleRemove() {
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-4">
      <span className="block font-bold text-slate-800">Video minh họa ký hiệu</span>

      {videoUrl ? (
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-2 shadow-inner">
          <video
            src={videoUrl}
            controls
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
                <p className="mt-1 text-xs text-slate-500">Chấp nhận MP4, WebM (Tối đa 20MB)</p>
              </div>
            </>
          )}
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
