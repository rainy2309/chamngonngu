"use client";

import { useState } from "react";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

type UserAvatarProps = {
  avatarUrl?: string | null;
  fullName?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
};

const bgColors = [
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
  "bg-indigo-100 text-indigo-700",
  "bg-orange-100 text-orange-700",
];

function getColorFromName(name?: string | null) {
  if (!name) return bgColors[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return bgColors[Math.abs(hash) % bgColors.length];
}

export function UserAvatar({ avatarUrl, fullName, size = "md", className }: UserAvatarProps) {
  const [imageError, setImageError] = useState(false);
  const initial = (fullName ?? "").trim()[0]?.toUpperCase();

  if (avatarUrl && !imageError) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={avatarUrl}
        alt={fullName ?? "Avatar"}
        onError={() => setImageError(true)}
        referrerPolicy="no-referrer"
        className={cn(
          "shrink-0 rounded-full object-cover ring-2 ring-white",
          sizeClasses[size],
          className
        )}
      />
    );
  }

  if (initial) {
    return (
      <div
        className={cn(
          "grid shrink-0 place-items-center rounded-full font-black ring-2 ring-white",
          sizeClasses[size],
          getColorFromName(fullName),
          className
        )}
      >
        {initial}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid shrink-0 place-items-center rounded-full bg-slate-100 text-slate-400 ring-2 ring-white",
        sizeClasses[size],
        className
      )}
    >
      <User className="h-1/2 w-1/2" />
    </div>
  );
}
