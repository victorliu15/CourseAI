// backend/processCourses.mjs
import fs from "node:fs";
import path from "node:path";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve("../.env") });

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) throw new Error("Missing GEMINI_API_KEY env var.");

const MODEL_NAME = "gemini-2.5-flash";
const DATA_PATH = path.resolve("./classes.json");

// Wrap the whole logic in a function
export async function processCourses({
  sectionQuery,
  keywordQuery,
  nlQuery,
  limit,
}) {
  const limitArg = limit || null;

  // Load the raw catalog
  let raw;
  try {
    raw = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
  } catch (e) {
    throw new Error(`Failed to read ${DATA_PATH}: ${e.message}`);
  }
  if (!Array.isArray(raw)) throw new Error(`Expected an array in ${DATA_PATH}`);

  // Prefilter for section/keywords
  function matchesKeywords(course, q) {
    const hay = [
      course.course_section,
      course.course_name,
      course.summary,
      course.prerequisites,
      course.restrictions,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return hay.includes(q.toLowerCase());
  }

  let candidates = raw;
  if (sectionQuery) {
    candidates = candidates.filter(
      (c) =>
        (c.course_section || "").toLowerCase() === sectionQuery.toLowerCase()
    );
  }
  if (keywordQuery) {
    candidates = candidates.filter((c) => matchesKeywords(c, keywordQuery));
  }

  // Short-circuit if nothing matches and no nlQuery
  if (!nlQuery && candidates.length === 0) {
    return {
      query: {
        section: sectionQuery || null,
        keywords: keywordQuery || null,
        nl: null,
        limit: limitArg,
      },
      results: [],
      note: "No courses matched your query.",
    };
  }

  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    generationConfig: { responseMimeType: "application/json" },
  });

  const systemInstruction = `
You are a strict data selector/normalizer for a course catalog. You will receive:
1) A user question (natural language).
2) An array of raw course records (JSON). Use only this data—no outside facts.

Return JSON in EXACTLY this shape:
{
  "query": { "section": string|null, "keywords": string|null, "nl": string|null, "limit": number|null },
  "results": [
    {
      "course_section": string,
      "title": string,
      "credits": number|null,
      "prerequisites": string[],
      "restrictions": string[],
      "summary": string,
      "tags": string[]
    }
  ]
}
Only use data from the input array; do not hallucinate.`;

  const meta = {
    section: sectionQuery || null,
    keywords: keywordQuery || null,
    nl: nlQuery || null,
    limit: limitArg,
  };
  const dataForModel = nlQuery ? raw : candidates;

  const fullPrompt = `
UserQuestion: ${nlQuery || "(none)"}
MetaQuery: ${JSON.stringify(meta)}
RawCourseArray:
${JSON.stringify(dataForModel, null, 2)}
`;

  const resp = await model.generateContent(
    `${systemInstruction}\n\n${fullPrompt}`
  );
  const text = resp.response.text().trim();

  // Parse JSON
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) parsed = JSON.parse(match[0]);
    else throw new Error("Failed to parse JSON from model response");
  }

  if (limitArg && Array.isArray(parsed.results)) {
    parsed.results = parsed.results.slice(0, limitArg);
  }

  return parsed;
}
