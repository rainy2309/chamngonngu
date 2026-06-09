export type VocabularyCourseDataItem = {
  id: string;
  word_key: string;
  word: string;
  normalized_word: string;
  first_letter: string;
  category: string;
  meaning: string;
  description: string;
  simple_explanation: string;
  example_sentence: string;
  sign_steps: string[];
  tips: string[];
  difficulty: "easy";
  region: "Toàn quốc";
  status: "published";
  source_name: "CHẠM Vocabulary";
  is_verified: false;
  video_url: null;
  gif_url: null;
  thumbnail_url: null;
};

const sourceRows: Array<{ category: string; words: Array<[string, string]> }> = [
  {
    category: "Chào hỏi",
    words: [
      ["Xin chào", "Dùng khi bắt đầu gặp gỡ hoặc mở đầu cuộc trò chuyện."],
      ["Chào buổi sáng", "Lời chào vào buổi sáng."],
      ["Chào buổi tối", "Lời chào vào buổi tối."],
      ["Tạm biệt", "Dùng khi kết thúc cuộc gặp."],
      ["Hẹn gặp lại", "Dùng khi muốn gặp lại người đối diện."],
      ["Bạn khỏe không?", "Câu hỏi thăm sức khỏe cơ bản."],
      ["Tôi khỏe", "Câu trả lời ngắn khi được hỏi thăm."],
      ["Rất vui gặp bạn", "Câu thể hiện sự thân thiện khi gặp người mới."],
    ],
  },
  {
    category: "Gia đình",
    words: [
      ["Gia đình", "Nhóm người thân trong một nhà hoặc có quan hệ ruột thịt."],
      ["Mẹ", "Người mẹ trong gia đình."],
      ["Ba", "Người cha trong gia đình."],
      ["Anh trai", "Anh là nam trong gia đình."],
      ["Chị gái", "Chị là nữ trong gia đình."],
      ["Em", "Người nhỏ tuổi hơn trong gia đình."],
      ["Ông", "Người ông trong gia đình."],
      ["Bà", "Người bà trong gia đình."],
    ],
  },
  {
    category: "Bạn bè",
    words: [
      ["Bạn", "Người quen thân hoặc người cùng giao tiếp."],
      ["Bạn thân", "Người bạn rất gần gũi."],
      ["Làm quen", "Bắt đầu biết và trò chuyện với một người."],
      ["Giúp đỡ", "Hỗ trợ người khác khi cần."],
      ["Chia sẻ", "Nói hoặc đưa thông tin, cảm xúc cho người khác."],
      ["Cùng nhau", "Làm việc hoặc tham gia với nhau."],
      ["Tin tưởng", "Cảm giác yên tâm về một người."],
      ["Cảm ơn bạn", "Lời cảm ơn gửi đến bạn bè hoặc người đối diện."],
    ],
  },
  {
    category: "Học tập",
    words: [
      ["Học", "Hoạt động tiếp nhận kiến thức hoặc kỹ năng."],
      ["Trường học", "Nơi học sinh, sinh viên đến học."],
      ["Lớp học", "Không gian hoặc nhóm học tập."],
      ["Giáo viên", "Người hướng dẫn, giảng dạy."],
      ["Học sinh", "Người đang học ở trường."],
      ["Sách", "Tài liệu dùng để đọc và học."],
      ["Bài tập", "Nhiệm vụ học tập cần hoàn thành."],
      ["Kiểm tra", "Hoạt động đánh giá kiến thức."],
      ["Tôi không hiểu", "Câu dùng khi cần giải thích lại."],
    ],
  },
  {
    category: "Nghề nghiệp",
    words: [
      ["Công việc", "Việc làm hoặc nhiệm vụ thường ngày."],
      ["Bác sĩ", "Người khám và chữa bệnh."],
      ["Y tá", "Người hỗ trợ chăm sóc bệnh nhân."],
      ["Giáo viên", "Người dạy học."],
      ["Kỹ sư", "Người làm việc trong lĩnh vực kỹ thuật."],
      ["Nhân viên", "Người làm việc trong một cơ quan hoặc tổ chức."],
      ["Cảnh sát", "Người giữ gìn an ninh trật tự."],
      ["Nông dân", "Người làm nông nghiệp."],
    ],
  },
  {
    category: "Cảm xúc",
    words: [
      ["Vui", "Cảm giác tích cực, thoải mái."],
      ["Buồn", "Cảm giác không vui."],
      ["Tức giận", "Cảm xúc mạnh khi không hài lòng."],
      ["Lo lắng", "Cảm giác băn khoăn, chưa yên tâm."],
      ["Sợ", "Cảm giác e ngại hoặc không an toàn."],
      ["Yêu thương", "Tình cảm quan tâm và quý mến."],
      ["Mệt", "Trạng thái thiếu năng lượng."],
      ["Bình tĩnh", "Trạng thái ổn định, không hoảng."],
    ],
  },
  {
    category: "Ăn uống",
    words: [
      ["Ăn", "Hoạt động dùng thức ăn."],
      ["Uống", "Hoạt động dùng nước hoặc đồ uống."],
      ["Cơm", "Món ăn chính quen thuộc."],
      ["Nước", "Đồ uống cơ bản."],
      ["Trà", "Đồ uống pha từ lá trà."],
      ["Cà phê", "Đồ uống phổ biến từ hạt cà phê."],
      ["Tôi đói", "Câu nói khi cần ăn."],
      ["Tôi khát", "Câu nói khi cần uống."],
      ["Ngon", "Nhận xét tích cực về món ăn."],
    ],
  },
  {
    category: "Di chuyển",
    words: [
      ["Đi", "Di chuyển từ nơi này sang nơi khác."],
      ["Đến", "Tới một địa điểm."],
      ["Rẽ trái", "Chỉ hướng đi sang trái."],
      ["Rẽ phải", "Chỉ hướng đi sang phải."],
      ["Đi thẳng", "Tiếp tục đi theo hướng trước mặt."],
      ["Xe buýt", "Phương tiện giao thông công cộng."],
      ["Taxi", "Phương tiện chở khách theo yêu cầu."],
      ["Ở đâu?", "Câu hỏi về vị trí."],
    ],
  },
  {
    category: "Hỏi đáp",
    words: [
      ["Ai?", "Câu hỏi về người."],
      ["Cái gì?", "Câu hỏi về sự vật hoặc nội dung."],
      ["Ở đâu?", "Câu hỏi về địa điểm."],
      ["Khi nào?", "Câu hỏi về thời gian."],
      ["Tại sao?", "Câu hỏi về lý do."],
      ["Như thế nào?", "Câu hỏi về cách thức."],
      ["Có", "Câu trả lời khẳng định."],
      ["Không", "Câu trả lời phủ định."],
    ],
  },
  {
    category: "Khẩn cấp",
    words: [
      ["Cứu tôi", "Câu dùng khi cần hỗ trợ khẩn cấp."],
      ["Gọi cấp cứu", "Yêu cầu liên hệ dịch vụ cấp cứu."],
      ["Tôi bị đau", "Câu nói khi có cảm giác đau."],
      ["Tôi bị lạc", "Câu nói khi không biết đường hoặc vị trí."],
      ["Nguy hiểm", "Cảnh báo tình huống không an toàn."],
      ["Cháy", "Cảnh báo có lửa hoặc hỏa hoạn."],
      ["Bệnh viện", "Nơi khám chữa bệnh."],
      ["Công an", "Cơ quan hỗ trợ an ninh."],
      ["Xin giúp đỡ", "Câu yêu cầu hỗ trợ."],
    ],
  },
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

function firstLetter(value: string) {
  return removeVietnameseTones(value).trim().charAt(0).toUpperCase() || "K";
}

export const vocabularyCourseData: VocabularyCourseDataItem[] = sourceRows.flatMap((group) =>
  group.words.map(([word, note], index) => {
    const topicSlug = slugify(group.category);
    const wordSlug = slugify(word);
    const wordKey = `${topicSlug}-${index + 1}-${wordSlug}`;

    return {
      id: wordKey,
      word_key: wordKey,
      word,
      normalized_word: normalizeText(word),
      first_letter: firstLetter(word),
      category: group.category,
      meaning: `Thuộc chủ đề ${group.category}, dùng trong giao tiếp ngôn ngữ ký hiệu.`,
      description: note,
      simple_explanation: note || `Từ/cụm từ thường dùng trong chủ đề ${group.category}.`,
      example_sentence: `Em học ký hiệu cho cụm từ: ${word}.`,
      sign_steps: [
        "Quan sát minh họa ký hiệu khi nhóm bổ sung dữ liệu.",
        "Giữ tay trong khung nhìn rõ.",
        "Thực hiện chậm và lặp lại 3-5 lần.",
      ],
      tips: ["Nội dung minh họa trong bản demo cần được xác minh bởi nguồn chuyên môn."],
      difficulty: "easy",
      region: "Toàn quốc",
      status: "published",
      source_name: "CHẠM Vocabulary",
      is_verified: false,
      video_url: null,
      gif_url: null,
      thumbnail_url: null,
    };
  }),
);
