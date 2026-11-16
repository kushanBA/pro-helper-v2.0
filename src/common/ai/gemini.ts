import { env } from "../../config/env.ts";
import { AppError } from "../errors/app-error.ts";

const MODEL = "gemini-2.5-flash";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
const TIMEOUT_MS = 12_000;

// Minimal shape of the parts of the Gemini response we read.
type GeminiResponse = {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
};

export function isAiConfigured(): boolean {
  return Boolean(env.GEMINI_API_KEY);
}

// Sends the prompt to Gemini in JSON mode and returns the parsed JSON value.
// The caller is responsible for validating the shape of what comes back.
export async function generateJson(prompt: string): Promise<unknown> {
  if (!env.GEMINI_API_KEY) {
    throw new AppError(503, "AI suggestions are not configured");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${ENDPOINT}?key=${env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.2 },
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new AppError(502, "AI service returned an error");
    }

    const data = (await response.json()) as GeminiResponse;
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof text !== "string") {
      throw new AppError(502, "AI service returned no result");
    }

    return JSON.parse(text);
  } catch (err) {
    if (err instanceof AppError) throw err;
    // Timeout, network error, or invalid JSON from the model.
    throw new AppError(502, "Could not get AI suggestions, please try again");
  } finally {
    clearTimeout(timeout);
  }
}
