-- 1. CẬP NHẬT BUCKET 'sign-videos' VÀ 'alphabet-videos' THÀNH PUBLIC
-- Để cho phép truy cập công khai qua URL public/... không bị lỗi 'Bucket not found'
UPDATE storage.buckets
SET public = true
WHERE id IN ('sign-videos', 'alphabet-videos');

-- 2. THÊM CHÍNH SÁCH UPDATE CHO STORAGE.OBJECTS TRONG BUCKET 'sign-videos'
-- Để hỗ trợ tính năng upsert: true khi upload video của Admin
DROP POLICY IF EXISTS "Admin update sign-videos" ON storage.objects;
CREATE POLICY "Admin update sign-videos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'sign-videos' AND public.is_admin()
  );

-- 3. DỌN DẸP DỮ LIỆU VIDEO_URL BỊ LỖI TRONG BẢNG alphabet_media
-- Đưa video_url về NULL nếu url không đúng định dạng bucket hoặc không đúng cấu trúc thư mục sign-videos/alphabet/{uuid}
-- giúp admin có thể tải lên lại video chuẩn xác từ đầu.
UPDATE public.alphabet_media
SET video_url = NULL
WHERE video_url IS NOT NULL 
  AND (
    video_url NOT LIKE '%/storage/v1/object/public/sign-videos/alphabet/%'
  );

-- 4. HƯỚNG DẪN NÂNG CẤP TÀI KHOẢN CỦA BẠN THÀNH ADMIN (Nếu cần)
-- Đăng ký tài khoản trên trang web, sau đó lấy user ID hoặc full_name chạy câu lệnh dưới đây trong Supabase SQL Editor:
--
-- UPDATE public.profiles
-- SET role = 'admin'
-- WHERE id = 'MÃ_UUID_CỦA_BẠN';
--
-- Hoặc tìm theo tên:
-- UPDATE public.profiles
-- SET role = 'admin'
-- WHERE full_name = 'Tên tài khoản của bạn';
