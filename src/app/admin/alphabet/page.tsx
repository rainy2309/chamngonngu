"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Edit, ImageIcon, Loader2, Plus, Search, Trash2, Upload, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  removeAlphabetBoardImage,
  uploadAlphabetBoardImage,
  validateAlphabetBoardImage,
} from "@/lib/alphabetBoardImages";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/client";

type AlphabetItem = {
  id: string;
  letter_key: string;
  letter: string;
  title: string;
  video_url?: string | null;
  board_image_url?: string | null;
  board_image_storage_path?: string | null;
  board_image_alt?: string | null;
  status: string;
  display_order: number;
};

function getDefaultAlt(item: AlphabetItem) {
  return item.letter.toLowerCase().startsWith("dấu")
    ? `Minh họa ký hiệu ${item.letter}`
    : `Minh họa ký hiệu chữ ${item.letter}`;
}

function BoardImageUploadModal({
  item,
  saving,
  onClose,
  onSave,
}: {
  item: AlphabetItem;
  saving: boolean;
  onClose: () => void;
  onSave: (file: File, alt: string) => Promise<void>;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [alt, setAlt] = useState(item.board_image_alt || getDefaultAlt(item));
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      setError("Vui lòng chọn ảnh PNG, JPEG hoặc WebP.");
      return;
    }

    const validationMessage = validateAlphabetBoardImage(file);
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    setError("");
    await onSave(file, alt.trim() || getDefaultAlt(item));
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Đóng hộp thoại tải ảnh"
        onClick={onClose}
      />
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-lg rounded-3xl border border-blue-100 bg-white p-5 shadow-2xl shadow-blue-950/20"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-blue-600">Ảnh ngoài bảng</p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">
              Tải ảnh ngoài bảng cho {item.letter}
            </h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
              Ảnh này chỉ hiển thị ở ô ngoài bảng chữ cái. Popup chi tiết vẫn giữ phần minh họa riêng.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-700 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
            aria-label="Đóng"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-5 grid gap-4">
          <label className="grid gap-2">
            <span className="text-sm font-black text-slate-800">Chọn ảnh</span>
            <Input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(event) => {
                const nextFile = event.target.files?.[0] ?? null;
                setFile(nextFile);
                setError(nextFile ? validateAlphabetBoardImage(nextFile) : "");
              }}
              className="h-12 rounded-2xl border-blue-100"
            />
            <span className="text-xs font-semibold text-slate-500">
              Hỗ trợ PNG, JPEG, WebP. Dung lượng tối đa 2MB.
            </span>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-black text-slate-800">Mô tả ảnh</span>
            <Input
              value={alt}
              onChange={(event) => setAlt(event.target.value)}
              className="h-12 rounded-2xl border-blue-100"
            />
          </label>

          {error ? (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</p>
          ) : null}
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Button type="submit" disabled={saving} className="h-11 rounded-full">
            {saving ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <Upload className="h-5 w-5" aria-hidden="true" />}
            {saving ? "Đang tải ảnh..." : "Tải ảnh"}
          </Button>
          <Button type="button" variant="outline" onClick={onClose} className="h-11 rounded-full" disabled={saving}>
            Hủy
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function AdminAlphabetPage() {
  const [letters, setLetters] = useState<AlphabetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [uploadItem, setUploadItem] = useState<AlphabetItem | null>(null);
  const [savingImage, setSavingImage] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadAlphabet();
  }, []);

  async function loadAlphabet() {
    if (!hasSupabaseEnv()) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("alphabet_media")
      .select(
        "id, letter_key, letter, title, video_url, board_image_url, board_image_storage_path, board_image_alt, status, display_order",
      )
      .order("display_order", { ascending: true })
      .order("letter", { ascending: true });

    if (error) {
      console.error("Alphabet admin load error:", error);
    }

    if (data) {
      setLetters(data);
    }
    setLoading(false);
  }

  async function deleteLetter(id: string) {
    if (!confirm("Bạn có chắc muốn xóa chữ cái này khỏi hệ thống?")) return;
    setDeleting(id);
    const supabase = createClient();
    await supabase.from("alphabet_media").delete().eq("id", id);
    setLetters((prev) => prev.filter((item) => item.id !== id));
    setDeleting(null);
  }

  async function handleUploadBoardImage(file: File, alt: string) {
    if (!uploadItem) return;

    try {
      setSavingImage(true);
      const result = await uploadAlphabetBoardImage(uploadItem.letter_key, file, alt);
      setLetters((prev) =>
        prev.map((item) =>
          item.id === uploadItem.id
            ? {
                ...item,
                board_image_url: result.boardImageUrl,
                board_image_storage_path: result.storagePath,
                board_image_alt: result.alt,
              }
            : item,
        ),
      );
      setMessage("Đã cập nhật ảnh ngoài bảng.");
      setUploadItem(null);
    } catch (error) {
      console.error("Board image upload error:", error);
      setMessage(error instanceof Error ? error.message : "Không thể tải ảnh. Vui lòng thử lại.");
    } finally {
      setSavingImage(false);
    }
  }

  async function handleRemoveBoardImage(item: AlphabetItem) {
    if (!confirm("Xóa ảnh ngoài bảng của mục này? Video/GIF hiện có sẽ không bị thay đổi.")) return;

    try {
      setMessage("");
      await removeAlphabetBoardImage(item.letter_key, item.board_image_storage_path);
      setLetters((prev) =>
        prev.map((letter) =>
          letter.id === item.id
            ? {
                ...letter,
                board_image_url: null,
                board_image_storage_path: null,
                board_image_alt: null,
              }
            : letter,
        ),
      );
      setMessage("Đã xóa ảnh ngoài bảng.");
    } catch (error) {
      console.error("Board image remove error:", error);
      setMessage("Không thể xóa ảnh. Vui lòng thử lại.");
    }
  }

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return letters.filter((item) => {
      return (
        !normalizedQuery ||
        item.letter.toLowerCase().includes(normalizedQuery) ||
        item.title.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [letters, query]);

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-950">Quản lý bảng chữ cái</h1>
          <p className="mt-1 font-semibold text-slate-500">{letters.length} mục trong hệ thống</p>
        </div>
        <Button asChild className="gap-2 rounded-full">
          <Link href="/admin/alphabet/new">
            <Plus className="h-5 w-5" aria-hidden="true" /> Thêm chữ cái mới
          </Link>
        </Button>
      </div>

      <div className="mb-6 grid gap-3">
        <div className="flex max-w-md items-center gap-2 rounded-xl border border-slate-200 bg-white px-3">
          <Search className="h-5 w-5 text-slate-400" aria-hidden="true" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm chữ cái..."
            className="border-0 focus-visible:ring-0"
          />
        </div>
        {message ? (
          <p className="w-fit rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-blue-800">{message}</p>
        ) : null}
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-3 py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" aria-hidden="true" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center">
          <p className="font-bold text-slate-500">
            {letters.length === 0
              ? "Chưa có chữ cái nào. Hãy seed dữ liệu hoặc thêm mới."
              : "Không tìm thấy kết quả phù hợp."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-6 py-3 font-black text-slate-700">Chữ cái</th>
                <th className="px-6 py-3 font-black text-slate-700">Tiêu đề</th>
                <th className="px-6 py-3 font-black text-slate-700">Thứ tự hiển thị</th>
                <th className="px-6 py-3 font-black text-slate-700">Trạng thái</th>
                <th className="px-6 py-3 font-black text-slate-700">Video ký hiệu</th>
                <th className="px-6 py-3 font-black text-slate-700">Ảnh ngoài bảng</th>
                <th className="px-6 py-3 font-black text-slate-700">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className="border-b border-slate-50 hover:bg-blue-50/30">
                  <td className="px-6 py-3 text-lg font-extrabold text-blue-700">{item.letter}</td>
                  <td className="px-6 py-3 font-bold text-slate-900">{item.title}</td>
                  <td className="px-6 py-3 font-semibold text-slate-600">{item.display_order}</td>
                  <td className="px-6 py-3">
                    <Badge
                      className={
                        item.status === "published"
                          ? "bg-green-50 text-green-700 hover:bg-green-50"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-100"
                      }
                    >
                      {item.status === "published" ? "Đã xuất bản" : "Bản nháp"}
                    </Badge>
                  </td>
                  <td className="px-6 py-3">
                    {item.video_url ? (
                      <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">Đã gắn video</Badge>
                    ) : (
                      <Badge className="bg-red-50 text-red-600 hover:bg-red-50">Chưa có video</Badge>
                    )}
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      {item.board_image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.board_image_url}
                          alt={item.board_image_alt || getDefaultAlt(item)}
                          className="h-14 w-14 rounded-xl border border-blue-100 bg-blue-50 object-contain p-1"
                        />
                      ) : (
                        <Badge className="gap-1 bg-slate-100 text-slate-600 hover:bg-slate-100">
                          <ImageIcon className="h-3.5 w-3.5" aria-hidden="true" />
                          Chưa có ảnh
                        </Badge>
                      )}
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => setUploadItem(item)}
                          className="h-9 rounded-full"
                        >
                          <Upload className="h-4 w-4" aria-hidden="true" />
                          Tải ảnh
                        </Button>
                        {item.board_image_url ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => handleRemoveBoardImage(item)}
                            className="h-9 rounded-full border-red-100 text-red-600 hover:bg-red-50"
                          >
                            Xóa ảnh
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/alphabet/${item.id}/edit`}
                        className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                        aria-label={`Sửa ${item.title}`}
                      >
                        <Edit className="h-4 w-4" aria-hidden="true" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => deleteLetter(item.id)}
                        disabled={deleting === item.id}
                        className="rounded-lg p-2 text-red-500 hover:bg-red-50 disabled:opacity-50"
                        aria-label={`Xóa ${item.title}`}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {uploadItem ? (
        <BoardImageUploadModal
          item={uploadItem}
          saving={savingImage}
          onClose={() => (savingImage ? undefined : setUploadItem(null))}
          onSave={handleUploadBoardImage}
        />
      ) : null}
    </div>
  );
}
