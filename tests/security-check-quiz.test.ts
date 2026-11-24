import { describe, expect, it } from "vitest";
import { LOW_MAX, MAX_POINTS, MEDIUM_MAX, QUIZ, sanitizeAnswers, scoreQuiz } from "@/lib/security-check/quiz";

/** Pick, for every question, the option with this many points (or the nearest lower). */
function answersAt(target: (q: (typeof QUIZ)[number]) => string): Record<string, string> {
  return Object.fromEntries(QUIZ.map((q) => [q.id, target(q)]));
}
const best = (q: (typeof QUIZ)[number]) => q.options.reduce((a, b) => (b.points < a.points ? b : a)).id;
const worst = (q: (typeof QUIZ)[number]) => q.options.reduce((a, b) => (b.points > a.points ? b : a)).id;

describe("Shadow AI Risk Check scoring", () => {
  it("has the brief's ten questions, word for word", () => {
    expect(QUIZ.map((q) => q.text)).toEqual([
      "Do any staff use free ChatGPT, Claude, Gemini or similar at work?",
      "Has anyone pasted patient names, notes or insurance info into an AI tool?",
      "Do you have a written AI use policy?",
      "Do you have a BAA with every AI or software vendor that touches patient data?",
      "Can staff install apps on office computers without IT approval?",
      "Do you know which AI browser extensions are installed on office PCs?",
      "Is MFA on for email and your practice management system?",
      "When did staff last have security awareness training?",
      "Do former employees still have access to any accounts?",
      "Do you have tested backups of your practice management data?",
    ]);
  });

  it("Low: every safest answer", () => {
    const r = scoreQuiz(answersAt(best));
    expect(r).toMatchObject({ level: "Low", points: 0, answered: 10, topRisks: [] });
  });

  it("Low at the top of the band", () => {
    // free AI yes (3) + no policy (2) + extensions partly (1) = 6
    const a = { ...answersAt(best), free_ai: "yes", ai_policy: "no", ai_extensions_known: "partly" };
    const r = scoreQuiz(a);
    expect(r.points).toBe(LOW_MAX);
    expect(r.level).toBe("Low");
    expect(r.topRisks.map((t) => t.questionId)).toEqual(["free_ai", "ai_policy", "ai_extensions_known"]);
  });

  it("Medium: one point past Low", () => {
    const a = { ...answersAt(best), free_ai: "yes", ai_policy: "no", ai_extensions_known: "no" };
    const r = scoreQuiz(a);
    expect(r.points).toBe(LOW_MAX + 1);
    expect(r.level).toBe("Medium");
  });

  it("Medium at the top of the band", () => {
    // 3 + 2 + 3 (BAA) + 3 (MFA) + 3 (backups) = 14
    const a = { ...answersAt(best), free_ai: "yes", ai_policy: "no", baa_all_vendors: "no", mfa: "neither", tested_backups: "no" };
    const r = scoreQuiz(a);
    expect(r.points).toBe(MEDIUM_MAX);
    expect(r.level).toBe("Medium");
  });

  it("High: past Medium", () => {
    const a = { ...answersAt(best), free_ai: "yes", ai_policy: "no", baa_all_vendors: "no", mfa: "neither", tested_backups: "no", self_install: "unsure" };
    expect(scoreQuiz(a)).toMatchObject({ points: MEDIUM_MAX + 1, level: "High" });
  });

  it("High: every riskiest answer", () => {
    const r = scoreQuiz(answersAt(worst));
    expect(r).toMatchObject({ level: "High", points: MAX_POINTS });
    expect(r.topRisks).toHaveLength(3);
    expect(r.topRisks[0].questionId).toBe("patient_data_in_ai");
  });

  it("High whenever patient information went into an AI tool, whatever else is true", () => {
    const r = scoreQuiz({ ...answersAt(best), patient_data_in_ai: "yes" });
    expect(r.points).toBe(4);
    expect(r.level).toBe("High");
  });

  it("drops unknown questions and options", () => {
    expect(sanitizeAnswers({ free_ai: "yes", bogus: "x", mfa: "<script>", tested_backups: 3 })).toEqual({ free_ai: "yes" });
    expect(sanitizeAnswers(null)).toEqual({});
  });

  it("has no free-text answers anywhere", () => {
    for (const q of QUIZ) for (const o of q.options) expect(o.id).toMatch(/^[a-z0-9_]+$/);
  });
});
