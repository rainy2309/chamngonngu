"use client";

import React, { useRef, useState } from "react";
import { AlertCircle, RotateCcw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
  const [errorSource, setErrorSource] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasError = errorSource === src;

  function handleVideoError() {
    const video = videoRef.current;
    const err = video?.error;

    setErrorSource(src);
    setIsLoading(false);

    console.error("[SafeVideo Error Encountered]", {
      videoUrl: src,
      errorCode: err?.code,
      errorMessage: err?.message,
      networkState: video?.networkState,
      readyState: video?.readyState,
    });
  }

  function handleRetry() {
    setErrorSource(null);
    setIsLoading(true);

    const video = videoRef.current;
    if (video) {
      video.load();
      video.play().catch((error) => console.log("Retry play request failed:", error));
    }
  }

  if (hasError) {
    return (
      <div className={cn("flex flex-col items-center justify-center gap-3 rounded-xl bg-slate-900 p-4 text-center text-slate-100", className)}>
        <AlertCircle className="h-8 w-8 shrink-0 text-red-500" aria-hidden="true" />
        <div className="space-y-1 px-2">
          <p className="text-sm font-bold leading-5">Không thể tải video. Vui lòng thử lại.</p>
          <p className="text-[11px] font-medium text-slate-400">
            Nếu lỗi tiếp tục xảy ra, hãy kiểm tra định dạng hoặc đường dẫn video.
          </p>
        </div>
        <Button
          type="button"
          onClick={handleRetry}
          variant="outline"
          size="sm"
          className="mt-1 h-8 rounded-full border-slate-700 bg-slate-800 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white"
        >
          <RotateCcw className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
          Tải lại video
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        controls={controls}
        preload={preload}
        playsInline={playsInline}
        onError={handleVideoError}
        onLoadStart={() => {
          setErrorSource(null);
          setIsLoading(true);
        }}
        onCanPlay={() => setIsLoading(false)}
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => setIsLoading(false)}
        onSeeking={() => setIsLoading(true)}
        onSeeked={() => setIsLoading(false)}
        className="h-full w-full object-contain"
        {...props}
      >
        {fallbackText || "Trình duyệt của bạn không hỗ trợ phát video."}
      </video>

      {isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/40 backdrop-blur-[1px] pointer-events-none transition-opacity duration-300">
          <div className="flex flex-col items-center gap-1 rounded-xl bg-slate-900/80 px-3 py-2 shadow-md">
            <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Đang tải...</span>
          </div>
        </div>
      )}
    </div>
  );
}
