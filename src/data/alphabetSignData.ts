export type AlphabetSignItem = {
  id: string;
  type: "letter" | "mark";
  label: string;
  letter: string;
  title: string;
  image: string;
  shortDescription: string;
  description: string;
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

const letters = [
  ["a", "A"],
  ["aw", "Ă"],
  ["aa", "Â"],
  ["b", "B"],
  ["c", "C"],
  ["d", "D"],
  ["dd", "Đ"],
  ["e", "E"],
  ["ee", "Ê"],
  ["g", "G"],
  ["h", "H"],
  ["i", "I"],
  ["k", "K"],
  ["l", "L"],
  ["m", "M"],
  ["n", "N"],
  ["o", "O"],
  ["oo", "Ô"],
  ["ow", "Ơ"],
  ["p", "P"],
  ["q", "Q"],
  ["r", "R"],
  ["s", "S"],
  ["t", "T"],
  ["u", "U"],
  ["uw", "Ư"],
  ["v", "V"],
  ["x", "X"],
  ["y", "Y"],
] as const;

const marks = [
  ["dau-sac", "dấu sắc"],
  ["dau-huyen", "dấu huyền"],
  ["dau-hoi", "dấu hỏi"],
  ["dau-nga", "dấu ngã"],
  ["dau-nang", "dấu nặng"],
] as const;

export const alphabetSignData: AlphabetSignItem[] = [
  ...letters.map(([id, label]) => ({
    id,
    type: "letter" as const,
    label,
    letter: label,
    title: `Ký hiệu chữ ${label}`,
    image: `/alphabet/${id}-placeholder.png`,
    shortDescription: `Chữ ${label} là ký hiệu nền tảng trong bảng chữ cái. Người học nên luyện nhận diện chữ trước khi chuyển sang phần ghép từ.`,
    description: `Chữ ${label} là ký hiệu nền tảng trong bảng chữ cái. Người học nên luyện nhận diện chữ trước khi chuyển sang phần ghép từ.`,
    instructions: baseInstructions,
    tips: baseTips,
  })),
  ...marks.map(([id, label]) => ({
    id,
    type: "mark" as const,
    label,
    letter: label,
    title: `Ký hiệu ${label}`,
    image: `/alphabet/${id}-placeholder.png`,
    shortDescription: `${label} là phần dấu thanh quan trọng khi học tiếng Việt. Trong MVP, mục này giúp người học ghi nhớ vai trò của dấu trước khi luyện ghép từ.`,
    description: `${label} là phần dấu thanh quan trọng khi học tiếng Việt. Trong MVP, mục này giúp người học ghi nhớ vai trò của dấu trước khi luyện ghép từ.`,
    instructions: [
      "Quan sát hình minh họa khi nhóm bổ sung dữ liệu.",
      "Nhận diện dấu trong từ trước khi luyện biểu đạt.",
      "Thực hiện chậm và rõ để tránh nhầm với dấu khác.",
      "Luyện cùng các từ ví dụ như mẹ, má, mà, mả, mã.",
    ],
    tips: baseTips,
  })),
];
