import fs from "node:fs";
import path from "node:path";
import { cities } from "@/lib/city-data";
import {
  aiConsultantLakewoodRanchFaqs,
  dentalLakewoodRanchFaqs,
  homeFaqs,
  type Faq,
} from "@/lib/faq-data";
import { SITE_URL } from "@/lib/site-config";

/**
 * /llms-full.txt: public/llms.txt (the short map) followed by the full FAQ
 * text from the pages that read only vetted claims (lib/red-rose-knowledge.ts),
 * assembled at build time from the same arrays the pages render, so the file
 * cannot say something the site does not.
 */

function faqs(title: string, url: string, list: Faq[]): string {
  return [`### ${title}`, "", url, ...list.flatMap((f) => ["", `#### ${f.question}`, "", f.answer])].join("\n");
}

export function llmsFullTxt(): string {
  const summary = fs.readFileSync(path.join(process.cwd(), "public", "llms.txt"), "utf8").trimEnd();
  const sections = [
    summary,
    [
      "## Frequently asked questions",
      "",
      faqs("Dental practices", `${SITE_URL}/`, homeFaqs),
      "",
      faqs("Dental IT in Lakewood Ranch", `${SITE_URL}/dental-it/lakewood-ranch`, dentalLakewoodRanchFaqs),
      "",
      faqs("AI consultant in Lakewood Ranch", `${SITE_URL}/ai-consultant/lakewood-ranch`, aiConsultantLakewoodRanchFaqs),
    ].join("\n"),
    [
      "## Managed IT by city",
      "",
      ...cities.map((c) => `- ${c.name}, ${c.county} County: ${SITE_URL}/managed-it/${c.slug}`),
    ].join("\n"),
  ];
  return sections.join("\n\n") + "\n";
}
