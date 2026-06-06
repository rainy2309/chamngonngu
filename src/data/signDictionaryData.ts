import { getVietnameseFirstLetter, normalizeVietnameseText } from "@/lib/vietnameseText";

export type SignDifficulty = "easy" | "medium" | "hard";
export type SignRegion = "HN" | "HP" | "HCM" | "Toàn quốc" | "Chưa xác định";

export type SignDictionaryItem = {
  id: string;
  word: string;
  normalizedWord: string;
  firstLetter: string;
  meaning: string;
  simpleExplanation?: string;
  category: string;
  region: SignRegion;
  difficulty: SignDifficulty;
  exampleSentence: string;
  description: string;
  signSteps: string[];
  gifUrl?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  sourceName?: string;
  sourceUrl?: string;
  relatedWords: string[];
};

export const signCategories = [
  "Chào hỏi",
  "Gia đình",
  "Trường học",
  "Số đếm",
  "Cảm xúc",
  "Hành động",
  "Thời gian",
  "Sức khỏe",
  "Mua sắm",
  "Hỏi đường",
  "Bệnh viện",
  "Đồ vật",
  "Giao tiếp cơ bản",
];

export const signRegions: SignRegion[] = ["Toàn quốc", "HN", "HP", "HCM", "Chưa xác định"];

const demoSource = {
  sourceName: "Dữ liệu minh họa CHẠM",
  sourceUrl: "https://ssg105-project.vercel.app/",
};

function makeSign(
  word: string,
  category: string,
  meaning: string,
  exampleSentence: string,
  relatedWords: string[],
  region: SignRegion = "Toàn quốc",
  difficulty: SignDifficulty = "easy",
  simpleExplanation?: string,
): SignDictionaryItem {
  const normalizedWord = normalizeVietnameseText(word);
  return {
    id: normalizedWord.replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    word,
    normalizedWord,
    firstLetter: getVietnameseFirstLetter(word),
    meaning,
    simpleExplanation,
    category,
    region,
    difficulty,
    exampleSentence,
    description: `Mục từ minh họa cho "${word}" trong ngữ cảnh học ký hiệu cơ bản.`,
    signSteps: [
      "Quan sát từ và nghĩa trước khi xem phần minh họa.",
      "Đặt tay trong vùng nhìn rõ, giữ nhịp chậm và tự nhiên.",
      "Lặp lại cùng câu ví dụ để ghi nhớ ngữ cảnh sử dụng.",
    ],
    ...demoSource,
    relatedWords,
  };
}

