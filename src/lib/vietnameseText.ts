export const vietnameseAlphabet = ["A", "B", "C", "D", "Đ", "E", "G", "H", "I", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "X", "Y"];

export function removeVietnameseTones(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

export function normalizeVietnameseText(text: string): string {
  return removeVietnameseTones(text).toLowerCase().trim().replace(/\s+/g, " ");
}

export function getVietnameseFirstLetter(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return "#";
  const first = trimmed[0];
  if (first === "Đ" || first === "đ") return "Đ";
  const normalized = removeVietnameseTones(first).toUpperCase();
  return vietnameseAlphabet.includes(normalized) ? normalized : "#";
}

export function getDictionaryLetterId(letter: string): string {
  const key = letter === "Đ" ? "dd" : removeVietnameseTones(letter).toLowerCase();
  return `dictionary-section-${key}`;
}

export function groupDictionaryByLetter<T extends { word: string }>(items: T[]) {
  return vietnameseAlphabet.map((letter) => ({
    letter,
    items: items.filter((item) => getVietnameseFirstLetter(item.word) === letter),
  }));
}
