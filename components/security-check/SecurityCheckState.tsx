"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { ScanResult } from "@/lib/security-check/types";
import type { QuizAnswers } from "@/lib/security-check/quiz";

/**
 * Page state shared by the scan form, the results, the lead form and the
 * quiz. It lives in memory only: nothing is written to storage or cookies.
 */

export type ScanState = {
  scanId: string;
  result: ScanResult;
  signature: string | null;
  note: string | null;
  followups: boolean;
};

type Ctx = {
  scan: ScanState | null;
  setScan: (s: ScanState | null) => void;
  quiz: QuizAnswers | null;
  setQuiz: (q: QuizAnswers | null) => void;
};

const SecurityCheckContext = createContext<Ctx | null>(null);

export function SecurityCheckProvider({ children }: { children: ReactNode }) {
  const [scan, setScan] = useState<ScanState | null>(null);
  const [quiz, setQuiz] = useState<QuizAnswers | null>(null);
  const value = useMemo(() => ({ scan, setScan, quiz, setQuiz }), [scan, quiz]);
  return <SecurityCheckContext.Provider value={value}>{children}</SecurityCheckContext.Provider>;
}

export function useSecurityCheck(): Ctx {
  const ctx = useContext(SecurityCheckContext);
  if (!ctx) throw new Error("useSecurityCheck outside SecurityCheckProvider");
  return ctx;
}
