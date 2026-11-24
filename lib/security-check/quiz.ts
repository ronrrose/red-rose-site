/**
 * Shadow AI Risk Check: ten questions, scored entirely in the browser.
 *
 * It asks about habits and settings, never about patients. No answer is a
 * name, a note or a record, and the free-text field the brief does not ask
 * for is deliberately absent. Answers leave the browser only if the visitor
 * asks for the emailed report, and then only as part of that report.
 *
 * STATUS: question wording is Ron's (from the brief); answer options, points
 * and the risk explanations are a DRAFT awaiting his approval.
 */

export type QuizOption = { id: string; label: string; points: number };
export type QuizQuestion = {
  id: string;
  text: string;
  options: QuizOption[];
  /** Shown when this answer is one of the top risks. Plain English, no statistics. */
  risk: { title: string; explanation: string };
};

export const QUIZ_TIE_IN =
  "Free AI tools can keep and learn from what your staff type in. If that includes patient information, that is a HIPAA risk you may not know you have.";

export const QUIZ: QuizQuestion[] = [
  {
    id: "free_ai",
    text: "Do any staff use free ChatGPT, Claude, Gemini or similar at work?",
    options: [
      { id: "yes", label: "Yes", points: 3 },
      { id: "unsure", label: "Not sure", points: 2 },
      { id: "no", label: "No", points: 0 },
    ],
    risk: {
      title: "Staff use free AI tools at work",
      explanation:
        "Free versions of AI tools are built for individuals, not medical offices. They usually come without a business associate agreement, and what staff type may be kept by the provider.",
    },
  },
  {
    id: "patient_data_in_ai",
    text: "Has anyone pasted patient names, notes or insurance info into an AI tool?",
    options: [
      { id: "yes", label: "Yes", points: 4 },
      { id: "unsure", label: "Not sure", points: 3 },
      { id: "no", label: "No", points: 0 },
    ],
    risk: {
      title: "Patient information may have gone into an AI tool",
      explanation:
        "Once patient details are pasted into a tool with no business associate agreement, the practice no longer controls where they are stored or who can see them. That is the core of the Shadow AI risk.",
    },
  },
  {
    id: "ai_policy",
    text: "Do you have a written AI use policy?",
    options: [
      { id: "yes", label: "Yes", points: 0 },
      { id: "in_progress", label: "We are writing one", points: 1 },
      { id: "no", label: "No", points: 2 },
    ],
    risk: {
      title: "No written AI use policy",
      explanation:
        "Without a written policy, each person decides alone what is safe to paste into an AI tool. A one-page policy that names the approved tools and what never goes into them closes most of the gap.",
    },
  },
  {
    id: "baa_all_vendors",
    text: "Do you have a BAA with every AI or software vendor that touches patient data?",
    options: [
      { id: "yes", label: "Yes, every one", points: 0 },
      { id: "some", label: "Some of them", points: 2 },
      { id: "no", label: "No, or not sure", points: 3 },
    ],
    risk: {
      title: "Not every vendor has signed a business associate agreement",
      explanation:
        "HIPAA expects a business associate agreement with any vendor that handles patient information for you. A vendor without one is a gap in your paperwork and in your protection.",
    },
  },
  {
    id: "self_install",
    text: "Can staff install apps on office computers without IT approval?",
    options: [
      { id: "no", label: "No", points: 0 },
      { id: "unsure", label: "Not sure", points: 1 },
      { id: "yes", label: "Yes", points: 2 },
    ],
    risk: {
      title: "Staff can install apps without approval",
      explanation:
        "When anyone can install software, AI apps and browser add-ons arrive unnoticed, and some of them can read what is on the screen, including the practice management system.",
    },
  },
  {
    id: "ai_extensions_known",
    text: "Do you know which AI browser extensions are installed on office PCs?",
    options: [
      { id: "yes", label: "Yes", points: 0 },
      { id: "partly", label: "On some of them", points: 1 },
      { id: "no", label: "No", points: 2 },
    ],
    risk: {
      title: "Unknown AI browser extensions",
      explanation:
        "Browser extensions can often see every page a person opens, including web-based charts and billing portals. If you do not know which ones are installed, you cannot know what they can read.",
    },
  },
  {
    id: "mfa",
    text: "Is MFA on for email and your practice management system?",
    options: [
      { id: "both", label: "Yes, on both", points: 0 },
      { id: "one", label: "On one of them", points: 2 },
      { id: "neither", label: "Neither, or not sure", points: 3 },
    ],
    risk: {
      title: "Multi-factor sign-in is not on everywhere",
      explanation:
        "Without a second step at sign-in, one stolen or guessed password is enough to open email or patient records. Turning on MFA is one of the simplest protections a practice can add.",
    },
  },
  {
    id: "training",
    text: "When did staff last have security awareness training?",
    options: [
      { id: "12m", label: "In the last 12 months", points: 0 },
      { id: "1to2y", label: "One to two years ago", points: 1 },
      { id: "longer", label: "Longer ago, or never", points: 2 },
      { id: "unsure", label: "Not sure", points: 2 },
    ],
    risk: {
      title: "Security training is overdue",
      explanation:
        "Phishing emails and fake invoices are aimed at the front desk because that is where the access is. Short, regular training helps staff spot them, and the HIPAA Security Rule expects a security awareness program.",
    },
  },
  {
    id: "former_staff_access",
    text: "Do former employees still have access to any accounts?",
    options: [
      { id: "no", label: "No, we remove access on their last day", points: 0 },
      { id: "unsure", label: "Not sure", points: 2 },
      { id: "yes", label: "Yes", points: 3 },
    ],
    risk: {
      title: "Former staff may still have access",
      explanation:
        "An account that outlives the job is a door nobody is watching. Shared logins make it worse, because changing one password then affects everyone.",
    },
  },
  {
    id: "tested_backups",
    text: "Do you have tested backups of your practice management data?",
    options: [
      { id: "tested", label: "Yes, tested in the last six months", points: 0 },
      { id: "untested", label: "We back up, but have not tested a restore", points: 2 },
      { id: "no", label: "No, or not sure", points: 3 },
    ],
    risk: {
      title: "Backups are not proven to restore",
      explanation:
        "A backup only counts if it restores. An untested backup can fail at the worst moment, after ransomware or a failed server, when the practice needs its schedule and charts back the next morning.",
    },
  },
];

