"use client";

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = "Tìm từ, cụm từ hoặc nội dung có thể mô tả bằng ngôn ngữ ký hiệu...",
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
}) {
  return (
    <form
      className="mx-auto grid w-full max-w-4xl gap-3 rounded-[1.75rem] border border-blue-100 bg-white p-3 shadow-xl shadow-blue-100/70 dark:border-slate-700 dark:bg-slate-900 dark:shadow-none sm:flex sm:items-center sm:rounded-full sm:gap-2 sm:p-2"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.();
      }}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3 rounded-full bg-blue-50/60 px-3 dark:bg-slate-800 sm:bg-transparent sm:dark:bg-transparent">
        <Search className="h-5 w-5 shrink-0 text-blue-500 sm:ml-2 sm:h-6 sm:w-6" aria-hidden="true" />
        <label className="sr-only" htmlFor="cham-search">
          Tìm kiếm
        </label>
        <input
          id="cham-search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="min-h-12 min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-50 dark:placeholder:text-slate-500 sm:text-base"
        />
      </div>
      <Button type="submit" className="min-h-12 w-full rounded-full px-6 sm:w-auto">
        Tìm kiếm
      </Button>
    </form>
  );
}