export const signDictionaryData: SignDictionaryItem[] = [
  makeSign("Ăn", "Hành động", "Đưa thức ăn vào miệng.", "Em ăn cơm cùng gia đình.", ["Uống", "Cơm", "Bữa ăn"]),
  makeSign("Áo", "Đồ vật", "Trang phục mặc ở phần thân trên.", "Chiếc áo màu xanh rất sạch.", ["Quần", "Mặc", "Túi"], "HN"),
  makeSign("Anh", "Gia đình", "Nam giới lớn tuổi hơn mình.", "Anh giúp em học bài.", ["Chị", "Em", "Gia đình"]),
  makeSign("Ba", "Gia đình", "Người cha trong gia đình.", "Ba đưa em đến trường.", ["Mẹ", "Con", "Gia đình"]),
  makeSign("Bà", "Gia đình", "Người phụ nữ thuộc thế hệ ông bà.", "Bà kể chuyện cho em nghe.", ["Ông", "Mẹ", "Gia đình"], "HP"),
  makeSign("Bạn", "Giao tiếp cơ bản", "Người cùng học, chơi hoặc trò chuyện.", "Bạn cùng lớp rất thân thiện.", ["Xin chào", "Giúp", "Cảm ơn"]),
  makeSign("Bàn", "Đồ vật", "Đồ vật có mặt phẳng để học hoặc làm việc.", "Sách nằm trên bàn.", ["Ghế", "Sách", "Bút"]),
  makeSign("Bệnh", "Sức khỏe", "Tình trạng cơ thể không khỏe.", "Khi bị bệnh, em cần nghỉ ngơi.", ["Bác sĩ", "Đau", "Khỏe"], "Toàn quốc", "medium"),
  makeSign("Bệnh viện", "Bệnh viện", "Nơi khám và điều trị bệnh.", "Bệnh viện có bác sĩ trực.", ["Bác sĩ", "Thuốc", "Khám bệnh"], "HCM", "medium"),
  makeSign("Bút", "Trường học", "Dụng cụ dùng để viết.", "Em dùng bút ghi từ mới.", ["Vở", "Viết", "Bảng"]),
  makeSign("Cảm ơn", "Chào hỏi", "Cách thể hiện sự biết ơn.", "Em cảm ơn bạn đã giúp đỡ.", ["Xin lỗi", "Giúp", "Lịch sự"]),
  makeSign("Cần giúp đỡ", "Giao tiếp cơ bản", "Diễn đạt nhu cầu được hỗ trợ.", "Em cần giúp đỡ khi không hiểu bài.", ["Giúp", "Không hiểu", "Hỏi"], "Toàn quốc", "medium"),
  makeSign("Cặp sách", "Trường học", "Túi dùng để đựng sách vở.", "Em mang cặp sách đến lớp.", ["Sách", "Vở", "Bút"]),
  makeSign("Chào", "Chào hỏi", "Lời mở đầu khi gặp ai đó.", "Em chào cô giáo.", ["Xin chào", "Tạm biệt", "Bạn"]),
  makeSign("Chị", "Gia đình", "Nữ giới lớn tuổi hơn mình.", "Chị đọc sách cho em nghe.", ["Anh", "Em", "Mẹ"]),
  makeSign("Chợ", "Mua sắm", "Nơi mua bán thực phẩm và đồ dùng.", "Mẹ đi chợ vào buổi sáng.", ["Mua", "Tiền", "Rau"], "HN"),
  makeSign("Cô giáo", "Trường học", "Người nữ dạy học.", "Cô giáo hướng dẫn bài mới.", ["Thầy giáo", "Lớp", "Học"]),
  makeSign("Con", "Gia đình", "Người nhỏ trong quan hệ với cha mẹ.", "Con chào mẹ trước khi đi học.", ["Mẹ", "Ba", "Gia đình"]),
  makeSign("Đau", "Sức khỏe", "Cảm giác khó chịu ở cơ thể.", "Em bị đau đầu.", ["Bệnh", "Bác sĩ", "Mệt"]),
  makeSign("Đây", "Hỏi đường", "Từ chỉ vị trí gần người nói.", "Đây là đường đến thư viện.", ["Đó", "Ở đâu", "Bên trái"]),
  makeSign("Đi", "Hành động", "Di chuyển từ nơi này đến nơi khác.", "Em đi đến trường.", ["Đứng", "Đến", "Đường"]),
  makeSign("Điện thoại", "Đồ vật", "Thiết bị liên lạc và tra cứu.", "Điện thoại có tin nhắn mới.", ["Tin nhắn", "Gọi", "Máy tính"], "HCM", "medium"),
  makeSign("Đọc", "Hành động", "Nhìn chữ và hiểu nội dung.", "Em đọc câu ví dụ.", ["Sách", "Học", "Viết"]),
  makeSign("Đường", "Hỏi đường", "Lối đi hoặc tuyến giao thông.", "Con đường này dẫn đến trường.", ["Rẽ trái", "Rẽ phải", "Ở đâu"]),
  makeSign("Đứng", "Hành động", "Giữ cơ thể ở tư thế thẳng trên hai chân.", "Em đứng chờ xe buýt.", ["Ngồi", "Đi", "Chờ"], "Toàn quốc"),
  makeSign("Em", "Gia đình", "Người nhỏ tuổi hơn mình.", "Em thích học ký hiệu.", ["Anh", "Chị", "Con"]),
  makeSign("Ghế", "Đồ vật", "Đồ vật dùng để ngồi.", "Em ngồi trên ghế.", ["Bàn", "Ngồi", "Lớp"]),
  makeSign("Gia đình", "Gia đình", "Những người thân yêu quan tâm nhau.", "Gia đình em ăn tối cùng nhau.", ["Mẹ", "Ba", "Con"], "Toàn quốc", "medium"),
  makeSign("Giá bao nhiêu", "Mua sắm", "Câu hỏi về giá tiền.", "Chiếc bút này giá bao nhiêu?", ["Mua", "Tiền", "Đắt"], "Toàn quốc", "medium"),
  makeSign("Giúp", "Giao tiếp cơ bản", "Hỗ trợ người khác.", "Bạn có thể giúp mình không?", ["Cảm ơn", "Cần giúp đỡ", "Bạn"]),
  makeSign("Gọi điện", "Giao tiếp cơ bản", "Liên lạc bằng điện thoại.", "Em gọi điện cho mẹ.", ["Điện thoại", "Tin nhắn", "Nghe"], "HCM", "medium"),
  makeSign("Hai", "Số đếm", "Số 2.", "Em có hai quyển sách.", ["Một", "Ba", "Số đếm"]),
  makeSign("Hẹn gặp lại", "Chào hỏi", "Mong gặp lại vào lần sau.", "Hẹn gặp lại vào ngày mai.", ["Tạm biệt", "Ngày mai", "Bạn"], "Toàn quốc", "medium"),
  makeSign("Hỏi", "Giao tiếp cơ bản", "Đưa ra câu hỏi để hiểu rõ hơn.", "Em hỏi lại khi chưa hiểu.", ["Không hiểu", "Giúp", "Trả lời"]),
  makeSign("Hôm nay", "Thời gian", "Ngày hiện tại.", "Hôm nay em học từ mới.", ["Ngày mai", "Hôm qua", "Sáng"]),
  makeSign("Khám bệnh", "Bệnh viện", "Hoạt động kiểm tra sức khỏe.", "Bác sĩ khám bệnh cho em.", ["Bác sĩ", "Bệnh viện", "Đau"], "Toàn quốc", "medium"),
  makeSign("Khỏe", "Sức khỏe", "Trạng thái cơ thể tốt.", "Hôm nay em cảm thấy khỏe.", ["Mệt", "Đau", "Bác sĩ"]),
  makeSign("Không hiểu", "Giao tiếp cơ bản", "Chưa nắm được nội dung.", "Em không hiểu câu này.", ["Hỏi", "Giúp", "Bài học"], "Toàn quốc", "medium"),
  makeSign("Lớp", "Trường học", "Phòng hoặc nhóm học sinh học cùng nhau.", "Lớp của em rất vui.", ["Trường học", "Cô giáo", "Bảng"]),
  makeSign("Làm ơn", "Giao tiếp cơ bản", "Cách nói lịch sự khi nhờ người khác.", "Làm ơn viết lại câu này giúp mình.", ["Giúp", "Cảm ơn", "Xin lỗi"], "Toàn quốc", "medium"),
  makeSign("Lo lắng", "Cảm xúc", "Không yên tâm về điều gì đó.", "Em lo lắng trước bài kiểm tra.", ["Bình tĩnh", "Buồn", "Sợ"], "Toàn quốc", "medium"),
  makeSign("Mẹ", "Gia đình", "Người sinh ra hoặc chăm sóc mình như mẹ.", "Mẹ chuẩn bị bữa sáng.", ["Ba", "Con", "Gia đình"]),
  makeSign("Mệt", "Sức khỏe", "Thiếu năng lượng và cần nghỉ.", "Em mệt sau giờ học.", ["Khỏe", "Đau", "Nghỉ"]),
  makeSign("Một", "Số đếm", "Số 1.", "Em có một cây bút.", ["Hai", "Ba", "Số đếm"]),
  makeSign("Mua", "Mua sắm", "Trao tiền để lấy hàng hóa.", "Em mua một quyển vở.", ["Tiền", "Chợ", "Giá bao nhiêu"]),
  makeSign("Năm", "Số đếm", "Số 5.", "Lớp em có năm nhóm.", ["Một", "Hai", "Ba"]),
  makeSign("Ngày mai", "Thời gian", "Ngày sau hôm nay.", "Ngày mai em làm quiz.", ["Hôm nay", "Hôm qua", "Tối"], "Toàn quốc", "medium"),
  makeSign("Nghe", "Giao tiếp cơ bản", "Tiếp nhận âm thanh hoặc thông tin.", "Bạn ấy dùng thiết bị hỗ trợ nghe.", ["Nói", "Giao tiếp", "Điện thoại"], "Chưa xác định", "hard"),
  makeSign("Ngồi", "Hành động", "Đặt cơ thể trên ghế hoặc mặt phẳng.", "Em ngồi trong lớp.", ["Ghế", "Đứng", "Lớp"]),
  makeSign("Nói", "Giao tiếp cơ bản", "Diễn đạt bằng lời hoặc cách giao tiếp khác.", "Hãy nói chậm và rõ ý.", ["Nghe", "Giao tiếp", "Hỏi"], "Chưa xác định", "medium"),
  makeSign("Ông", "Gia đình", "Người nam thuộc thế hệ ông bà.", "Ông kể chuyện rất hay.", ["Bà", "Gia đình", "Ba"], "HP"),
  makeSign("Ở đâu", "Hỏi đường", "Câu hỏi về vị trí.", "Nhà vệ sinh ở đâu?", ["Đây", "Đường", "Rẽ trái"], "Toàn quốc", "medium"),
  makeSign("Quần", "Đồ vật", "Trang phục mặc ở phần thân dưới.", "Chiếc quần màu đen.", ["Áo", "Mặc", "Túi"], "HN"),
  makeSign("Rau", "Mua sắm", "Thực phẩm từ cây xanh.", "Mẹ mua rau ở chợ.", ["Chợ", "Mua", "Ăn"]),
  makeSign("Rẽ phải", "Hỏi đường", "Chuyển hướng sang bên phải.", "Đến ngã tư thì rẽ phải.", ["Rẽ trái", "Đường", "Ở đâu"], "HCM", "medium"),
  makeSign("Rẽ trái", "Hỏi đường", "Chuyển hướng sang bên trái.", "Bạn rẽ trái để đến thư viện.", ["Rẽ phải", "Đường", "Ở đâu"], "HCM", "medium"),
  makeSign("Sách", "Trường học", "Tài liệu có chữ hoặc hình để học.", "Em mở sách tiếng Việt.", ["Vở", "Đọc", "Bài học"]),
  makeSign("Sáng", "Thời gian", "Khoảng thời gian đầu ngày.", "Buổi sáng em đi học.", ["Trưa", "Chiều", "Tối"]),
  makeSign("Sợ", "Cảm xúc", "Cảm giác lo khi gặp điều nguy hiểm.", "Em sợ khi trời mưa lớn.", ["Lo lắng", "Bình tĩnh", "Buồn"], "Toàn quốc", "medium"),
  makeSign("Số đếm", "Số đếm", "Nhóm từ chỉ số lượng.", "Hôm nay em học số đếm.", ["Một", "Hai", "Ba"], "Toàn quốc", "medium"),
  makeSign("Tạm biệt", "Chào hỏi", "Lời chào khi rời đi.", "Em tạm biệt bạn sau giờ học.", ["Xin chào", "Hẹn gặp lại", "Bạn"]),
  makeSign("Thầy giáo", "Trường học", "Người nam dạy học.", "Thầy giáo giải thích bài học.", ["Cô giáo", "Lớp", "Học"]),
  makeSign("Thuốc", "Bệnh viện", "Chất dùng để chữa bệnh theo hướng dẫn.", "Em uống thuốc theo lời bác sĩ.", ["Bác sĩ", "Bệnh", "Bệnh viện"], "Toàn quốc", "medium"),
  makeSign("Tiền", "Mua sắm", "Phương tiện dùng để mua bán.", "Em trả tiền khi mua sách.", ["Mua", "Giá bao nhiêu", "Chợ"]),
  makeSign("Tối", "Thời gian", "Khoảng thời gian cuối ngày.", "Buổi tối gia đình trò chuyện.", ["Sáng", "Trưa", "Hôm nay"]),
  makeSign("Trường học", "Trường học", "Nơi học sinh đến học tập.", "Trường học có thư viện.", ["Lớp", "Cô giáo", "Sách"]),
  makeSign("Trưa", "Thời gian", "Khoảng giữa ngày.", "Buổi trưa em ăn cơm.", ["Sáng", "Tối", "Ăn"]),
  makeSign("Thư viện", "Trường học", "Nơi đọc sách và mượn tài liệu.", "Em đến thư viện để học bài.", ["Sách", "Trường học", "Đọc"], "HN", "medium"),
  makeSign("Uống", "Hành động", "Đưa nước hoặc đồ uống vào miệng.", "Em uống nước sau giờ học.", ["Ăn", "Nước", "Cốc"]),
  makeSign("Ước mơ", "Cảm xúc", "Điều mình mong muốn đạt được.", "Em có ước mơ trở thành giáo viên.", ["Vui", "Hy vọng", "Học"], "Toàn quốc", "medium"),
  makeSign("Vé xe", "Hỏi đường", "Giấy hoặc mã dùng để đi xe.", "Em mua vé xe đến bệnh viện.", ["Mua", "Đường", "Tiền"], "HCM", "medium"),
  makeSign("Vui", "Cảm xúc", "Cảm giác hạnh phúc và thoải mái.", "Em rất vui khi hiểu bài.", ["Buồn", "Cười", "Yêu thương"]),
  makeSign("Viết", "Hành động", "Tạo chữ trên giấy hoặc màn hình.", "Em viết từ mới vào vở.", ["Bút", "Đọc", "Học"]),
  makeSign("Vở", "Trường học", "Tập giấy dùng để ghi bài.", "Em ghi bài vào vở.", ["Sách", "Bút", "Viết"]),
  makeSign("Xin chào", "Chào hỏi", "Lời mở đầu thân thiện khi gặp ai đó.", "Em nói xin chào với bạn mới.", ["Chào", "Tạm biệt", "Bạn"]),
  makeSign("Xin lỗi", "Chào hỏi", "Lời nói khi làm phiền hoặc mắc lỗi.", "Em xin lỗi vì đến muộn.", ["Cảm ơn", "Không sao", "Lịch sự"]),
  makeSign("Yêu thương", "Cảm xúc", "Tình cảm quan tâm và trân trọng.", "Gia đình luôn yêu thương nhau.", ["Gia đình", "Vui", "Quan tâm"], "Toàn quốc", "medium"),
  makeSign("Y tá", "Bệnh viện", "Người hỗ trợ chăm sóc sức khỏe.", "Y tá hướng dẫn em uống thuốc.", ["Bác sĩ", "Bệnh viện", "Thuốc"], "Toàn quốc", "medium"),
  makeSign("Xếp hàng", "Hành động", "Đứng theo thứ tự để chờ đến lượt.", "Mọi người xếp hàng khi mua vé.", ["Chờ", "Mua", "Vé xe"], "Toàn quốc", "medium"),
  makeSign("Xem", "Hành động", "Nhìn để quan sát hoặc theo dõi.", "Em xem phần minh họa ký hiệu.", ["Nhìn", "Đọc", "Học"]),
];
