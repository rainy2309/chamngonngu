export const practiceStatsKey = "cham_practice_stats";

export type PracticeAttempt = {
  score: number;
  total: number;
  mode: string;
  practicedAt: string;
};

export type PracticeStats = {
  bestScore: number;
  bestTotal: number;
  totalSessions: number;
  lastPracticedAt: string | null;
  recentScores: PracticeAttempt[];
  reviewItems: string[];
};

export const emptyPracticeStats: PracticeStats = {
  bestScore: 0,
  bestTotal: 10,
  totalSessions: 0,
  lastPracticedAt: null,
  recentScores: [],
  reviewItems: [],
};

function isBrowser() {
  return typeof window !== "undefined";
}

export function readPracticeStats(): PracticeStats {
  if (!isBrowser()) return emptyPracticeStats;

  try {
    const parsed = JSON.parse(window.localStorage.getItem(practiceStatsKey) ?? "null") as Partial<PracticeStats> | null;
    if (!parsed || typeof parsed !== "object") return emptyPracticeStats;

    return {
      bestScore: Number(parsed.bestScore ?? 0),
      bestTotal: Number(parsed.bestTotal ?? 10),
      totalSessions: Number(parsed.totalSessions ?? 0),
      lastPracticedAt: typeof parsed.lastPracticedAt === "string" ? parsed.lastPracticedAt : null,
      recentScores: Array.isArray(parsed.recentScores) ? parsed.recentScores.slice(0, 5) as PracticeAttempt[] : [],
      reviewItems: Array.isArray(parsed.reviewItems) ? parsed.reviewItems.map(String) : [],
    };
  } catch {
    return emptyPracticeStats;
  }
}

export function savePracticeAttempt(attempt: PracticeAttempt) {
  if (!isBrowser()) return emptyPracticeStats;

  const current = readPracticeStats();
  const isNewBest = attempt.score > current.bestScore || (attempt.score === current.bestScore && attempt.total > current.bestTotal);
  const next: PracticeStats = {
    bestScore: isNewBest ? attempt.score : current.bestScore,
    bestTotal: isNewBest ? attempt.total : current.bestTotal,
    totalSessions: current.totalSessions + 1,
    lastPracticedAt: attempt.practicedAt,
    recentScores: [attempt, ...current.recentScores].slice(0, 5),
    reviewItems: current.reviewItems,
  };

  window.localStorage.setItem(practiceStatsKey, JSON.stringify(next));
  return next;
}

export function saveReviewItem(id: string) {
  if (!isBrowser()) return emptyPracticeStats;

  const current = readPracticeStats();
  const next: PracticeStats = {
    ...current,
    reviewItems: Array.from(new Set([id, ...current.reviewItems])).slice(0, 30),
  };
  window.localStorage.setItem(practiceStatsKey, JSON.stringify(next));
  return next;
}
