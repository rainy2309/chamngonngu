import { VocabCard } from "@/components/vocab/VocabCard";
import type { VocabularyItem } from "@/types/vocabulary";

export function VocabGrid({ items, compact = false }: { items: VocabularyItem[]; compact?: boolean }) {
  if (!items.length) {
    return <p className="rounded-3xl bg-blue-50 p-6 text-center font-semibold text-blue-900">Chưa tìm thấy nội dung phù hợp. Hãy thử từ khóa khác.</p>;
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((item) => <VocabCard key={item.id} item={item} compact={compact} />)}
    </div>
  );
}
