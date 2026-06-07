"use client";

import { createClient } from "@/lib/supabase/client";

export const alphabetBoardImageBucket = "alphabet-board-images";
export const maxAlphabetBoardImageSize = 2 * 1024 * 1024;
export const acceptedAlphabetBoardImageTypes = ["image/png", "image/jpeg", "image/webp"];

type UploadResult = {
  boardImageUrl: string;
  storagePath: string;
  alt: string;
};

function getExtension(file: File) {
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  return "jpg";
}

export function validateAlphabetBoardImage(file: File) {
  if (!acceptedAlphabetBoardImageTypes.includes(file.type)) {
    return "Chỉ hỗ trợ ảnh PNG, JPEG hoặc WebP.";
  }

  if (file.size > maxAlphabetBoardImageSize) {
    return "Ảnh ngoài bảng tối đa 2MB.";
  }

  return "";
}

export async function updateAlphabetBoardImageFields(
  letterKey: string,
  boardImageUrl: string | null,
  storagePath: string | null,
  alt: string | null,
) {
  const supabase = createClient();
  const { error } = await supabase
    .from("alphabet_media")
    .update({
      board_image_url: boardImageUrl,
      board_image_storage_path: storagePath,
      board_image_alt: alt,
      updated_at: new Date().toISOString(),
    })
    .eq("letter_key", letterKey);

  if (error) throw error;
}

export async function uploadAlphabetBoardImage(
  letterKey: string,
  file: File,
  alt: string,
): Promise<UploadResult> {
  const validationMessage = validateAlphabetBoardImage(file);
  if (validationMessage) {
    throw new Error(validationMessage);
  }

  const supabase = createClient();
  const storagePath = `alphabet-board/${letterKey}/preview.${getExtension(file)}`;
  const { error: uploadError } = await supabase.storage
    .from(alphabetBoardImageBucket)
    .upload(storagePath, file, {
      cacheControl: "3600",
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from(alphabetBoardImageBucket).getPublicUrl(storagePath);
  await updateAlphabetBoardImageFields(letterKey, data.publicUrl, storagePath, alt);

  return {
    boardImageUrl: data.publicUrl,
    storagePath,
    alt,
  };
}

export async function removeAlphabetBoardImage(letterKey: string, storagePath?: string | null) {
  const supabase = createClient();

  if (storagePath) {
    const { error: removeError } = await supabase.storage
      .from(alphabetBoardImageBucket)
      .remove([storagePath]);

    if (removeError) throw removeError;
  }

  await updateAlphabetBoardImageFields(letterKey, null, null, null);
}
