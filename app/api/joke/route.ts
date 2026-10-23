import { generateJoke } from "@/lib/joke";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_BODY_BYTES = 1024;
const MAX_TOPIC_LENGTH = 100;

type ErrorCode =
  | "INVALID_INPUT"
  | "CONTENT_REFUSED"
  | "GENERATION_FAILED"
  | "INTERNAL_ERROR";

const STATUS_BY_ERROR: Record<ErrorCode, number> = {
  INVALID_INPUT: 400,
  CONTENT_REFUSED: 422,
  GENERATION_FAILED: 502,
  INTERNAL_ERROR: 500,
};

function errorResponse(error: ErrorCode, startedAt: number) {
  // Operational logging only — never the topic or the joke.
  console.warn(`[api/joke] ${error} after ${Date.now() - startedAt}ms`);
  return Response.json({ error }, { status: STATUS_BY_ERROR[error] });
}

// Returns the trimmed topic, or null when the body is invalid.
function parseTopic(raw: string): string | null {
  if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) return null;

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return null;
  }

  const topic = (body as { topic?: unknown }).topic;
  if (topic === undefined || topic === null) return "";
  if (typeof topic !== "string") return null;

  const trimmed = topic.trim();
  return trimmed.length > MAX_TOPIC_LENGTH ? null : trimmed;
}

export async function POST(request: Request) {
  const startedAt = Date.now();
  try {
    const topic = parseTopic(await request.text());
    if (topic === null) return errorResponse("INVALID_INPUT", startedAt);

    if (!process.env.OPENAI_API_KEY) {
      return errorResponse("INTERNAL_ERROR", startedAt);
    }

    const result = await generateJoke(topic);
    if (!result.ok) return errorResponse(result.error, startedAt);

    return Response.json({ joke: result.joke });
  } catch {
    return errorResponse("INTERNAL_ERROR", startedAt);
  }
}
