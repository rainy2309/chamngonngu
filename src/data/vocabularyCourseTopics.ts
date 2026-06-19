import { normalizeVietnameseText } from "@/lib/vietnameseText";

export type VocabularyCourseTopic = {
  name: string;
  slug: string;
  description: string;
  sortOrder: number;
};

export const vocabularyCourseTopics: VocabularyCourseTopic[] = [
  {
    name: "Chào hỏi, tạm biệt",
    slug: "chao-hoi-tam-biet",
    description: "Các cách chào, tạm biệt và mở đầu cuộc trò chuyện.",
    sortOrder: 1,
  },
  {
    name: "Số đếm",
    slug: "so-dem",
    description: "Từ vựng về số lượng, thứ tự và cách đếm cơ bản.",
    sortOrder: 2,
  },
  {
    name: "Gia đình",
    slug: "gia-dinh",
    description: "Từ vựng về thành viên và mối quan hệ trong gia đình.",
    sortOrder: 3,
  },
  {
    name: "Bộ phận cơ thể",
    slug: "bo-phan-co-the",
    description: "Tên các bộ phận cơ thể thường dùng trong giao tiếp.",
    sortOrder: 4,
  },
  {
    name: "Giáo dục",
    slug: "giao-duc",
    description: "Từ vựng trong lớp học, trường học và hoạt động học tập.",
    sortOrder: 5,
  },
  {
    name: "Động vật",
    slug: "dong-vat",
    description: "Tên các loài động vật quen thuộc.",
    sortOrder: 6,
  },
  {
    name: "Thời tiết",
    slug: "thoi-tiet",
    description: "Từ vựng về thời tiết và hiện tượng tự nhiên.",
    sortOrder: 7,
  },
  {
    name: "Bệnh",
    slug: "benh",
    description: "Từ vựng về bệnh, triệu chứng và sức khỏe cơ bản.",
    sortOrder: 8,
  },
  {
    name: "Cảm xúc",
    slug: "cam-xuc",
    description: "Cách biểu đạt cảm xúc, trạng thái và phản hồi cá nhân.",
    sortOrder: 9,
  },
  {
    name: "Thời gian",
    slug: "thoi-gian",
    description: "Từ vựng về ngày, giờ, lịch trình và mốc thời gian.",
    sortOrder: 10,
  },
  {
    name: "Hoạt động hằng ngày",
    slug: "hoat-dong-hang-ngay",
    description: "Các hoạt động quen thuộc trong sinh hoạt hằng ngày.",
    sortOrder: 11,
  },
  {
    name: "Màu sắc",
    slug: "mau-sac",
    description: "Tên các màu sắc thường gặp.",
    sortOrder: 12,
  },
  {
    name: "Trái cây",
    slug: "trai-cay",
    description: "Tên các loại trái cây phổ biến.",
    sortOrder: 13,
  },
  {
    name: "Nơi chốn",
    slug: "noi-chon",
    description: "Từ vựng về địa điểm và nơi chốn quen thuộc.",
    sortOrder: 14,
  },
];

const topicByName = new Map(vocabularyCourseTopics.map((topic) => [normalizeVietnameseText(topic.name), topic.name]));

const topicAliases: Record<string, string> = {
  "video so dem": "Số đếm",
  "so dem": "Số đếm",
  "video gia dinh nnkh": "Gia đình",
  "gia dinh": "Gia đình",
  "video bo phan co the": "Bộ phận cơ thể",
  "bo phan co the": "Bộ phận cơ thể",
  "video chu de giao duc": "Giáo dục",
  "giao duc": "Giáo dục",
  "hoc tap": "Giáo dục",
  "truong hoc": "Giáo dục",
  "xin chao tam biet": "Chào hỏi, tạm biệt",
  "xin chao, tam biet": "Chào hỏi, tạm biệt",
  "chao hoi": "Chào hỏi, tạm biệt",
  "video chu de ho hang": "Gia đình",
  "ho hang": "Gia đình",
  "video dong vat nnkh": "Động vật",
  "dong vat": "Động vật",
  "video chu de thoi tiet": "Thời tiết",
  "thoi tiet": "Thời tiết",
  "video cac loai benh": "Bệnh",
  "benh": "Bệnh",
  "suc khoe": "Bệnh",
  "khan cap": "Bệnh",
  "benh vien": "Bệnh",
  "video chu de cam xuc": "Cảm xúc",
  "cam xuc": "Cảm xúc",
  "video chu de thoi gian": "Thời gian",
  "thoi gian": "Thời gian",
  "video hoat dong hang ngay nnkh": "Hoạt động hằng ngày",
  "hoat dong hang ngay": "Hoạt động hằng ngày",
  "an uong": "Hoạt động hằng ngày",
  "hanh dong": "Hoạt động hằng ngày",
  "nghe nghiep": "Hoạt động hằng ngày",
  "video mau sac nnkh": "Màu sắc",
  "mau sac": "Màu sắc",
  "video chu de trai cay": "Trái cây",
  "trai cay": "Trái cây",
  "video noi chon nnkh": "Nơi chốn",
  "noi chon": "Nơi chốn",
  "di chuyen": "Nơi chốn",
  "hoi duong": "Nơi chốn",
  "hoi dap": "Chào hỏi, tạm biệt",
  "ban be": "Chào hỏi, tạm biệt",
};

export function normalizeVocabularyTopic(category?: string | null) {
  const rawCategory = String(category ?? "").trim();
  if (!rawCategory) return "Hoạt động hằng ngày";

  const normalized = normalizeVietnameseText(rawCategory)
    .replace(/[,/]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return topicByName.get(normalized) ?? topicAliases[normalized] ?? rawCategory;
}

export function getVocabularyTopicSortOrder(category?: string | null) {
  const topicName = normalizeVocabularyTopic(category);
  return vocabularyCourseTopics.find((topic) => topic.name === topicName)?.sortOrder ?? 999;
}
