// src/actions/todoActions.ts

"use server"; // <-- 1. CRITICAL: Marks all functions in this file as server-only

import { OpenAI } from "openai";

// 2. Initialize OpenAI client with the secret key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generates a list of to-do items from a user prompt.
 * @param prompt The user's request (e.g., "things to pack for a beach trip").
 * @returns A promise resolving to an array of string to-do items.
 */
export async function generateTodosFromPrompt(
  prompt: string
): Promise<string[]> {
  if (!prompt || prompt.length < 5) return [];

  // 3. Define the instructions for the AI
  const systemPrompt = `You are a helpful to-do list assistant. 
    Convert the user's request into a simple, comma-separated list of 
    short to-do items. ONLY return the comma-separated list of items 
    with no extra text, numbering, or introductory phrases.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      temperature: 0.5,
    });

    const aiResponseText = response.choices[0].message.content;

    // 4. Parse the comma-separated string into an array
    if (aiResponseText) {
      return aiResponseText
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
    }

    return [];
  } catch (error) {
    // Log the error to your server console
    console.error("OpenAI API Error:", error);
    return ["Error: Failed to connect to AI helper."];
  }
}
