import type { Lesson, VocabularyItem } from "@/types/vocabulary";

export const signDataNote = "Dữ liệu ký hiệu minh họa trong bản demo cần được xác minh bởi nguồn chuyên môn.";

export const categories = [
  "Chào hỏi",
  "Gia đình",
  "Trường học",
  "Cảm xúc",
  "Hành động",
  "Thời gian",
  "Sức khỏe",
  "Đồ vật",
];

function signPlaceholder(word: string) {
  return `Minh họa ký hiệu cho từ "${word}". ${signDataNote}`;
}

export const vocabularyData: VocabularyItem[] = [
  { id: "xin-chao", word: "Xin chào", meaning: "Lời mở đầu thân thiện khi gặp ai đó.", category: "Chào hỏi", exampleSentence: "Em mỉm cười và nói xin chào với bạn mới.", imageDescription: "Bàn tay vẫy nhẹ trong vòng tròn xanh.", signVideoPlaceholder: signPlaceholder("Xin chào"), difficulty: "easy", relatedWords: ["Chào", "Tạm biệt", "Bạn"] },
  { id: "tam-biet", word: "Tạm biệt", meaning: "Lời chào khi rời đi hoặc kết thúc cuộc trò chuyện.", category: "Chào hỏi", exampleSentence: "Cuối buổi học, cả lớp tạm biệt cô giáo.", imageDescription: "Bàn tay vẫy ra xa.", signVideoPlaceholder: signPlaceholder("Tạm biệt"), difficulty: "easy", relatedWords: ["Xin chào", "Hẹn gặp lại", "Chào"] },
  { id: "cam-on", word: "Cảm ơn", meaning: "Cách thể hiện sự biết ơn.", category: "Chào hỏi", exampleSentence: "Em cảm ơn bạn vì đã giúp đỡ.", imageDescription: "Trái tim nhỏ cạnh hai bàn tay.", signVideoPlaceholder: signPlaceholder("Cảm ơn"), difficulty: "easy", relatedWords: ["Xin lỗi", "Giúp", "Lịch sự"] },
  { id: "xin-loi", word: "Xin lỗi", meaning: "Lời nói khi mình làm phiền hoặc mắc lỗi.", category: "Chào hỏi", exampleSentence: "Em xin lỗi vì đến lớp muộn.", imageDescription: "Người cúi nhẹ với biểu cảm chân thành.", signVideoPlaceholder: signPlaceholder("Xin lỗi"), difficulty: "easy", relatedWords: ["Cảm ơn", "Không sao", "Lịch sự"] },
  { id: "hen-gap-lai", word: "Hẹn gặp lại", meaning: "Lời nói mong gặp lại vào lần sau.", category: "Chào hỏi", exampleSentence: "Chúng ta hẹn gặp lại vào ngày mai.", imageDescription: "Lịch nhỏ và bàn tay vẫy.", signVideoPlaceholder: signPlaceholder("Hẹn gặp lại"), difficulty: "medium", relatedWords: ["Tạm biệt", "Ngày mai", "Bạn"] },
  { id: "ban-khoe-khong", word: "Bạn khỏe không?", meaning: "Câu hỏi thăm sức khỏe đơn giản.", category: "Chào hỏi", exampleSentence: "Sáng nay em hỏi bạn: Bạn khỏe không?", imageDescription: "Bong bóng hội thoại có dấu hỏi.", signVideoPlaceholder: signPlaceholder("Bạn khỏe không?"), difficulty: "medium", relatedWords: ["Khỏe", "Bạn", "Chào"] },

  { id: "me", word: "Mẹ", meaning: "Người sinh ra hoặc chăm sóc mình như mẹ.", category: "Gia đình", exampleSentence: "Mẹ chuẩn bị bữa sáng cho gia đình.", imageDescription: "Người mẹ mỉm cười trong khung ảnh.", signVideoPlaceholder: signPlaceholder("Mẹ"), difficulty: "easy", relatedWords: ["Ba", "Con", "Gia đình"] },
  { id: "ba", word: "Ba", meaning: "Người cha trong gia đình.", category: "Gia đình", exampleSentence: "Ba đưa em đến trường.", imageDescription: "Người cha cầm cặp sách.", signVideoPlaceholder: signPlaceholder("Ba"), difficulty: "easy", relatedWords: ["Mẹ", "Con", "Gia đình"] },
  { id: "anh", word: "Anh", meaning: "Nam giới lớn tuổi hơn mình trong gia đình.", category: "Gia đình", exampleSentence: "Anh giúp em làm bài tập.", imageDescription: "Người anh cầm quyển sách.", signVideoPlaceholder: signPlaceholder("Anh"), difficulty: "easy", relatedWords: ["Chị", "Em", "Gia đình"] },
  { id: "chi", word: "Chị", meaning: "Nữ giới lớn tuổi hơn mình trong gia đình.", category: "Gia đình", exampleSentence: "Chị đọc truyện cho em nghe.", imageDescription: "Người chị ngồi cạnh em nhỏ.", signVideoPlaceholder: signPlaceholder("Chị"), difficulty: "easy", relatedWords: ["Anh", "Em", "Mẹ"] },
  { id: "em", word: "Em", meaning: "Người nhỏ tuổi hơn mình.", category: "Gia đình", exampleSentence: "Em thích vẽ tranh sau giờ học.", imageDescription: "Bạn nhỏ đang tô màu.", signVideoPlaceholder: signPlaceholder("Em"), difficulty: "easy", relatedWords: ["Anh", "Chị", "Con"] },
  { id: "gia-dinh", word: "Gia đình", meaning: "Những người thân yêu sống và quan tâm nhau.", category: "Gia đình", exampleSentence: "Gia đình em cùng ăn tối.", imageDescription: "Nhóm người đứng cạnh nhau trong ngôi nhà.", signVideoPlaceholder: signPlaceholder("Gia đình"), difficulty: "medium", relatedWords: ["Mẹ", "Ba", "Con"] },

  { id: "truong", word: "Trường học", meaning: "Nơi học sinh đến học tập.", category: "Trường học", exampleSentence: "Trường học có sân chơi rộng.", imageDescription: "Tòa nhà trường màu xanh trắng.", signVideoPlaceholder: signPlaceholder("Trường học"), difficulty: "easy", relatedWords: ["Lớp", "Cô giáo", "Học"] },
  { id: "lop", word: "Lớp", meaning: "Phòng hoặc nhóm học sinh học cùng nhau.", category: "Trường học", exampleSentence: "Lớp của em có nhiều bạn thân thiện.", imageDescription: "Phòng học sáng với bảng xanh.", signVideoPlaceholder: signPlaceholder("Lớp"), difficulty: "easy", relatedWords: ["Trường học", "Bảng", "Bạn"] },
  { id: "co-giao", word: "Cô giáo", meaning: "Người nữ dạy học.", category: "Trường học", exampleSentence: "Cô giáo hướng dẫn từ mới.", imageDescription: "Cô giáo đứng cạnh bảng.", signVideoPlaceholder: signPlaceholder("Cô giáo"), difficulty: "easy", relatedWords: ["Thầy giáo", "Bài học", "Lớp"] },
  { id: "thay-giao", word: "Thầy giáo", meaning: "Người nam dạy học.", category: "Trường học", exampleSentence: "Thầy giáo giải thích bài quiz.", imageDescription: "Thầy giáo cầm bút chỉ vào bảng.", signVideoPlaceholder: signPlaceholder("Thầy giáo"), difficulty: "easy", relatedWords: ["Cô giáo", "Học", "Bảng"] },
  { id: "sach", word: "Sách", meaning: "Tài liệu có chữ hoặc hình để đọc và học.", category: "Trường học", exampleSentence: "Em mở sách để xem hình minh họa.", imageDescription: "Quyển sách mở với biểu tượng bàn tay.", signVideoPlaceholder: signPlaceholder("Sách"), difficulty: "easy", relatedWords: ["Vở", "Đọc", "Bài học"] },
  { id: "but", word: "Bút", meaning: "Dụng cụ dùng để viết.", category: "Trường học", exampleSentence: "Em dùng bút ghi lại từ mới.", imageDescription: "Cây bút màu xanh cạnh cuốn vở.", signVideoPlaceholder: signPlaceholder("Bút"), difficulty: "easy", relatedWords: ["Vở", "Viết", "Bảng"] },

  { id: "vui", word: "Vui", meaning: "Cảm giác hạnh phúc và thoải mái.", category: "Cảm xúc", exampleSentence: "Em rất vui khi hiểu bài.", imageDescription: "Khuôn mặt cười với trái tim nhỏ.", signVideoPlaceholder: signPlaceholder("Vui"), difficulty: "easy", relatedWords: ["Buồn", "Yêu thương", "Cười"] },
  { id: "buon", word: "Buồn", meaning: "Cảm giác không vui hoặc thất vọng.", category: "Cảm xúc", exampleSentence: "Bạn ấy buồn vì chưa làm được bài.", imageDescription: "Khuôn mặt buồn trong vòng tròn nhạt.", signVideoPlaceholder: signPlaceholder("Buồn"), difficulty: "easy", relatedWords: ["Vui", "Lo lắng", "Cảm xúc"] },
  { id: "yeu-thuong", word: "Yêu thương", meaning: "Tình cảm quan tâm và trân trọng.", category: "Cảm xúc", exampleSentence: "Gia đình luôn yêu thương nhau.", imageDescription: "Hai bàn tay ôm trái tim xanh.", signVideoPlaceholder: signPlaceholder("Yêu thương"), difficulty: "medium", relatedWords: ["Gia đình", "Vui", "Quan tâm"] },
  { id: "lo-lang", word: "Lo lắng", meaning: "Cảm giác không yên tâm về điều gì đó.", category: "Cảm xúc", exampleSentence: "Em lo lắng trước bài kiểm tra.", imageDescription: "Dấu hỏi và khuôn mặt suy nghĩ.", signVideoPlaceholder: signPlaceholder("Lo lắng"), difficulty: "medium", relatedWords: ["Bình tĩnh", "Buồn", "Sợ"] },
  { id: "binh-tinh", word: "Bình tĩnh", meaning: "Giữ tâm trạng ổn định, không vội vàng.", category: "Cảm xúc", exampleSentence: "Hãy bình tĩnh đọc câu hỏi.", imageDescription: "Đường sóng nhẹ và hơi thở chậm.", signVideoPlaceholder: signPlaceholder("Bình tĩnh"), difficulty: "medium", relatedWords: ["Lo lắng", "Khỏe", "Tập trung"] },

  { id: "an", word: "Ăn", meaning: "Đưa thức ăn vào miệng.", category: "Hành động", exampleSentence: "Em ăn cơm cùng gia đình.", imageDescription: "Bát cơm và đôi đũa tối giản.", signVideoPlaceholder: signPlaceholder("Ăn"), difficulty: "easy", relatedWords: ["Uống", "Cơm", "Gia đình"] },
  { id: "uong", word: "Uống", meaning: "Đưa nước hoặc đồ uống vào miệng.", category: "Hành động", exampleSentence: "Em uống nước sau giờ học.", imageDescription: "Cốc nước trong với giọt nước.", signVideoPlaceholder: signPlaceholder("Uống"), difficulty: "easy", relatedWords: ["Ăn", "Nước", "Cốc"] },
  { id: "hoc", word: "Học", meaning: "Tiếp nhận kiến thức hoặc kỹ năng.", category: "Hành động", exampleSentence: "Em học ký hiệu mới mỗi ngày.", imageDescription: "Quyển sách và bàn tay mở.", signVideoPlaceholder: signPlaceholder("Học"), difficulty: "easy", relatedWords: ["Đọc", "Viết", "Bài học"] },
  { id: "doc", word: "Đọc", meaning: "Nhìn chữ và hiểu nội dung.", category: "Hành động", exampleSentence: "Em đọc ví dụ trước khi trả lời.", imageDescription: "Mắt nhìn vào trang sách.", signVideoPlaceholder: signPlaceholder("Đọc"), difficulty: "easy", relatedWords: ["Sách", "Học", "Viết"] },
  { id: "viet", word: "Viết", meaning: "Tạo chữ hoặc ký hiệu trên giấy hay màn hình.", category: "Hành động", exampleSentence: "Em viết từ mới vào vở.", imageDescription: "Bàn tay cầm bút xanh.", signVideoPlaceholder: signPlaceholder("Viết"), difficulty: "easy", relatedWords: ["Bút", "Đọc", "Học"] },
  { id: "di", word: "Đi", meaning: "Di chuyển từ nơi này đến nơi khác.", category: "Hành động", exampleSentence: "Em đi đến trường vào buổi sáng.", imageDescription: "Dấu chân trên đường cong xanh.", signVideoPlaceholder: signPlaceholder("Đi"), difficulty: "easy", relatedWords: ["Đứng", "Ngồi", "Trường học"] },

  { id: "hom-nay", word: "Hôm nay", meaning: "Ngày hiện tại.", category: "Thời gian", exampleSentence: "Hôm nay em học từ mới.", imageDescription: "Tờ lịch đánh dấu ngày hiện tại.", signVideoPlaceholder: signPlaceholder("Hôm nay"), difficulty: "easy", relatedWords: ["Ngày mai", "Hôm qua", "Sáng"] },
  { id: "ngay-mai", word: "Ngày mai", meaning: "Ngày sau hôm nay.", category: "Thời gian", exampleSentence: "Ngày mai em làm quiz.", imageDescription: "Tờ lịch lật sang ngày mới.", signVideoPlaceholder: signPlaceholder("Ngày mai"), difficulty: "medium", relatedWords: ["Hôm nay", "Hôm qua", "Tuần"] },
  { id: "sang", word: "Sáng", meaning: "Khoảng thời gian đầu ngày.", category: "Thời gian", exampleSentence: "Buổi sáng em đi học.", imageDescription: "Mặt trời mọc màu xanh nhạt.", signVideoPlaceholder: signPlaceholder("Sáng"), difficulty: "easy", relatedWords: ["Trưa", "Chiều", "Tối"] },
  { id: "trua", word: "Trưa", meaning: "Khoảng giữa ngày.", category: "Thời gian", exampleSentence: "Buổi trưa em ăn cơm.", imageDescription: "Mặt trời ở giữa bầu trời.", signVideoPlaceholder: signPlaceholder("Trưa"), difficulty: "easy", relatedWords: ["Sáng", "Chiều", "Ăn"] },
  { id: "toi", word: "Tối", meaning: "Khoảng thời gian cuối ngày khi trời tối.", category: "Thời gian", exampleSentence: "Buổi tối gia đình cùng trò chuyện.", imageDescription: "Mặt trăng và ngôi sao nhỏ.", signVideoPlaceholder: signPlaceholder("Tối"), difficulty: "easy", relatedWords: ["Sáng", "Chiều", "Gia đình"] },

  { id: "khoe", word: "Khỏe", meaning: "Cơ thể và tinh thần ở trạng thái tốt.", category: "Sức khỏe", exampleSentence: "Hôm nay em cảm thấy khỏe.", imageDescription: "Biểu tượng nhịp tim và nụ cười.", signVideoPlaceholder: signPlaceholder("Khỏe"), difficulty: "easy", relatedWords: ["Mệt", "Đau", "Bác sĩ"] },
  { id: "met", word: "Mệt", meaning: "Cơ thể thiếu năng lượng và cần nghỉ ngơi.", category: "Sức khỏe", exampleSentence: "Em mệt sau một ngày học dài.", imageDescription: "Người ngồi nghỉ cạnh cốc nước.", signVideoPlaceholder: signPlaceholder("Mệt"), difficulty: "easy", relatedWords: ["Khỏe", "Nghỉ", "Đau"] },
  { id: "dau", word: "Đau", meaning: "Cảm giác khó chịu ở một phần cơ thể.", category: "Sức khỏe", exampleSentence: "Em bị đau đầu nên cần nghỉ.", imageDescription: "Biểu tượng đầu và dấu chấm than.", signVideoPlaceholder: signPlaceholder("Đau"), difficulty: "easy", relatedWords: ["Mệt", "Bệnh", "Bác sĩ"] },
  { id: "bac-si", word: "Bác sĩ", meaning: "Người khám và điều trị bệnh.", category: "Sức khỏe", exampleSentence: "Bác sĩ hỏi em đau ở đâu.", imageDescription: "Ống nghe và dấu cộng y tế.", signVideoPlaceholder: signPlaceholder("Bác sĩ"), difficulty: "medium", relatedWords: ["Khỏe", "Đau", "Bệnh"] },

  { id: "ban", word: "Bàn", meaning: "Đồ vật có mặt phẳng để học hoặc làm việc.", category: "Đồ vật", exampleSentence: "Quyển sách nằm trên bàn.", imageDescription: "Bàn học gọn gàng màu trắng.", signVideoPlaceholder: signPlaceholder("Bàn"), difficulty: "easy", relatedWords: ["Ghế", "Sách", "Bút"] },
  { id: "ghe", word: "Ghế", meaning: "Đồ vật dùng để ngồi.", category: "Đồ vật", exampleSentence: "Em ngồi trên ghế trong lớp.", imageDescription: "Chiếc ghế đơn giản cạnh bàn.", signVideoPlaceholder: signPlaceholder("Ghế"), difficulty: "easy", relatedWords: ["Bàn", "Ngồi", "Lớp"] },
  { id: "dien-thoai", word: "Điện thoại", meaning: "Thiết bị dùng để liên lạc và xem thông tin.", category: "Đồ vật", exampleSentence: "Điện thoại hiển thị tin nhắn mới.", imageDescription: "Màn hình điện thoại có bong bóng chat.", signVideoPlaceholder: signPlaceholder("Điện thoại"), difficulty: "medium", relatedWords: ["Tin nhắn", "Giao tiếp", "Ứng dụng"] },
  { id: "may-tinh", word: "Máy tính", meaning: "Thiết bị dùng để học, làm việc và tra cứu.", category: "Đồ vật", exampleSentence: "Em học từ mới trên máy tính.", imageDescription: "Laptop mở trang học ký hiệu.", signVideoPlaceholder: signPlaceholder("Máy tính"), difficulty: "medium", relatedWords: ["Điện thoại", "Học", "Tìm kiếm"] },
];

