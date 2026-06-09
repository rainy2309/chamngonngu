"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SearchBar } from "@/components/common/SearchBar";

export function SearchSection() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = () => {
    if (query.trim()) {
      router.push(`/tu-dien?search=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <section className="relative z-10 mx-auto mt-4 max-w-6xl px-4 sm:mt-5 sm:px-6 lg:mt-5 lg:px-8">
      <SearchBar value={query} onChange={setQuery} onSubmit={handleSearch} />
    </section>
  );
}

