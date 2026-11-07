import { GoogleGenAI } from "@google/genai";

/**
 * Server-side Gemini client for the Digital Twin and Intelligent Pedagogical Agent.
 * Configured with telemetry header as required by the AI Studio environment.
 */
export const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});
