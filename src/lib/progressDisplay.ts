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

type DictionaryProgressSource = {
  id?: string | null;
  word?: string | null;
  word_key?: string | null;
  normalized_word?: string | null;
  normalizedWord?: string | null;
  category?: string | null;
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

export function isUuidLike(value: string) {
  return /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i.test(value.replace(/\s+/g, ""));
}

const displayIndex = new Map<string, ProgressDisplayInfo>();

const readableFallbacks: Record<string, ProgressDisplayInfo> = {
  "an-uong-an": { label: "Ăn", typeLabel: "Từ vựng", category: "Ăn uống", href: "/tu-dien?q=%C4%82n" },
  "an-uong-uong": { label: "Uống", typeLabel: "Từ vựng", category: "Ăn uống", href: "/tu-dien?q=U%E1%BB%91ng" },
  "an-uong-com": { label: "Cơm", typeLabel: "Từ vựng", category: "Ăn uống", href: "/tu-dien?q=C%C6%A1m" },
  "an-uong-an-com-chua": { label: "Ăn cơm chưa?", typeLabel: "Từ vựng", category: "Ăn uống", href: "/tu-dien?q=%C4%82n%20c%C6%A1m%20ch%C6%B0a%3F" },
  "uong-an-com-chua": { label: "Ăn cơm chưa?", typeLabel: "Từ vựng", category: "Ăn uống", href: "/tu-dien?q=%C4%82n%20c%C6%A1m%20ch%C6%B0a%3F" },
  "mon-nay-ngon": { label: "Món này ngon", typeLabel: "Từ vựng", category: "Ăn uống", href: "/tu-dien?q=M%C3%B3n%20n%C3%A0y%20ngon" },
  "uong-mon-nay-ngon": { label: "Món này ngon", typeLabel: "Từ vựng", category: "Ăn uống", href: "/tu-dien?q=M%C3%B3n%20n%C3%A0y%20ngon" },
  "alphabet-aw": { label: "Ă", typeLabel: "Bảng chữ cái", category: "Biến thể nguyên âm", href: "/khoa-hoc/bang-chu-cai?letter=breve_group" },
  "alphabet-aa": { label: "Â", typeLabel: "Bảng chữ cái", category: "Biến thể nguyên âm", href: "/khoa-hoc/bang-chu-cai?letter=circumflex_group" },
  "alphabet-ee": { label: "Ê", typeLabel: "Bảng chữ cái", category: "Biến thể nguyên âm", href: "/khoa-hoc/bang-chu-cai?letter=circumflex_group" },
  "alphabet-oo": { label: "Ô", typeLabel: "Bảng chữ cái", category: "Biến thể nguyên âm", href: "/khoa-hoc/bang-chu-cai?letter=circumflex_group" },
  "alphabet-ow": { label: "Ơ", typeLabel: "Bảng chữ cái", category: "Biến thể nguyên âm", href: "/khoa-hoc/bang-chu-cai?letter=horn_group" },
  "alphabet-uw": { label: "Ư", typeLabel: "Bảng chữ cái", category: "Biến thể nguyên âm", href: "/khoa-hoc/bang-chu-cai?letter=horn_group" },
  "alphabet-aeo": { label: "Â / Ê / Ô", typeLabel: "Bảng chữ cái", category: "Biến thể nguyên âm", href: "/khoa-hoc/bang-chu-cai?letter=circumflex_group" },
  "alphabet-uo": { label: "Ư / Ơ", typeLabel: "Bảng chữ cái", category: "Biến thể nguyên âm", href: "/khoa-hoc/bang-chu-cai?letter=horn_group" },
};

function isReadableVietnameseLabel(value?: string) {
  if (!value) return false;
  const trimmed = value.trim();
  if (!trimmed || isUuidLike(trimmed)) return false;
  if (/^(alphabet|letter|vocab|dictionary)-/i.test(trimmed)) return false;
  if (/^[a-z0-9]+(?:-[a-z0-9]+)+$/i.test(trimmed)) return false;
  return /[^\w-]|[À-ỹĐđ]/.test(trimmed);
}

function addDisplayKeys(info: ProgressDisplayInfo, keys: Array<string | undefined>) {
  keys.filter(Boolean).forEach((key) => {
    if (!key) return;
    displayIndex.set(key, info);
    displayIndex.set(slugify(key), info);
  });
}

export function addDictionaryProgressItems(items: DictionaryProgressSource[]) {
  for (const item of items) {
    if (!item.word) continue;

    const category = item.category ?? undefined;
    const info: ProgressDisplayInfo = {
      label: item.word,
      typeLabel: "Từ vựng",
      category,
      href: `/tu-dien?q=${encodeURIComponent(item.word)}`,
    };
    const categorySlug = category ? slugify(category) : "";
    const wordSlug = slugify(item.word);
    const normalizedWord = item.normalized_word ?? item.normalizedWord ?? normalizeVietnameseText(item.word);
    const idWithoutOrdinal = item.id && categorySlug ? item.id.replace(new RegExp(`^${categorySlug}-\\d+-`), `${categorySlug}-`) : undefined;

    addDisplayKeys(info, [
      item.id ?? undefined,
      item.word_key ?? undefined,
      normalizedWord,
      wordSlug,
      categorySlug ? `${categorySlug}-${wordSlug}` : undefined,
      idWithoutOrdinal,
    ]);
  }
}

for (const item of vocabularyCourseData) {
  addDictionaryProgressItems([item]);
}

for (const item of signDictionaryData) {
  addDictionaryProgressItems([item]);
}

for (const item of alphabetSignData) {
  const info: ProgressDisplayInfo = {
    label: item.display_label || item.letter || item.label,
    typeLabel: item.type === "tone_mark" ? "Dấu thanh" : "Bảng chữ cái",
    category: item.type === "vowel_modifier" ? "Biến thể nguyên âm" : item.type === "letter" ? "Chữ cái" : undefined,
    href: `/khoa-hoc/bang-chu-cai?letter=${encodeURIComponent(item.letter_key)}`,
  };
  addDisplayKeys(info, [item.id, item.letter_key, `alphabet-${item.letter_key}`, slugify(item.display_label), slugify(item.label)]);
}

for (const [key, info] of Object.entries(knownAlphabetLabels)) {
  displayIndex.set(key, info);
  displayIndex.set(`alphabet-${key}`, info);
}

for (const [key, info] of Object.entries(readableFallbacks)) {
  addDisplayKeys(info, [key, stripKnownPrefix(key)]);
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

  if (isReadableVietnameseLabel(rawLabel) && rawLabel) {
    return {
      label: rawLabel.trim(),
      typeLabel: "Mục học",
      href: "/tu-dien",
    };
  }

  if (isUuidLike(rawId) || (rawLabel && isUuidLike(rawLabel))) {
    return {
      label: "Mục không còn tồn tại",
      typeLabel: "Dữ liệu này có thể đã bị xóa hoặc chưa đồng bộ.",
      href: "/tu-dien",
      missingDetails: true,
    };
  }

  return {
    label: "Mục không còn tồn tại",
    typeLabel: "Dữ liệu này có thể đã bị xóa hoặc chưa đồng bộ.",
    href: "/tu-dien",
    missingDetails: true,
  };
}
