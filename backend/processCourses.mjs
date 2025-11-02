import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve("../.env") });

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error("Missing GEMINI_API_KEY env var.");
  process.exit(1);
}

const MODEL_NAME = "gemini-2.5-flash";
const DATA_PATH = path.resolve("./classes.json");

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({
  model: MODEL_NAME,
  generationConfig: { responseMimeType: "application/json" },
});

export async function processCourses({
  sectionQuery,
  keywordQuery,
  nlQuery,
  limit,
}) {
  const limitArg = Number(limit || 0) || null;

  let raw;
  try {
    raw = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
  } catch (e) {
    throw new Error(`Failed to read ${DATA_PATH}: ${e.message}`);
  }
  if (!Array.isArray(raw)) throw new Error(`Expected an array in ${DATA_PATH}`);

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

  const systemInstruction = `
You are a strict data selector/normalizer for a course catalog. You will receive:
1) A user question (natural language).
2) An array of raw course records (JSON). Use only this data—no outside facts.

Your job: return JSON in EXACTLY this shape:
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
Only use input data, no hallucinations. Return ONLY JSON.`;

  const meta = {
    section: sectionQuery || null,
    keywords: keywordQuery || null,
    nl: nlQuery || null,
    limit: limitArg,
  };

  const dataForModel = nlQuery ? raw : candidates;
  const fullPrompt = `
UserQuestion: ${nlQuery ?? "(none)"}
MetaQuery: ${JSON.stringify(meta)}
RawCourseArray:
${JSON.stringify(dataForModel, null, 2)}
`;

  const resp = await model.generateContent(
    `${systemInstruction}\n\n${fullPrompt}`
  );
  const text = resp.response.text().trim();

  function extractJson(t) {
    const fenced = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenced) return fenced[1].trim();
    let depth = 0,
      start = -1;
    for (let i = 0; i < t.length; i++) {
      if (t[i] === "{") {
        if (depth === 0) start = i;
        depth++;
      } else if (t[i] === "}") {
        depth--;
        if (depth === 0 && start !== -1) return t.slice(start, i + 1);
      }
    }
    return t.trim();
  }

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    const candidate = extractJson(text)
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/[\u2018\u2019]/g, "'");
    parsed = JSON.parse(candidate);
  }

  if (limitArg && Array.isArray(parsed.results)) {
    parsed.results = parsed.results.slice(0, limitArg);
  }

  return parsed;
}

// If run directly (CLI), allow local testing
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  function getArg(flag) {
    const i = args.indexOf(flag);
    return i !== -1 ? args[i + 1] : undefined;
  }

  const sectionQuery = getArg("--section");
  const keywordQuery = getArg("--keywords");
  const nlQuery = getArg("--nl");
  const limit = getArg("--limit");

  processCourses({ sectionQuery, keywordQuery, nlQuery, limit })
    .then((result) => {
      console.log(JSON.stringify(result, null, 2));
    })
    .catch((err) => {
      console.error("Error:", err.message);
    });
}