export const lessons: Lesson[] = [
  { id: "chao-hoi-co-ban", topic: "Ký hiệu chào hỏi cơ bản", description: "Bắt đầu bằng các cách chào, cảm ơn và xin lỗi lịch sự.", difficulty: "easy", wordIds: ["xin-chao", "tam-biet", "cam-on", "xin-loi", "hen-gap-lai", "ban-khoe-khong"] },
  { id: "tu-vung-gia-dinh", topic: "Từ vựng gia đình", description: "Nhận biết người thân và các mối quan hệ gần gũi.", difficulty: "easy", wordIds: ["me", "ba", "anh", "chi", "em", "gia-dinh"] },
  { id: "cam-xuc-hang-ngay", topic: "Cảm xúc hằng ngày", description: "Diễn đạt cảm xúc rõ ràng qua từ, hình ảnh và ví dụ.", difficulty: "medium", wordIds: ["vui", "buon", "yeu-thuong", "lo-lang", "binh-tinh"] },
  { id: "hanh-dong-thuong-gap", topic: "Hành động thường gặp", description: "Các động từ gần gũi trong sinh hoạt và học tập.", difficulty: "easy", wordIds: ["an", "uong", "hoc", "doc", "viet", "di"] },
  { id: "thoi-gian-lich-trinh", topic: "Thời gian và lịch trình", description: "Nói về hôm nay, ngày mai và các thời điểm trong ngày.", difficulty: "medium", wordIds: ["hom-nay", "ngay-mai", "sang", "trua", "toi"] },
];
