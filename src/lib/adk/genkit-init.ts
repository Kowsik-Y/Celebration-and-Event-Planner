import { googleAI } from "@genkit-ai/google-genai";
import { genkit } from "genkit";

/**
 * Initializes and exports the Google Genkit instance.
 * Automatically activates the googleAI plugin if GEMINI_API_KEY is present.
 */
export const ai = genkit({
  plugins: [googleAI()],
});
