# 🤟 CHẠM - Silent Bridge

> **Nền tảng học và tra cứu Ngôn ngữ Ký hiệu Việt Nam (VSL) hỗ trợ cộng đồng**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)
[![Google Gemini](https://img.shields.io/badge/Gemini_AI-Powered-8E75FF?style=flat-square&logo=googlegemini)](https://ai.google.dev/)

---

## 📌 Giới thiệu dự án

**CHẠM (Silent Bridge)** là giải pháp công nghệ xã hội nhằm xóa bỏ rào cản giao tiếp giữa người Điếc / Khiếm thính và cộng đồng người nghe. 

Dự án cung cấp một hệ thống học tập tương tác, tra cứu từ điển Ngôn ngữ Ký hiệu Việt Nam (VSL) trực quan, kết hợp cùng **Trợ lý Trí tuệ Nhân tạo (Gemini AI)** giúp cá nhân hóa trải nghiệm học tập cho sinh viên, người mới bắt đầu và những ai muốn xây dựng một môi trường giao tiếp hòa nhập.

---

## ✨ Tính năng nổi bật

- 📖 **Từ điển Ký hiệu Trực quan:** Tra cứu hàng ngàn từ vựng Ngôn ngữ Ký hiệu Việt Nam phân loại theo các chủ đề thiết thực (Giao tiếp hàng ngày, Gia đình, Trường học, Y tế,...), đi kèm minh họa bằng video/hình ảnh sinh động.
- 🎓 **Lộ trình Bài học & Flashcard:** Bài học được thiết kế theo lộ trình từ cơ bản đến nâng cao. Thẻ ghi nhớ (Flashcards) tương tác giúp ghi nhớ ký hiệu hiệu quả.
- 🧠 **Luyện tập Trắc nghiệm (Quiz):** Hệ thống câu hỏi kiểm tra và củng cố kiến thức theo nhiều dạng bài tập hấp dẫn.
- 🤖 **Trợ lý AI Thông minh (Gemini AI Integration):** Giải đáp thắc mắc về văn hóa người Điếc, gợi ý ngữ cảnh sử dụng ký hiệu và hỗ trợ luyện tập 24/7.
- 🤝 **Cộng đồng & Chiến dịch (Community & Campaigns):** Nơi chia sẻ bài viết, trao đổi kinh nghiệm và tham gia các chiến dịch lan tỏa ngôn ngữ ký hiệu.
- 🛡️ **Quản trị & Nhập dữ liệu tự động:** Công cụ Quản trị viên (Admin Panel) và script nhập từ vựng tự động từ file Excel (`.xlsx`) vào cơ sở dữ liệu Supabase.

---

## 🛠️ Công nghệ sử dụng (Tech Stack)

### **Frontend**
- **Framework:** [Next.js 16](https://nextjs.org/) (App Router Architecture)
- **UI Library & Styling:** [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/), [Radix UI](https://www.radix-ui.com/), [Lucide React Icons](https://lucide.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)

### **Backend & Database**
- **Database & Auth:** [Supabase](https://supabase.com/) (PostgreSQL, Supabase Auth, SSR Client)
- **AI Integration:** [Google Generative AI SDK](https://ai.google.dev/) (Gemini Flash Model)

### **Tools & Scripts**
- **Data Import Tool:** [TSX](https://github.com/privatenumber/tsx) & [SheetJS (XLSX)](https://sheetjs.com/) cho tác vụ nạp dữ liệu từ điển.

---

## 📁 Cấu trúc Dự án (Project Structure)

```text
ngonngukyhieu/
├── src/
│   ├── app/                # Next.js App Router (Pages, Layouts, API Routes)
│   │   ├── (auth)/         # Các trang xác thực (Đăng nhập, Đăng ký, Đặt lại mật khẩu)
│   │   ├── admin/          # Trang Quản trị viên
│   │   ├── tu-dien/        # Trang Tra cứu Từ điển Ngôn ngữ ký hiệu
│   │   ├── khoa-hoc/       # Lộ trình Bài học & Flashcard
│   │   ├── quiz/           # Bài tập luyện tập & Trắc nghiệm
│   │   ├── cong-dong/      # Diễn đàn & Bài viết Cộng đồng
│   │   └── api/            # API endpoints (Tích hợp AI Gemini, Supabase, v.v.)
│   ├── components/         # Các Component tái sử dụng (UI, Auth, Cards, Layout,...)
│   ├── data/               # Dữ liệu tĩnh và cấu hình mẫu
│   ├── lib/                # Cấu hình Supabase client, Gemini AI client, Utilities
│   └── types/              # Định nghĩa kiểu dữ liệu TypeScript (TypeScript Interfaces)
├── scripts/                # Script nhập liệu từ vựng từ Excel (`import-vocabulary-from-xlsx.ts`)
├── public/                 # Tài nguyên tĩnh (Hình ảnh, Icon, Media)
├── supabase/               # Migrations và cấu hình Database
├── package.json            # Quản lý dependencies và scripts
└── README.md               # Tài liệu hướng dẫn dự án
```

---

## 🚀 Hướng dẫn Cài đặt & Khởi chạy

### **Yêu cầu hệ thống**
- [Node.js](https://nodejs.org/) `>= 18.0.0`
- Nguồn quản lý gói: `npm`, `pnpm` hoặc `yarn`

### **1. Clone dự án và cài đặt dependencies**

```bash
git clone https://github.com/your-username/ngonngukyhieu.git
cd ngonngukyhieu
npm install
```

### **2. Cấu hình Biến môi trường (Environment Variables)**

Tạo file `.env.local` ở thư mục gốc của dự án và khai báo các biến môi trường sau:

```env
# Cấu hình Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Cấu hình Google Gemini AI
GEMINI_API_KEY=your-google-gemini-api-key
```

### **3. Nạp dữ liệu từ vựng ban đầu (Tùy chọn)**

Nếu bạn cần nhập dữ liệu từ vựng từ file Excel vào database Supabase:

```bash
npm run import:vocabulary
```

### **4. Chạy ứng dụng ở chế độ Phát triển (Development)**

```bash
npm run dev
```

Mở trình duyệt và truy cập: [http://localhost:3000](http://localhost:3000)

---

## 📜 Kịch bản Scripts có sẵn (Available Scripts)

| Lệnh | Mô tả |
| :--- | :--- |
| `npm run dev` | Khởi chạy máy chủ phát triển (Development mode) tại `localhost:3000` |
| `npm run build` | Biên dịch ứng dụng cho môi trường sản xuất (Production Build) |
| `npm run start` | Khởi chạy máy chủ Production sau khi đã build |
| `npm run import:vocabulary` | Chạy script nhập dữ liệu từ vựng từ Excel vào Supabase |
| `npm run lint` | Kiểm tra lỗi cú pháp và định dạng code với ESLint |

---

## 🤝 Đóng góp (Contributing)

Mọi đóng góp cho dự án **CHẠM** đều được trân trọng! Nếu bạn có ý tưởng cải tiến hoặc phát hiện lỗi, vui lòng:

1. Fork kho lưu trữ này.
2. Tạo nhánh tính năng mới (`git checkout -b feature/TinhNangMoi`).
3. Commit các thay đổi của bạn (`git commit -m 'Thêm tính năng A'`).
4. Push lên nhánh (`git push origin feature/TinhNangMoi`).
5. Mở một **Pull Request**.

---

## 📄 Giấy phép (License)

Dự án được phát triển vì mục đích phi lợi nhuận và hỗ trợ cộng đồng. Tất cả tài nguyên thuộc bản quyền dự án **CHẠM - Silent Bridge**.
