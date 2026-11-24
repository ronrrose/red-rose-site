"use client";

import { useRef, useState, type FormEvent } from "react";
import { QUIZ, QUIZ_TIE_IN, scoreQuiz, type QuizAnswers, type QuizResult } from "@/lib/security-check/quiz";
import { RESULT_DISCLAIMER } from "@/lib/security-check/types";
import { useSecurityCheck } from "@/components/security-check/SecurityCheckState";
import { ReviewCta } from "@/components/security-check/ScanResults";

const LEVEL_STYLE: Record<QuizResult["level"], string> = {
  Low: "text-green-700 dark:text-green-400",
  Medium: "text-amber-700 dark:text-amber-300",
  High: "text-red-700 dark:text-red-400",
};

/**
 * Scored in the browser. Nothing is sent anywhere unless the visitor later
 * ticks the box to add their answers to the emailed report.
 */
export default function ShadowAiQuiz() {
  const { setQuiz, scan } = useSecurityCheck();
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [missing, setMissing] = useState<string[]>([]);
  const resultRef = useRef<HTMLDivElement>(null);
  const answered = QUIZ.filter((q) => answers[q.id]).length;

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const gaps = QUIZ.filter((q) => !answers[q.id]).map((q) => q.id);
    setMissing(gaps);
    if (gaps.length) {
      document.querySelector<HTMLInputElement>(`input[name="q-${gaps[0]}"]`)?.focus();
      return;
    }
    const r = scoreQuiz(answers);
    setResult(r);
    setQuiz(answers);
    requestAnimationFrame(() => resultRef.current?.focus());
  }

  return (
    <div>
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {QUIZ.map((q, i) => {
          const isMissing = missing.includes(q.id) && !answers[q.id];
          return (
            <fieldset
              key={q.id}
              className={`glass-card rounded-2xl p-5 md:p-6 ${isMissing ? "ring-2 ring-red-700 dark:ring-red-400" : ""}`}
              aria-describedby={isMissing ? `q-${q.id}-error` : undefined}
            >
              <legend className="sr-only">
                Question {i + 1} of {QUIZ.length}: {q.text}
              </legend>
              <p className="mb-3 text-base font-semibold text-ink" aria-hidden="true">
                <span className="text-accent">{i + 1}.</span> {q.text}
              </p>
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                {q.options.map((o) => {
                  const id = `q-${q.id}-${o.id}`;
                  const checked = answers[q.id] === o.id;
                  return (
                    <label
                      key={o.id}
                      htmlFor={id}
                      className={`flex min-h-[44px] cursor-pointer items-center gap-2 rounded-xl border px-4 py-2 text-sm transition-colors focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent ${
                        checked ? "border-accent bg-[var(--accent-bg)] font-semibold text-ink" : "border-line text-secondary hover:bg-raised"
                      }`}
                    >
                      <input
                        id={id}
                        type="radio"
                        name={`q-${q.id}`}
                        value={o.id}
                        checked={checked}
                        onChange={() => setAnswers({ ...answers, [q.id]: o.id })}
                        className="h-4 w-4 accent-[rgb(var(--color-accent))]"
                      />
                      {o.label}
                    </label>
                  );
                })}
              </div>
              {isMissing && (
                <p id={`q-${q.id}-error`} className="mt-2 text-sm font-medium text-red-700 dark:text-red-400">
                  Choose an answer for this question.
                </p>
              )}
            </fieldset>
          );
        })}
        <div className="flex flex-col items-center gap-3 pt-2 sm:flex-row sm:justify-between">
          <p className="text-sm text-faded" aria-live="polite">
            {answered} of {QUIZ.length} answered
          </p>
          <button
            type="submit"
            className="inline-flex min-h-[48px] w-full items-center justify-center rounded-xl bg-brand-700 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-brand-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-[.98] sm:w-auto"
          >
            See my risk level
          </button>
        </div>
      </form>

      {result && (
        <div ref={resultRef} tabIndex={-1} className="mt-8 space-y-6 focus:outline-none" aria-live="polite">
          <div className="glass-card rounded-2xl p-6 md:p-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-accent">Shadow AI risk</p>
            <p className={`mt-1 text-4xl font-bold ${LEVEL_STYLE[result.level]}`}>{result.level} risk</p>
            <p className="mt-4 text-base text-secondary [text-wrap:pretty]">{QUIZ_TIE_IN}</p>
            {result.topRisks.length > 0 && (
              <>
                <h3 className="mt-6 text-lg font-semibold text-ink">Your top {result.topRisks.length === 1 ? "risk" : `${result.topRisks.length} risks`}</h3>
                <ol className="mt-3 space-y-4">
                  {result.topRisks.map((r, i) => (
                    <li key={r.questionId}>
                      <p className="text-base font-semibold text-ink">
                        {i + 1}. {r.title}
                      </p>
                      <p className="text-sm text-secondary [text-wrap:pretty]">{r.explanation}</p>
                    </li>
                  ))}
                </ol>
              </>
            )}
            <p className="mt-6 text-sm text-faded">
              This quiz is based only on your answers. It is not a HIPAA risk analysis.
            </p>
            <p className="mt-1 text-sm text-faded">{RESULT_DISCLAIMER}</p>
            <p className="mt-4 text-sm text-secondary">
              {scan
                ? "To add these answers to your emailed report, tick the box above the report button."
                : "Run the website check above to get a full PDF report, and add these answers to it."}
            </p>
          </div>
          <ReviewCta />
        </div>
      )}
    </div>
  );
}
