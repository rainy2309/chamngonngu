alter table public.alphabet_media
add column if not exists type text default 'letter',
add column if not exists display_label text,
add column if not exists explanation text,
add column if not exists board_image_url text,
add column if not exists board_image_storage_path text,
add column if not exists board_image_alt text;

do $$
begin
  alter table public.alphabet_media
    drop constraint if exists alphabet_status_check;

  alter table public.alphabet_media
    add constraint alphabet_status_check
    check (status in ('draft', 'published', 'archived'));
end $$;

do $$
begin
  alter table public.alphabet_media
    add constraint alphabet_type_check
    check (type in ('letter', 'vowel_modifier', 'tone_mark'));
exception
  when duplicate_object then null;
end $$;

insert into public.alphabet_media
  (letter_key, letter, display_label, type, title, description, explanation, display_order, status, board_image_alt, updated_at)
values
  ('a', 'A', 'A', 'letter', 'Ký hiệu chữ A', 'Chữ A là ký hiệu cơ bản trong bảng chữ cái.', 'Chữ cái cơ bản trong bảng ký hiệu.', 1, 'published', 'Minh họa ký hiệu A', now()),
  ('b', 'B', 'B', 'letter', 'Ký hiệu chữ B', 'Chữ B là ký hiệu cơ bản trong bảng chữ cái.', 'Chữ cái cơ bản trong bảng ký hiệu.', 2, 'published', 'Minh họa ký hiệu B', now()),
  ('c', 'C', 'C', 'letter', 'Ký hiệu chữ C', 'Chữ C là ký hiệu cơ bản trong bảng chữ cái.', 'Chữ cái cơ bản trong bảng ký hiệu.', 3, 'published', 'Minh họa ký hiệu C', now()),
  ('d', 'D', 'D', 'letter', 'Ký hiệu chữ D', 'Chữ D là ký hiệu cơ bản trong bảng chữ cái.', 'Chữ cái cơ bản trong bảng ký hiệu.', 4, 'published', 'Minh họa ký hiệu D', now()),
  ('dd', 'Đ', 'Đ', 'letter', 'Ký hiệu chữ Đ', 'Chữ Đ là ký hiệu cơ bản trong bảng chữ cái.', 'Chữ cái cơ bản trong bảng ký hiệu.', 5, 'published', 'Minh họa ký hiệu Đ', now()),
  ('e', 'E', 'E', 'letter', 'Ký hiệu chữ E', 'Chữ E là ký hiệu cơ bản trong bảng chữ cái.', 'Chữ cái cơ bản trong bảng ký hiệu.', 6, 'published', 'Minh họa ký hiệu E', now()),
  ('g', 'G', 'G', 'letter', 'Ký hiệu chữ G', 'Chữ G là ký hiệu cơ bản trong bảng chữ cái.', 'Chữ cái cơ bản trong bảng ký hiệu.', 7, 'published', 'Minh họa ký hiệu G', now()),
  ('h', 'H', 'H', 'letter', 'Ký hiệu chữ H', 'Chữ H là ký hiệu cơ bản trong bảng chữ cái.', 'Chữ cái cơ bản trong bảng ký hiệu.', 8, 'published', 'Minh họa ký hiệu H', now()),
  ('i', 'I', 'I', 'letter', 'Ký hiệu chữ I', 'Chữ I là ký hiệu cơ bản trong bảng chữ cái.', 'Chữ cái cơ bản trong bảng ký hiệu.', 9, 'published', 'Minh họa ký hiệu I', now()),
  ('k', 'K', 'K', 'letter', 'Ký hiệu chữ K', 'Chữ K là ký hiệu cơ bản trong bảng chữ cái.', 'Chữ cái cơ bản trong bảng ký hiệu.', 10, 'published', 'Minh họa ký hiệu K', now()),
  ('l', 'L', 'L', 'letter', 'Ký hiệu chữ L', 'Chữ L là ký hiệu cơ bản trong bảng chữ cái.', 'Chữ cái cơ bản trong bảng ký hiệu.', 11, 'published', 'Minh họa ký hiệu L', now()),
  ('m', 'M', 'M', 'letter', 'Ký hiệu chữ M', 'Chữ M là ký hiệu cơ bản trong bảng chữ cái.', 'Chữ cái cơ bản trong bảng ký hiệu.', 12, 'published', 'Minh họa ký hiệu M', now()),
  ('n', 'N', 'N', 'letter', 'Ký hiệu chữ N', 'Chữ N là ký hiệu cơ bản trong bảng chữ cái.', 'Chữ cái cơ bản trong bảng ký hiệu.', 13, 'published', 'Minh họa ký hiệu N', now()),
  ('o', 'O', 'O', 'letter', 'Ký hiệu chữ O', 'Chữ O là ký hiệu cơ bản trong bảng chữ cái.', 'Chữ cái cơ bản trong bảng ký hiệu.', 14, 'published', 'Minh họa ký hiệu O', now()),
  ('p', 'P', 'P', 'letter', 'Ký hiệu chữ P', 'Chữ P là ký hiệu cơ bản trong bảng chữ cái.', 'Chữ cái cơ bản trong bảng ký hiệu.', 15, 'published', 'Minh họa ký hiệu P', now()),
  ('q', 'Q', 'Q', 'letter', 'Ký hiệu chữ Q', 'Chữ Q là ký hiệu cơ bản trong bảng chữ cái.', 'Chữ cái cơ bản trong bảng ký hiệu.', 16, 'published', 'Minh họa ký hiệu Q', now()),
  ('r', 'R', 'R', 'letter', 'Ký hiệu chữ R', 'Chữ R là ký hiệu cơ bản trong bảng chữ cái.', 'Chữ cái cơ bản trong bảng ký hiệu.', 17, 'published', 'Minh họa ký hiệu R', now()),
  ('s', 'S', 'S', 'letter', 'Ký hiệu chữ S', 'Chữ S là ký hiệu cơ bản trong bảng chữ cái.', 'Chữ cái cơ bản trong bảng ký hiệu.', 18, 'published', 'Minh họa ký hiệu S', now()),
  ('t', 'T', 'T', 'letter', 'Ký hiệu chữ T', 'Chữ T là ký hiệu cơ bản trong bảng chữ cái.', 'Chữ cái cơ bản trong bảng ký hiệu.', 19, 'published', 'Minh họa ký hiệu T', now()),
  ('u', 'U', 'U', 'letter', 'Ký hiệu chữ U', 'Chữ U là ký hiệu cơ bản trong bảng chữ cái.', 'Chữ cái cơ bản trong bảng ký hiệu.', 20, 'published', 'Minh họa ký hiệu U', now()),
  ('v', 'V', 'V', 'letter', 'Ký hiệu chữ V', 'Chữ V là ký hiệu cơ bản trong bảng chữ cái.', 'Chữ cái cơ bản trong bảng ký hiệu.', 21, 'published', 'Minh họa ký hiệu V', now()),
  ('x', 'X', 'X', 'letter', 'Ký hiệu chữ X', 'Chữ X là ký hiệu cơ bản trong bảng chữ cái.', 'Chữ cái cơ bản trong bảng ký hiệu.', 22, 'published', 'Minh họa ký hiệu X', now()),
  ('y', 'Y', 'Y', 'letter', 'Ký hiệu chữ Y', 'Chữ Y là ký hiệu cơ bản trong bảng chữ cái.', 'Chữ cái cơ bản trong bảng ký hiệu.', 23, 'published', 'Minh họa ký hiệu Y', now()),
  ('circumflex_group', 'â / ê / ô', 'â / ê / ô', 'vowel_modifier', 'Ký hiệu nhóm â / ê / ô', 'Nhóm nguyên âm dùng dấu mũ.', 'â = a + ^, ê = e + ^, ô = o + ^', 24, 'published', 'Minh họa ký hiệu nhóm â / ê / ô', now()),
  ('breve_group', 'ă', 'ă', 'vowel_modifier', 'Ký hiệu chữ ă', 'Chữ ă được biểu đạt bằng chữ a kết hợp dấu breve.', 'ă = a + ˘', 25, 'published', 'Minh họa ký hiệu chữ ă', now()),
  ('horn_group', 'ư / ơ', 'ư / ơ', 'vowel_modifier', 'Ký hiệu nhóm ư / ơ', 'Nhóm nguyên âm dùng dấu móc.', 'ư = u + ˇ, ơ = o + ˇ', 26, 'published', 'Minh họa ký hiệu nhóm ư / ơ', now()),
  ('sac', 'dấu sắc', 'dấu sắc', 'tone_mark', 'Ký hiệu dấu sắc', 'Dấu sắc là một dấu thanh trong tiếng Việt.', 'Dấu thanh được học như một nhóm ký hiệu riêng.', 27, 'published', 'Minh họa ký hiệu dấu sắc', now()),
  ('huyen', 'dấu huyền', 'dấu huyền', 'tone_mark', 'Ký hiệu dấu huyền', 'Dấu huyền là một dấu thanh trong tiếng Việt.', 'Dấu thanh được học như một nhóm ký hiệu riêng.', 28, 'published', 'Minh họa ký hiệu dấu huyền', now()),
  ('hoi', 'dấu hỏi', 'dấu hỏi', 'tone_mark', 'Ký hiệu dấu hỏi', 'Dấu hỏi là một dấu thanh trong tiếng Việt.', 'Dấu thanh được học như một nhóm ký hiệu riêng.', 29, 'published', 'Minh họa ký hiệu dấu hỏi', now()),
  ('nga', 'dấu ngã', 'dấu ngã', 'tone_mark', 'Ký hiệu dấu ngã', 'Dấu ngã là một dấu thanh trong tiếng Việt.', 'Dấu thanh được học như một nhóm ký hiệu riêng.', 30, 'published', 'Minh họa ký hiệu dấu ngã', now()),
  ('nang', 'dấu nặng', 'dấu nặng', 'tone_mark', 'Ký hiệu dấu nặng', 'Dấu nặng là một dấu thanh trong tiếng Việt.', 'Dấu thanh được học như một nhóm ký hiệu riêng.', 31, 'published', 'Minh họa ký hiệu dấu nặng', now())
on conflict (letter_key) do update
set
  letter = excluded.letter,
  display_label = excluded.display_label,
  type = excluded.type,
  title = excluded.title,
  description = excluded.description,
  explanation = excluded.explanation,
  display_order = excluded.display_order,
  status = excluded.status,
  board_image_alt = coalesce(public.alphabet_media.board_image_alt, excluded.board_image_alt),
  updated_at = now();

update public.alphabet_media
set status = 'archived', updated_at = now()
where letter_key in ('aw', 'aa', 'ee', 'oo', 'ow', 'uw', 'dau-sac', 'dau-huyen', 'dau-hoi', 'dau-nga', 'dau-nang');
