import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";
import * as XLSX from "xlsx";

type Topic = {
  name: string;
  slug: string;
  description: string;
  sortOrder: number;
};

type DictionaryWordSeed = {
  word_key: string;
  word: string;
  normalized_word: string;
  first_letter: string;
  meaning: string;
  simple_explanation: string;
  category: string;
  region: string;
  difficulty: "easy";
  example_sentence: string;
  description: string;
  sign_steps: string[];
  gif_url: null;
  video_url: null;
  thumbnail_url: null;
  source_name: string;
  source_url: null;
  related_words: string[];
  is_verified: boolean;
  status: "published";
  updated_at: string;
};

const workbookPath = path.resolve(process.cwd(), "data", "Bo_tu_vung_Ngon_ngu_Ky_hieu_Chuyen_nghiep.xlsx");

const topics: Topic[] = [
  { name: "Chào hỏi", slug: "chao-hoi", description: "Các cách chào, hỏi thăm và mở đầu cuộc trò chuyện.", sortOrder: 1 },
  { name: "Gia đình", slug: "gia-dinh", description: "Từ vựng về thành viên và mối quan hệ trong gia đình.", sortOrder: 2 },
  { name: "Bạn bè", slug: "ban-be", description: "Cụm từ dùng khi giao tiếp với bạn bè và người quen.", sortOrder: 3 },
  { name: "Học tập", slug: "hoc-tap", description: "Từ và câu thường dùng trong lớp học, trường học.", sortOrder: 4 },
  { name: "Nghề nghiệp", slug: "nghe-nghiep", description: "Từ vựng về công việc, nghề nghiệp và nơi làm việc.", sortOrder: 5 },
  { name: "Cảm xúc", slug: "cam-xuc", description: "Cách biểu đạt cảm xúc, trạng thái và phản hồi cá nhân.", sortOrder: 6 },
  { name: "Ăn uống", slug: "an-uong", description: "Từ vựng về món ăn, đồ uống và tình huống ăn uống.", sortOrder: 7 },
  { name: "Di chuyển", slug: "di-chuyen", description: "Cụm từ về đi lại, phương tiện và chỉ dẫn di chuyển.", sortOrder: 8 },
  { name: "Hỏi đáp", slug: "hoi-dap", description: "Câu hỏi, câu trả lời và mẫu giao tiếp thường gặp.", sortOrder: 9 },
  { name: "Khẩn cấp", slug: "khan-cap", description: "Cụm từ cần thiết trong tình huống cần hỗ trợ nhanh.", sortOrder: 10 },
];

function removeVietnameseTones(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

function normalizeText(value: string) {
  return removeVietnameseTones(value).toLowerCase().trim().replace(/\s+/g, " ");
}

function slugify(value: string) {
  return normalizeText(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getFirstLetter(value: string) {
  const normalized = removeVietnameseTones(value).trim().charAt(0).toUpperCase();
  return normalized || "K";
}

function getCell(row: Record<string, unknown>, candidates: string[]) {
  const entries = Object.entries(row);
  for (const candidate of candidates) {
    const normalizedCandidate = normalizeText(candidate);
    const match = entries.find(([key]) => normalizeText(key) === normalizedCandidate);
    if (match && match[1] != null) return String(match[1]).trim();
  }
  return "";
}

function isSummarySheet(sheetName: string) {
  const normalized = normalizeText(sheetName);
  return normalized.includes("tong quan") || normalized.includes("summary");
}

function isDictionaryWordSeed(row: DictionaryWordSeed | null): row is DictionaryWordSeed {
  return row !== null;
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Thiếu biến môi trường Supabase. Cần NEXT_PUBLIC_SUPABASE_URL và NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY hoặc NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }

  if (!fs.existsSync(workbookPath)) {
    throw new Error(`Không tìm thấy file Excel: ${workbookPath}`);
  }

  const workbook = XLSX.readFile(workbookPath, { cellDates: false });
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { error: categoryError } = await supabase.from("categories").upsert(
    topics.map((topic) => ({
      name: topic.name,
      slug: topic.slug,
      description: topic.description,
      sort_order: topic.sortOrder,
      is_active: true,
      updated_at: new Date().toISOString(),
    })),
    { onConflict: "slug" },
  );

  if (categoryError) {
    console.warn("Không thể upsert categories. Tiếp tục import từ vựng:", categoryError.message);
  }

  const rows = workbook.SheetNames.filter((sheetName) => !isSummarySheet(sheetName)).flatMap((sheetName) => {
    const worksheet = workbook.Sheets[sheetName];
    const category = topics.find((topic) => normalizeText(topic.name) === normalizeText(sheetName))?.name ?? sheetName;
    const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: "" });

    return rawRows
      .map((row) => {
        const word = getCell(row, ["Cụm từ / Câu giao tiếp", "Cụm từ", "Câu giao tiếp", "Từ vựng", "Từ/cụm từ"]);
        if (!word || normalizeText(word) === "cum tu / cau giao tiep") return null;

        const note = getCell(row, ["Ghi chú", "Ghi chu", "Mô tả", "Mo ta"]);
        const topicSlug = topics.find((topic) => topic.name === category)?.slug ?? slugify(category);
        const wordKey = `${topicSlug}-${slugify(word)}`;

        const seedRow: DictionaryWordSeed = {
          word_key: wordKey,
          word,
          normalized_word: normalizeText(word),
          first_letter: getFirstLetter(word),
          meaning: `Thuộc chủ đề ${category}, dùng trong giao tiếp ngôn ngữ ký hiệu.`,
          simple_explanation: note || `Từ/cụm từ thường dùng trong chủ đề ${category}.`,
          category,
          region: "Toàn quốc",
          difficulty: "easy",
          example_sentence: `Em học ký hiệu cho cụm từ: ${word}.`,
          description: note || `Từ/cụm từ thường dùng trong chủ đề ${category}.`,
          sign_steps: [
            "Quan sát minh họa ký hiệu khi nhóm bổ sung dữ liệu.",
            "Giữ tay trong khung nhìn rõ.",
            "Thực hiện chậm và lặp lại 3-5 lần.",
          ],
          gif_url: null,
          video_url: null,
          thumbnail_url: null,
          source_name: "CHẠM Vocabulary",
          source_url: null,
          related_words: [],
          is_verified: false,
          status: "published",
          updated_at: new Date().toISOString(),
        };

        return seedRow;
      })
      .filter(isDictionaryWordSeed);
  });

  const uniqueRows = Array.from(new Map(rows.map((row) => [row.word_key, row])).values());

  if (uniqueRows.length === 0) {
    throw new Error("Không đọc được dòng từ vựng nào từ Excel.");
  }

  const { error } = await supabase.from("dictionary_words").upsert(uniqueRows, { onConflict: "word_key" });
  if (error) throw error;

  console.log(`Đã import ${uniqueRows.length} mục từ vựng từ ${workbook.SheetNames.length} sheet.`);
  if (uniqueRows.length !== 83) {
    console.warn(`Số lượng đọc được là ${uniqueRows.length}, khác số lượng kỳ vọng 83. Hãy kiểm tra lại file Excel.`);
  }
}

main().catch((error) => {
  console.error("Import vocabulary error:", error);
  process.exit(1);
});
