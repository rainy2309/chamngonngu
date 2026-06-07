export type AlphabetItemType = "letter" | "vowel_modifier" | "tone_mark";

export type AlphabetSignItem = {
  id: string;
  letter_key: string;
  type: AlphabetItemType;
  label: string;
  display_label: string;
  letter: string;
  title: string;
  image: string;
  shortDescription: string;
  description: string;
  explanation: string;
  display_order: number;
  status: "published" | "draft" | "archived";
  instructions: string[];
  tips: string[];
};

const baseInstructions = [
  "Quan sát hình minh họa khi nhóm bổ sung dữ liệu.",
  "Giữ bàn tay trong khung nhìn rõ ràng.",
  "Thực hiện chậm để người đối diện dễ quan sát.",
  "Lặp lại ký hiệu 3-5 lần để ghi nhớ.",
];

const baseTips = [
  "Không thực hiện quá nhanh khi mới học.",
  "Đảm bảo ánh sáng đủ rõ khi xem ký hiệu.",
  "Ký hiệu minh họa trong bản demo cần được xác minh bởi nguồn chuyên môn.",
];

const baseLetters = [
  ["a", "A"],
  ["b", "B"],
  ["c", "C"],
  ["d", "D"],
  ["dd", "Đ"],
  ["e", "E"],
  ["g", "G"],
  ["h", "H"],
  ["i", "I"],
  ["k", "K"],
  ["l", "L"],
  ["m", "M"],
  ["n", "N"],
  ["o", "O"],
  ["p", "P"],
  ["q", "Q"],
  ["r", "R"],
  ["s", "S"],
  ["t", "T"],
  ["u", "U"],
  ["v", "V"],
  ["x", "X"],
  ["y", "Y"],
] as const;

const vowelModifierGroups = [
  {
    id: "circumflex_group",
    label: "â / ê / ô",
    title: "Ký hiệu nhóm â / ê / ô",
    description: "Nhóm nguyên âm dùng dấu mũ.",
    explanation: "â = a + ^, ê = e + ^, ô = o + ^",
  },
  {
    id: "breve_group",
    label: "ă",
    title: "Ký hiệu chữ ă",
    description: "Chữ ă được biểu đạt bằng chữ a kết hợp dấu breve.",
    explanation: "ă = a + ˘",
  },
  {
    id: "horn_group",
    label: "ư / ơ",
    title: "Ký hiệu nhóm ư / ơ",
    description: "Nhóm nguyên âm dùng dấu móc.",
    explanation: "ư = u + ˇ, ơ = o + ˇ",
  },
] as const;

const toneMarks = [
  ["sac", "dấu sắc"],
  ["huyen", "dấu huyền"],
  ["hoi", "dấu hỏi"],
  ["nga", "dấu ngã"],
  ["nang", "dấu nặng"],
] as const;

export const alphabetSignData: AlphabetSignItem[] = [
  ...baseLetters.map(([id, label], index) => ({
    id,
    letter_key: id,
    type: "letter" as const,
    label,
    display_label: label,
    letter: label,
    title: `Ký hiệu chữ ${label}`,
    image: `/alphabet/${id}-placeholder.png`,
    shortDescription: `Chữ ${label} là ký hiệu cơ bản trong bảng chữ cái. Người học nên luyện nhận diện chữ trước khi chuyển sang phần ghép từ.`,
    description: `Chữ ${label} là ký hiệu cơ bản trong bảng chữ cái. Người học nên luyện nhận diện chữ trước khi chuyển sang phần ghép từ.`,
    explanation: "Chữ cái cơ bản trong bảng ký hiệu.",
    display_order: index + 1,
    status: "published" as const,
    instructions: baseInstructions,
    tips: baseTips,
  })),
  ...vowelModifierGroups.map((item, index) => ({
    id: item.id,
    letter_key: item.id,
    type: "vowel_modifier" as const,
    label: item.label,
    display_label: item.label,
    letter: item.label,
    title: item.title,
    image: `/alphabet/${item.id}-placeholder.png`,
    shortDescription: item.description,
    description: item.description,
    explanation: item.explanation,
    display_order: 24 + index,
    status: "published" as const,
    instructions: [
      "Quan sát ô quy tắc nguyên âm trong bảng minh họa.",
      "Nhận diện nguyên âm cơ bản trước, sau đó thêm dấu phụ tương ứng.",
      "Luyện chậm từng bước để tránh nhầm với chữ cơ bản.",
      "Đối chiếu lại với nguồn chuyên môn khi nhóm bổ sung dữ liệu chính thức.",
    ],
    tips: baseTips,
  })),
  ...toneMarks.map(([id, label], index) => ({
    id,
    letter_key: id,
    type: "tone_mark" as const,
    label,
    display_label: label,
    letter: label,
    title: `Ký hiệu ${label}`,
    image: `/alphabet/${id}-placeholder.png`,
    shortDescription: `${label} là một dấu thanh trong tiếng Việt. Mục này giúp người học nhận diện dấu trước khi luyện ghép từ.`,
    description: `${label} là một dấu thanh trong tiếng Việt. Mục này giúp người học nhận diện dấu trước khi luyện ghép từ.`,
    explanation: "Dấu thanh được dùng để phân biệt cách đọc và ý nghĩa của từ tiếng Việt.",
    display_order: 27 + index,
    status: "published" as const,
    instructions: [
      "Quan sát hình minh họa khi nhóm bổ sung dữ liệu.",
      "Nhận diện dấu trong từ trước khi luyện biểu đạt.",
      "Thực hiện chậm và rõ để tránh nhầm với dấu khác.",
      "Luyện cùng các từ ví dụ như má, mà, mả, mã, mạ.",
    ],
    tips: baseTips,
  })),
];
