"use client";

import React, { useEffect, useRef, useState } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
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
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setHasError(false);
    setIsLoading(true);
  }, [src]);

  function handleVideoError() {
    const video = videoRef.current;
    const err = video?.error;

    setHasError(true);
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
    setHasError(false);
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
        onLoadStart={() => setIsLoading(true)}
        onLoadedMetadata={() => setIsLoading(false)}
        onCanPlay={() => setIsLoading(false)}
        onError={handleVideoError}
        className="h-full w-full object-contain"
        {...props}
      >
        {fallbackText || "Trình duyệt của bạn không hỗ trợ phát video."}
      </video>
      {isLoading ? (
        <div className="pointer-events-none absolute inset-0 grid place-items-center bg-slate-950/70 text-sm font-black text-white">
          Đang tải video...
        </div>
      ) : null}
    </div>
  );
}
