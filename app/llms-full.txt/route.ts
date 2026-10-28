import { llmsFullTxt } from "@/lib/llms-full";

export const dynamic = "force-static";

/** /llms-full.txt, written at build time from the site's own content (lib/llms-full.ts). */
export function GET() {
  return new Response(llmsFullTxt(), { headers: { "content-type": "text/plain; charset=utf-8" } });
}
