export type VocabularyCourseTopic = {
  name: string;
  slug: string;
  description: string;
  sortOrder: number;
};

export const vocabularyCourseTopics: VocabularyCourseTopic[] = [
  {
    name: "Chào hỏi",
    slug: "chao-hoi",
    description: "Các cách chào, hỏi thăm và mở đầu cuộc trò chuyện.",
    sortOrder: 1,
  },
  {
    name: "Gia đình",
    slug: "gia-dinh",
    description: "Từ vựng về thành viên và mối quan hệ trong gia đình.",
    sortOrder: 2,
  },
  {
    name: "Bạn bè",
    slug: "ban-be",
    description: "Cụm từ dùng khi giao tiếp với bạn bè và người quen.",
    sortOrder: 3,
  },
  {
    name: "Học tập",
    slug: "hoc-tap",
    description: "Từ và câu thường dùng trong lớp học, trường học.",
    sortOrder: 4,
  },
  {
    name: "Nghề nghiệp",
    slug: "nghe-nghiep",
    description: "Từ vựng về công việc, nghề nghiệp và nơi làm việc.",
    sortOrder: 5,
  },
  {
    name: "Cảm xúc",
    slug: "cam-xuc",
    description: "Cách biểu đạt cảm xúc, trạng thái và phản hồi cá nhân.",
    sortOrder: 6,
  },
  {
    name: "Ăn uống",
    slug: "an-uong",
    description: "Từ vựng về món ăn, đồ uống và tình huống ăn uống.",
    sortOrder: 7,
  },
  {
    name: "Di chuyển",
    slug: "di-chuyen",
    description: "Cụm từ về đi lại, phương tiện và chỉ dẫn di chuyển.",
    sortOrder: 8,
  },
  {
    name: "Hỏi đáp",
    slug: "hoi-dap",
    description: "Câu hỏi, câu trả lời và mẫu giao tiếp thường gặp.",
    sortOrder: 9,
  },
  {
    name: "Khẩn cấp",
    slug: "khan-cap",
    description: "Cụm từ cần thiết trong tình huống cần hỗ trợ nhanh.",
    sortOrder: 10,
  },
];
