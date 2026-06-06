"use client";

import type { TripCase } from "./ops";

const STORAGE_KEY = "yozu.opsCases";

export function readStoredCases(): TripCase[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeStoredCases(cases: TripCase[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
}

export function upsertStoredCase(nextCase: TripCase) {
  const current = readStoredCases();
  const filtered = current.filter((item) => item.id !== nextCase.id);
  writeStoredCases([nextCase, ...filtered]);
}
