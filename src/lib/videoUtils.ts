/**
 * Shared video utilities for Chrome-safe metadata reading, validation, and upload helpers.
 * 
 * Chrome has stricter behavior than other browsers when reading video metadata
 * via HTML5 <video> elements (especially for HEVC/H.265, QuickTime .mov, and
 * certain MP4 containers). This module provides robust fallbacks so that metadata
 * failures never block a valid upload.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export type VideoMetadata = {
  duration: number | null;
  width: number | null;
  height: number | null;
};

export type VideoValidationResult = {
  valid: boolean;
  error?: string;
  warning?: string;
};

// ─── Constants ───────────────────────────────────────────────────────────────

export const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm"];

export const QUICKTIME_TYPES = ["video/quicktime"];

export const MAX_VIDEO_SIZE_BYTES = 20 * 1024 * 1024; // 20MB

export const MAX_VIDEO_DURATION_SECONDS = 30;

const METADATA_TIMEOUT_MS = 10_000;

// ─── Chrome-Safe Metadata Reader ─────────────────────────────────────────────

/**
 * Read video metadata (duration, width, height) from a File using a hidden
 * <video> element and an object URL. Designed to work reliably on Chrome,
 * including Chrome on Vercel deployments.
 *
 * Key Chrome-specific measures:
 *  - Calls video.load() explicitly after setting src
 *  - Uses preload="metadata", muted, playsInline
 *  - Has a 10-second timeout to avoid hanging forever
 *  - Properly cleans up object URLs
 */
export function readVideoMetadata(file: File): Promise<VideoMetadata> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const objectUrl = URL.createObjectURL(file);

    const cleanup = () => {
      URL.revokeObjectURL(objectUrl);
      video.removeAttribute("src");
      video.load(); // Reset the element
    };

    const timeout = window.setTimeout(() => {
      cleanup();
      reject(
        new Error(
          "Trình duyệt không thể đọc metadata video này trong thời gian cho phép. " +
          "Vui lòng thử video MP4 H.264 hoặc WebM."
        )
      );
    }, METADATA_TIMEOUT_MS);

    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;

    video.onloadedmetadata = () => {
      clearTimeout(timeout);

      const duration = Number.isFinite(video.duration) ? video.duration : null;
      const width = video.videoWidth || null;
      const height = video.videoHeight || null;

      cleanup();
      resolve({ duration, width, height });
    };

    video.onerror = () => {
      clearTimeout(timeout);
      const err = video.error;
      cleanup();
      
      let errMsg = "Không thể đọc metadata của file video trên trình duyệt hiện tại.";
      if (err) {
        console.error("[readVideoMetadata Error Details]", {
          code: err.code,
          message: err.message,
          networkState: video.networkState,
          readyState: video.readyState,
        });
        if (err.code === 3 || err.code === 4) {
          errMsg = 
            "Không thể giải mã video để đọc metadata. Video này có thể sử dụng codec không tương thích với Chrome trên máy bạn (ví dụ HEVC/H.265, AV1, hoặc MOV). " +
            "Khuyên dùng: Chuyển đổi video sang định dạng MP4 sử dụng H.264 + AAC.";
        }
      }
      reject(new Error(errMsg));
    };

    // IMPORTANT: Set src then call load() — Chrome needs explicit load()
    video.src = objectUrl;
    video.load();
  });
}

// ─── Validation ──────────────────────────────────────────────────────────────

/**
 * Validate a video file's type and size before upload.
 * Returns a result with `valid: false` and an error message if the file is
 * rejected, or `valid: true` with an optional warning (e.g. for .mov or potential HEVC files).
 */
