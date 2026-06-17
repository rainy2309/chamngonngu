"use client";

import { createClient, hasSupabaseEnv } from "@/lib/supabase/client";
import { learningStorageKeys, readLearningItems, type StoredLearningItem } from "@/lib/localLearning";

export type LearningKind = "favorites" | "learned" | "learnedAlphabet" | "viewedLessons";

type LearningConfig = {
  legacyKey: string;
  guestKey: string;
  userPrefix: string;
  remote: "bookmarks" | "progress" | "local";
};

export type LearningState = {
  items: StoredLearningItem[];
  ids: string[];
  userId: string | null;
  isAuthenticated: boolean;
};

export const learningKindConfig: Record<LearningKind, LearningConfig> = {
  favorites: {
    legacyKey: learningStorageKeys.favorites,
    guestKey: "cham_guest_favorite_signs",
    userPrefix: "favorite_signs",
    remote: "bookmarks",
  },
  learned: {
    legacyKey: learningStorageKeys.learned,
    guestKey: "cham_guest_learned_signs",
    userPrefix: "learned_signs",
    remote: "progress",
  },
  learnedAlphabet: {
    legacyKey: "cham_learned_alphabet",
    guestKey: "cham_guest_learned_alphabet",
    userPrefix: "learned_alphabet",
    remote: "progress",
  },
  viewedLessons: {
    legacyKey: learningStorageKeys.viewedLessons,
    guestKey: "cham_guest_viewed_lessons",
    userPrefix: "viewed_lessons",
    remote: "local",
  },
};

function isBrowser() {
  return typeof window !== "undefined";
}

function normalizeStoredItem(item: StoredLearningItem | { id: string; label: string; itemType?: string; category?: string; href?: string }): StoredLearningItem {
  const now = new Date().toISOString();
  return {
    id: item.id,
    label: item.label || item.id,
    itemType: item.itemType,
    category: item.category,
    href: item.href,
    savedAt: "savedAt" in item && item.savedAt ? item.savedAt : now,
    updatedAt: "updatedAt" in item && item.updatedAt ? item.updatedAt : now,
  };
}

function dedupeItems(items: StoredLearningItem[]) {
  const byId = new Map<string, StoredLearningItem>();
  for (const item of items) {
    if (!item.id) continue;
    const existing = byId.get(item.id);
    if (!existing || new Date(item.updatedAt).getTime() > new Date(existing.updatedAt).getTime()) {
      byId.set(item.id, item);
    }
  }
  return Array.from(byId.values()).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

function readItemsFromKey(key: string) {
  return dedupeItems(readLearningItems(key));
}

function writeItemsToKey(key: string, items: StoredLearningItem[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(key, JSON.stringify(dedupeItems(items)));
}

function removeKey(key: string) {
  if (!isBrowser()) return;
  window.localStorage.removeItem(key);
}

export function getLearningIds(items: StoredLearningItem[]) {
  return items.map((item) => item.id).filter(Boolean);
}

export function getGuestStorageKey(kind: LearningKind) {
  return learningKindConfig[kind].guestKey;
}

export function getUserStorageKey(kind: LearningKind, userId: string) {
  return `cham_user_${userId}_${learningKindConfig[kind].userPrefix}`;
}

export function migrateLegacyLearningKeys() {
  if (!isBrowser()) return;

  for (const config of Object.values(learningKindConfig)) {
    const legacyItems = readItemsFromKey(config.legacyKey);
    if (!legacyItems.length) continue;

    const guestItems = readItemsFromKey(config.guestKey);
    writeItemsToKey(config.guestKey, [...legacyItems, ...guestItems]);
    removeKey(config.legacyKey);
  }
}

export async function getCurrentUserId() {
  if (!hasSupabaseEnv()) return null;
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user?.id ?? null;
  } catch {
    return null;
  }
}

function fallbackItem(id: string, kind: LearningKind): StoredLearningItem {
  const now = new Date().toISOString();
  return {
    id,
    label: id,
    itemType: kind === "favorites" ? "favorite" : "learning",
    updatedAt: now,
    savedAt: now,
  };
}

async function fetchRemoteItems(kind: LearningKind, userId: string): Promise<StoredLearningItem[] | null> {
  if (!hasSupabaseEnv()) return null;
  const config = learningKindConfig[kind];
  if (config.remote === "local") return null;

  try {
    const supabase = createClient();
    if (config.remote === "progress") {
      const { data, error } = await supabase
        .from("user_progress")
        .select("word_id,status,last_seen_at")
        .eq("user_id", userId)
        .eq("status", "learned")
        .order("last_seen_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((row) => ({
        ...fallbackItem(String(row.word_id), kind),
        updatedAt: String(row.last_seen_at ?? new Date().toISOString()),
      }));
    }

    const { data, error } = await supabase
      .from("user_bookmarks")
      .select("word_key,created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row) => ({
      ...fallbackItem(String(row.word_key), kind),
      updatedAt: String(row.created_at ?? new Date().toISOString()),
      savedAt: String(row.created_at ?? new Date().toISOString()),
    }));
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Auth learning remote fetch fallback:", error);
    }
    return null;
  }
}

