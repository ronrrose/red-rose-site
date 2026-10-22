import { handleChatCompletions } from "@/lib/liveavatar-llm";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/*
 * LiveAvatar is configured with base_url /api/liveavatar/llm. Its docs do not
 * say whether it appends /chat/completions or /v1/chat/completions, so both
 * routes exist and share one handler.
 */
export const POST = handleChatCompletions;
