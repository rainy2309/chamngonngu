"use client";

import React, { useState, useRef, useEffect } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SafeVideoProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  src: string;
  poster?: string;
  fallbackText?: string;
}

export function SafeVideo({
  src,
  poster,
  fallbackText,
  className,
  controls = true,
  preload = "metadata",
  playsInline = true,
  ...props
}: SafeVideoProps) {
  const [hasError, setHasError] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement>(null);

  // Reset error state when src changes
  useEffect(() => {
    setHasError(false);
    setErrorDetails("");
  }, [src]);

  async function handleVideoError() {
    const video = videoRef.current;
    if (!video) return;

    setHasError(true);

    const err = video.error;
    let codeStr = "UNKNOWN_ERROR";
    let messageStr = "Không rõ nguyên nhân.";

    if (err) {
      switch (err.code) {
        case 1:
          codeStr = "MEDIA_ERR_ABORTED (1)";
          messageStr = "Quá trình tải video bị hủy.";
          break;
        case 2:
          codeStr = "MEDIA_ERR_NETWORK (2)";
          messageStr = "Lỗi kết nối mạng khi tải video.";
          break;
        case 3:
          codeStr = "MEDIA_ERR_DECODE (3)";
          messageStr = "Lỗi giải mã video. Định dạng hoặc codec video không được trình duyệt hỗ trợ (ví dụ HEVC/H.265 trên Chrome).";
          break;
        case 4:
          codeStr = "MEDIA_ERR_SRC_NOT_SUPPORTED (4)";
          messageStr = "Định dạng video hoặc nguồn phát không được hỗ trợ.";
          break;
      }
    }

    const networkStates = ["EMPTY (0)", "IDLE (1)", "LOADING (2)", "NO_SOURCE (3)"];
    const readyStates = ["HAVE_NOTHING (0)", "HAVE_METADATA (1)", "HAVE_CURRENT_DATA (2)", "HAVE_FUTURE_DATA (3)", "HAVE_ENOUGH_DATA (4)"];

    const currentNetworkState = networkStates[video.networkState] || String(video.networkState);
    const currentReadyState = readyStates[video.readyState] || String(video.readyState);

    const debugInfo: Record<string, any> = {
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
      videoUrl: src,
      errorCode: err?.code,
      errorName: codeStr,
      errorMessage: err?.message || messageStr,
      networkState: currentNetworkState,
      readyState: currentReadyState,
    };

    console.error("[SafeVideo Error Encountered]", debugInfo);

    // Try to fetch headers of the video URL to diagnose CORS or content-type mismatch
    try {
      const response = await fetch(src, { method: "HEAD" });
      debugInfo.fetchStatus = response.status;
      debugInfo.fetchStatusText = response.statusText;
      debugInfo.contentType = response.headers.get("content-type");
      debugInfo.contentLength = response.headers.get("content-length");
      debugInfo.acceptRanges = response.headers.get("accept-ranges");
      console.log("[SafeVideo Fetch Diagnostics]", debugInfo);

      if (response.status === 404) {
        messageStr = "Không tìm thấy file video trên Storage (404 Not Found).";
      } else if (debugInfo.contentType && !debugInfo.contentType.startsWith("video/")) {
        messageStr = `Phản hồi từ server có Content-Type không hợp lệ: "${debugInfo.contentType}". Yêu cầu video/mp4 hoặc video/webm.`;
      }
    } catch (fetchErr) {
      debugInfo.fetchError = fetchErr instanceof Error ? fetchErr.message : String(fetchErr);
      console.warn("[SafeVideo HEAD Fetch Failed - potentially CORS restriction]", fetchErr);
    }

    setErrorDetails(`${messageStr} (${codeStr})`);
  }

  function handleRetry() {
    setHasError(false);
    setErrorDetails("");
    const video = videoRef.current;
    if (video) {
      video.load();
      video.play().catch((e) => console.log("Retry play request failed:", e));
    }
  }

  if (hasError) {
    return (
      <div className={`flex flex-col items-center justify-center gap-3 rounded-xl bg-slate-900 p-4 text-center text-slate-100 ${className}`}>
        <AlertCircle className="h-8 w-8 text-red-500 shrink-0" />
        <div className="space-y-1 px-2">
          <p className="text-sm font-bold leading-5">
            Trình duyệt hiện tại không phát được video này.
          </p>
          <p className="text-[11px] font-medium text-slate-400">
            Vui lòng thử video MP4 H.264 hoặc dùng trình duyệt khác.
          </p>
          {errorDetails && (
            <p className="mt-2 text-[10px] font-mono text-slate-500 bg-slate-950/40 p-1.5 rounded select-all break-all leading-normal">
              Details: {errorDetails}
            </p>
          )}
        </div>
        <Button
          type="button"
          onClick={handleRetry}
          variant="outline"
          size="sm"
          className="mt-1 h-8 rounded-full border-slate-700 bg-slate-800 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white"
        >
          <RotateCcw className="mr-1 h-3.5 w-3.5" />
          Tải lại video
        </Button>
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      src={src}
      poster={poster}
      controls={controls}
      preload={preload}
      playsInline={playsInline}
      onError={handleVideoError}
      className={className}
      {...props}
    >
      {fallbackText || "Trình duyệt của bạn không hỗ trợ phát video."}
    </video>
  );
}
