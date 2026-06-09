create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.dictionary_words
add column if not exists status text not null default 'published';

do $$
begin
  alter table public.dictionary_words
    add constraint dict_words_status_check
    check (status in ('draft', 'published', 'archived'));
exception
  when duplicate_object then null;
end $$;

insert into public.categories (name, slug, description, sort_order, is_active, updated_at)
values
  ('Chào hỏi', 'chao-hoi', 'Các cách chào, hỏi thăm và mở đầu cuộc trò chuyện.', 1, true, now()),
  ('Gia đình', 'gia-dinh', 'Từ vựng về thành viên và mối quan hệ trong gia đình.', 2, true, now()),
  ('Bạn bè', 'ban-be', 'Cụm từ dùng khi giao tiếp với bạn bè và người quen.', 3, true, now()),
  ('Học tập', 'hoc-tap', 'Từ và câu thường dùng trong lớp học, trường học.', 4, true, now()),
  ('Nghề nghiệp', 'nghe-nghiep', 'Từ vựng về công việc, nghề nghiệp và nơi làm việc.', 5, true, now()),
  ('Cảm xúc', 'cam-xuc', 'Cách biểu đạt cảm xúc, trạng thái và phản hồi cá nhân.', 6, true, now()),
  ('Ăn uống', 'an-uong', 'Từ vựng về món ăn, đồ uống và tình huống ăn uống.', 7, true, now()),
  ('Di chuyển', 'di-chuyen', 'Cụm từ về đi lại, phương tiện và chỉ dẫn di chuyển.', 8, true, now()),
  ('Hỏi đáp', 'hoi-dap', 'Câu hỏi, câu trả lời và mẫu giao tiếp thường gặp.', 9, true, now()),
  ('Khẩn cấp', 'khan-cap', 'Cụm từ cần thiết trong tình huống cần hỗ trợ nhanh.', 10, true, now())
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order,
  is_active = true,
  updated_at = now();

alter table public.categories enable row level security;
alter table public.dictionary_words enable row level security;

drop policy if exists "Anyone can read active categories" on public.categories;
create policy "Anyone can read active categories"
on public.categories for select
using (is_active = true);

drop policy if exists "Anyone can read published dictionary words" on public.dictionary_words;
create policy "Anyone can read published dictionary words"
on public.dictionary_words for select
using (status = 'published');

grant select on public.categories to anon, authenticated;
grant select on public.dictionary_words to anon, authenticated;