export function validateVideoFile(file: File): VideoValidationResult {
  const nameLower = file.name.toLowerCase();

  // Check file size first
  if (file.size > MAX_VIDEO_SIZE_BYTES) {
    return {
      valid: false,
      error: `Dung lượng file vượt quá giới hạn 20MB (Kích thước hiện tại: ${(file.size / (1024 * 1024)).toFixed(2)} MB).`,
    };
  }

  // Check QuickTime / MOV
  if (QUICKTIME_TYPES.includes(file.type) || nameLower.endsWith(".mov") || nameLower.endsWith(".qt")) {
    return {
      valid: true,
      warning:
        "Bạn đang tải lên file định dạng MOV/QuickTime. Định dạng này có thể không phát được trên một số phiên bản Google Chrome. " +
        "Khuyên dùng: chuyển đổi sang MP4 (H.264 + AAC) trước khi tải lên.",
    };
  }

  // Check file extension/type for HEVC/H.265
  if (nameLower.endsWith(".hevc") || nameLower.endsWith(".h265")) {
    return {
      valid: true,
      warning:
        "Video này sử dụng codec HEVC/H.265. Trình duyệt Chrome trên một số thiết bị không hỗ trợ giải mã HEVC và sẽ không phát được. " +
        "Khuyên dùng: chuyển đổi video sang MP4 H.264 + AAC.",
    };
  }

  // Check allowed MIME types
  if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
    // If it's a generic video type or has no mime but extension is mp4/webm, we can allow but warn
    if (nameLower.endsWith(".mp4") || nameLower.endsWith(".webm")) {
      return {
        valid: true,
        warning: `Định dạng MIME "${file.type || "không xác định"}" lạ, nhưng đuôi file là MP4/WebM. Video sẽ được tải lên nhưng hãy kiểm tra lại nếu không xem được.`,
      };
    }
    return {
      valid: false,
      error: `Chỉ chấp nhận video định dạng MP4 hoặc WebM (Định dạng MIME hiện tại: ${file.type || "không xác định"}).`,
    };
  }

  // Standard checks pass
  return { valid: true };
}

/**
 * Verify that the uploaded file size matches the original file size by doing a HEAD request to the public URL.
 * Logs a warning on network or CORS errors instead of blocking the user flow.
 */
export async function verifyUploadedSize(
  publicUrl: string,
  originalSize: number
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`[Video Size Verification] Sending HEAD request to ${publicUrl}`);
    const res = await fetch(publicUrl, { method: "HEAD", cache: "no-store" });
    if (!res.ok) {
      return { success: false, error: `HTTP error status ${res.status} (${res.statusText})` };
    }
    const contentLengthStr = res.headers.get("content-length");
    if (!contentLengthStr) {
      console.log("[Video Size Verification] content-length header is not present or exposed via CORS.");
      return { success: true };
    }
    const contentLength = parseInt(contentLengthStr, 10);
    if (contentLength !== originalSize) {
      return {
        success: false,
        error: `Kích thước file không khớp: Gốc ${originalSize} bytes vs Storage ${contentLength} bytes.`,
      };
    }
    console.log("[Video Size Verification] Success: size matches perfectly.");
    return { success: true };
  } catch (err: any) {
    console.warn(
      "[Video Size Verification Warning] Không thể thực hiện HEAD request để đối chiếu kích thước file (có thể do CORS):",
      err
    );
    return { success: true }; // Don't block upload if network/CORS fails
  }
}

// ─── Debug Logging ───────────────────────────────────────────────────────────

/**
 * Log video file details and browser info to the console for debugging
 * Chrome-specific upload issues.
 */
export function logVideoUploadDebug(label: string, file: File, extra?: Record<string, unknown>) {
  console.log(`[Video Upload Debug] ${label}`, {
    browser: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
    fileSizeMB: (file.size / (1024 * 1024)).toFixed(2) + " MB",
    lastModified: file.lastModified,
    ...extra,
  });
}

export function logVideoMetadataError(file: File, error: unknown) {
  console.error("[Video Metadata Error]", {
    browser: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
    error: error instanceof Error ? error.message : String(error),
  });
}

export function logVideoUploadSuccess(path: string, publicUrl: string) {
  console.log("[Supabase Upload Success]", {
    path,
    publicUrl,
  });
}

// ─── File Path Sanitizer ─────────────────────────────────────────────────────

/**
 * Create a safe storage path for video uploads.
 * Removes accented characters, spaces, and special characters.
 */
export function sanitizeStoragePath(
  folder: string,
  subFolder: string,
  fileName: string
): string {
  const cleanedFileName = fileName.replace(/[^a-zA-Z0-9.]/g, "_");
  const cleanedSubFolder = subFolder.replace(/[^a-zA-Z0-9-]/g, "_");
  const timestamp = Date.now();
  return `${folder}/${cleanedSubFolder}/${timestamp}-${cleanedFileName}`;
}
