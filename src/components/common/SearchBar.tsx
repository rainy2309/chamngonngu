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
      className="mx-auto flex w-full max-w-4xl items-center gap-2 rounded-full border border-blue-100 bg-white p-2 shadow-xl shadow-blue-100/70"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.();
      }}
    >
      <Search className="ml-4 h-6 w-6 shrink-0 text-blue-500" aria-hidden="true" />
      <label className="sr-only" htmlFor="cham-search">Tìm kiếm</label>
      <input
        id="cham-search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-h-12 flex-1 bg-transparent text-base font-medium text-slate-800 outline-none placeholder:text-slate-400"
      />
      <Button type="submit" className="rounded-full px-6">Tìm kiếm</Button>
    </form>
  );
}
