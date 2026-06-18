"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

type PasswordInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">;

export function PasswordInput({ className, disabled, ...props }: PasswordInputProps) {
  const [visible, setVisible] = React.useState(false);

  return (
    <div className="relative">
      <input
        className={cn(
          "min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 pr-12 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-400 dark:focus:ring-blue-500/20",
          className,
        )}
        disabled={disabled}
        type={visible ? "text" : "password"}
        {...props}
      />
      <button
        type="button"
        aria-label={visible ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
        disabled={disabled}
        onClick={() => setVisible((current) => !current)}
        className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-slate-500 transition hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 disabled:pointer-events-none disabled:opacity-50 dark:text-slate-400 dark:hover:bg-blue-500/10 dark:hover:text-blue-200 dark:focus-visible:ring-blue-500/20"
      >
        {visible ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
      </button>
    </div>
  );
}
