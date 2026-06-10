import { alphabetSignData } from "@/data/alphabetSignData";
import { signDictionaryData } from "@/data/signDictionaryData";
import { vocabularyCourseData } from "@/data/vocabularyCourseData";
import { normalizeVietnameseText } from "@/lib/vietnameseText";

export type ProgressDisplayInfo = {
  label: string;
  typeLabel: string;
  category?: string;
  href: string;
  missingDetails?: boolean;
};

const knownAlphabetLabels: Record<string, ProgressDisplayInfo> = {
  aw: { label: "Ă", typeLabel: "Bảng chữ cái", category: "Biến thể nguyên âm", href: "/khoa-hoc/bang-chu-cai?letter=breve_group" },
  aa: { label: "Â", typeLabel: "Bảng chữ cái", category: "Biến thể nguyên âm", href: "/khoa-hoc/bang-chu-cai?letter=circumflex_group" },
  ee: { label: "Ê", typeLabel: "Bảng chữ cái", category: "Biến thể nguyên âm", href: "/khoa-hoc/bang-chu-cai?letter=circumflex_group" },
  oo: { label: "Ô", typeLabel: "Bảng chữ cái", category: "Biến thể nguyên âm", href: "/khoa-hoc/bang-chu-cai?letter=circumflex_group" },
  ow: { label: "Ơ", typeLabel: "Bảng chữ cái", category: "Biến thể nguyên âm", href: "/khoa-hoc/bang-chu-cai?letter=horn_group" },
  uw: { label: "Ư", typeLabel: "Bảng chữ cái", category: "Biến thể nguyên âm", href: "/khoa-hoc/bang-chu-cai?letter=horn_group" },
  aeo: { label: "Â / Ê / Ô", typeLabel: "Bảng chữ cái", category: "Biến thể nguyên âm", href: "/khoa-hoc/bang-chu-cai?letter=circumflex_group" },
  uo: { label: "Ư / Ơ", typeLabel: "Bảng chữ cái", category: "Biến thể nguyên âm", href: "/khoa-hoc/bang-chu-cai?letter=horn_group" },
  circumflex_group: { label: "Â / Ê / Ô", typeLabel: "Bảng chữ cái", category: "Biến thể nguyên âm", href: "/khoa-hoc/bang-chu-cai?letter=circumflex_group" },
  breve_group: { label: "Ă", typeLabel: "Bảng chữ cái", category: "Biến thể nguyên âm", href: "/khoa-hoc/bang-chu-cai?letter=breve_group" },
  horn_group: { label: "Ư / Ơ", typeLabel: "Bảng chữ cái", category: "Biến thể nguyên âm", href: "/khoa-hoc/bang-chu-cai?letter=horn_group" },
  sac: { label: "Dấu sắc", typeLabel: "Dấu thanh", href: "/khoa-hoc/bang-chu-cai?letter=sac" },
  huyen: { label: "Dấu huyền", typeLabel: "Dấu thanh", href: "/khoa-hoc/bang-chu-cai?letter=huyen" },
  hoi: { label: "Dấu hỏi", typeLabel: "Dấu thanh", href: "/khoa-hoc/bang-chu-cai?letter=hoi" },
  nga: { label: "Dấu ngã", typeLabel: "Dấu thanh", href: "/khoa-hoc/bang-chu-cai?letter=nga" },
  nang: { label: "Dấu nặng", typeLabel: "Dấu thanh", href: "/khoa-hoc/bang-chu-cai?letter=nang" },
  dd: { label: "Đ", typeLabel: "Bảng chữ cái", category: "Chữ cái", href: "/khoa-hoc/bang-chu-cai?letter=dd" },
};

function slugify(value: string) {
  return normalizeVietnameseText(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function stripKnownPrefix(value: string) {
  return value
    .replace(/^alphabet-/, "")
    .replace(/^letter-/, "")
    .replace(/^vocab-/, "")
    .replace(/^dictionary-/, "");
}

function prettifySlug(value: string) {
  const clean = stripKnownPrefix(value)
    .replace(/^[a-z0-9]+-\d+-/, "")
    .replace(/^[a-z0-9]+-/, "")
    .replace(/-/g, " ")
    .trim();

  if (!clean) return value;
  return clean.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function isUuidLike(value: string) {
  return /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i.test(value.replace(/\s+/g, ""));
}

const displayIndex = new Map<string, ProgressDisplayInfo>();

for (const item of vocabularyCourseData) {
  const info: ProgressDisplayInfo = {
    label: item.word,
    typeLabel: "Từ vựng",
    category: item.category,
    href: `/tu-dien?q=${encodeURIComponent(item.word)}`,
  };
  const topicSlug = slugify(item.category);
  const wordSlug = slugify(item.word);
  [item.id, item.word_key, wordSlug, `${topicSlug}-${wordSlug}`].filter(Boolean).forEach((key) => displayIndex.set(key, info));
}

for (const item of signDictionaryData) {
  const info: ProgressDisplayInfo = {
    label: item.word,
    typeLabel: "Từ vựng",
    category: item.category,
    href: `/tu-dien?q=${encodeURIComponent(item.word)}`,
  };
  [item.id, item.normalizedWord, slugify(item.word)].filter(Boolean).forEach((key) => displayIndex.set(key, info));
}

for (const item of alphabetSignData) {
  const info: ProgressDisplayInfo = {
    label: item.display_label || item.letter || item.label,
    typeLabel: item.type === "tone_mark" ? "Dấu thanh" : "Bảng chữ cái",
    category: item.type === "vowel_modifier" ? "Biến thể nguyên âm" : item.type === "letter" ? "Chữ cái" : undefined,
    href: `/khoa-hoc/bang-chu-cai?letter=${encodeURIComponent(item.letter_key)}`,
  };
  [item.id, item.letter_key, `alphabet-${item.letter_key}`, slugify(item.display_label), slugify(item.label)].filter(Boolean).forEach((key) => displayIndex.set(key, info));
}

for (const [key, info] of Object.entries(knownAlphabetLabels)) {
  displayIndex.set(key, info);
  displayIndex.set(`alphabet-${key}`, info);
}

export function getProgressDisplayInfo(rawId: string, rawLabel?: string): ProgressDisplayInfo {
  const candidates = [rawId, rawLabel, stripKnownPrefix(rawId), rawLabel ? stripKnownPrefix(rawLabel) : ""].filter(
    (candidate): candidate is string => Boolean(candidate),
  );

  for (const candidate of candidates) {
    const direct = displayIndex.get(candidate);
    if (direct) return direct;

    const normalized = displayIndex.get(slugify(candidate));
    if (normalized) return normalized;
  }

  if (isUuidLike(rawId) || (rawLabel && isUuidLike(rawLabel))) {
    return {
      label: "Mục học tập",
      typeLabel: "Không tìm thấy dữ liệu chi tiết",
      href: "/tu-dien",
      missingDetails: true,
    };
  }

  return {
    label: prettifySlug(rawLabel && rawLabel !== rawId ? rawLabel : rawId),
    typeLabel: "Mục học",
    href: "/tu-dien",
  };
}
