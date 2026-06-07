alter table public.alphabet_media
add column if not exists board_image_url text,
add column if not exists board_image_storage_path text,
add column if not exists board_image_alt text;