export type QuizAnswers = Record<string, string>;
export type RiskLevel = "Low" | "Medium" | "High";

export type QuizResult = {
  level: RiskLevel;
  points: number;
  maxPoints: number;
  answered: number;
  topRisks: Array<{ questionId: string; title: string; explanation: string }>;
};

export const MAX_POINTS = QUIZ.reduce((sum, q) => sum + Math.max(...q.options.map((o) => o.points)), 0);

/** Low up to this many points. */
export const LOW_MAX = 6;
/** Medium up to this many points; above is High. */
export const MEDIUM_MAX = 14;

/**
 * Score the quiz. A "Yes" to patient information in an AI tool is High on
 * its own: no other answer can offset that it already happened.
 */
export function scoreQuiz(answers: QuizAnswers): QuizResult {
  let points = 0;
  let answered = 0;
  const risky: Array<{ q: QuizQuestion; points: number; index: number }> = [];

  QUIZ.forEach((q, index) => {
    const opt = q.options.find((o) => o.id === answers[q.id]);
    if (!opt) return;
    answered += 1;
    points += opt.points;
    if (opt.points > 0) risky.push({ q, points: opt.points, index });
  });

  let level: RiskLevel = points <= LOW_MAX ? "Low" : points <= MEDIUM_MAX ? "Medium" : "High";
  if (answers.patient_data_in_ai === "yes") level = "High";

  risky.sort((a, b) => b.points - a.points || a.index - b.index);
  return {
    level,
    points,
    maxPoints: MAX_POINTS,
    answered,
    topRisks: risky.slice(0, 3).map(({ q }) => ({ questionId: q.id, title: q.risk.title, explanation: q.risk.explanation })),
  };
}

/** Keep only known question ids and option ids. Anything else is dropped. */
export function sanitizeAnswers(raw: unknown): QuizAnswers {
  const out: QuizAnswers = {};
  if (!raw || typeof raw !== "object") return out;
  for (const q of QUIZ) {
    const v = (raw as Record<string, unknown>)[q.id];
    if (typeof v === "string" && q.options.some((o) => o.id === v)) out[q.id] = v;
  }
  return out;
}