async function upsertRemoteItems(kind: LearningKind, userId: string, items: StoredLearningItem[]) {
  if (!items.length || !hasSupabaseEnv()) return false;
  const config = learningKindConfig[kind];
  if (config.remote === "local") return false;

  try {
    const supabase = createClient();
    if (config.remote === "progress") {
      const { error } = await supabase.from("user_progress").upsert(
        items.map((item) => ({
          user_id: userId,
          word_id: item.id,
          status: "learned",
          last_seen_at: item.updatedAt ?? new Date().toISOString(),
        })),
        { onConflict: "user_id,word_id" },
      );
      if (error) throw error;
      return true;
    }

    const { error } = await supabase.from("user_bookmarks").upsert(
      items.map((item) => ({
        user_id: userId,
        word_key: item.id,
      })),
      { onConflict: "user_id,word_key" },
    );
    if (error) throw error;
    return true;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Auth learning remote upsert fallback:", error);
    }
    return false;
  }
}

async function deleteRemoteItem(kind: LearningKind, userId: string, id: string) {
  if (!hasSupabaseEnv()) return false;
  const config = learningKindConfig[kind];
  if (config.remote === "local") return false;

  try {
    const supabase = createClient();
    const result =
      config.remote === "progress"
        ? await supabase.from("user_progress").delete().eq("user_id", userId).eq("word_id", id)
        : await supabase.from("user_bookmarks").delete().eq("user_id", userId).eq("word_key", id);
    if (result.error) throw result.error;
    return true;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Auth learning remote delete fallback:", error);
    }
    return false;
  }
}

export async function mergeGuestLearningIntoUser(userId: string) {
  migrateLegacyLearningKeys();

  for (const kind of Object.keys(learningKindConfig) as LearningKind[]) {
    const guestItems = readItemsFromKey(getGuestStorageKey(kind));
    if (!guestItems.length) continue;

    const userKey = getUserStorageKey(kind, userId);
    const cachedItems = readItemsFromKey(userKey);
    const remoteItems = (await fetchRemoteItems(kind, userId)) ?? cachedItems;
    const mergedItems = dedupeItems([...guestItems, ...remoteItems, ...cachedItems]);

    await upsertRemoteItems(kind, userId, guestItems);
    writeItemsToKey(userKey, mergedItems);
    removeKey(getGuestStorageKey(kind));
  }
}

export async function readLearningState(kind: LearningKind): Promise<LearningState> {
  migrateLegacyLearningKeys();
  const userId = await getCurrentUserId();

  if (!userId) {
    const items = readItemsFromKey(getGuestStorageKey(kind));
    return { items, ids: getLearningIds(items), userId: null, isAuthenticated: false };
  }

  await mergeGuestLearningIntoUser(userId);

  const userKey = getUserStorageKey(kind, userId);
  const cachedItems = readItemsFromKey(userKey);
  const remoteItems = await fetchRemoteItems(kind, userId);
  const items = remoteItems ? dedupeItems(remoteItems) : cachedItems;
  writeItemsToKey(userKey, items);

  return { items, ids: getLearningIds(items), userId, isAuthenticated: true };
}

export async function toggleLearningItem(
  kind: LearningKind,
  item: StoredLearningItem | { id: string; label: string; itemType?: string; category?: string; href?: string },
): Promise<LearningState> {
  migrateLegacyLearningKeys();
  const userId = await getCurrentUserId();
  const normalizedItem = normalizeStoredItem(item);
  const key = userId ? getUserStorageKey(kind, userId) : getGuestStorageKey(kind);
  const currentItems = readItemsFromKey(key);
  const exists = currentItems.some((stored) => stored.id === normalizedItem.id);
  const nextItems = exists ? currentItems.filter((stored) => stored.id !== normalizedItem.id) : [normalizedItem, ...currentItems];

  if (userId) {
    if (exists) {
      await deleteRemoteItem(kind, userId, normalizedItem.id);
    } else {
      await upsertRemoteItems(kind, userId, [normalizedItem]);
    }
  }

  writeItemsToKey(key, nextItems);
  return { items: nextItems, ids: getLearningIds(nextItems), userId, isAuthenticated: Boolean(userId) };
}

export async function saveLearningItemForCurrentUser(
  kind: LearningKind,
  item: StoredLearningItem | { id: string; label: string; itemType?: string; category?: string; href?: string },
) {
  migrateLegacyLearningKeys();
  const userId = await getCurrentUserId();
  const key = userId ? getUserStorageKey(kind, userId) : getGuestStorageKey(kind);
  const normalizedItem = normalizeStoredItem(item);
  const currentItems = readItemsFromKey(key).filter((stored) => stored.id !== normalizedItem.id);
  const nextItems = [normalizedItem, ...currentItems];

  if (userId) {
    await upsertRemoteItems(kind, userId, [normalizedItem]);
  }

  writeItemsToKey(key, nextItems);
  return { items: nextItems, ids: getLearningIds(nextItems), userId, isAuthenticated: Boolean(userId) };
}

export function clearAccountLearningCache(userId: string) {
  if (!isBrowser()) return;
  for (const kind of Object.keys(learningKindConfig) as LearningKind[]) {
    removeKey(getUserStorageKey(kind, userId));
  }
}
