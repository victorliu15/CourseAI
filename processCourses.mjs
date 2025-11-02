import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error("Missing GEMINI_API_KEY env var.");
  process.exit(1);
}

// Use a model name exactly as listed by your key (no "models/" prefix)
const MODEL_NAME = "gemini-2.5-flash";

const DATA_PATH = path.resolve("./classes.json");
const OUT_PATH = path.resolve("./course_output.json");

const args = process.argv.slice(2);
function getArg(flag) {
  const i = args.indexOf(flag);
  return i !== -1 ? args[i + 1] : undefined;
}
const sectionQuery = getArg("--section");
const keywordQuery = getArg("--keywords");
if (!sectionQuery && !keywordQuery) {
  console.error('Provide --section <COURSE_ID> or --keywords "search terms".');
  process.exit(1);
}

let raw;
try {
  raw = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
} catch (e) {
  console.error(`Failed to read ${DATA_PATH}:`, e.message);
  process.exit(1);
}
if (!Array.isArray(raw)) {
  console.error(`Expected an array in ${DATA_PATH}.`);
  process.exit(1);
}

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
    (c) => (c.course_section || "").toLowerCase() === sectionQuery.toLowerCase()
  );
}
if (keywordQuery) {
  candidates = candidates.filter((c) => matchesKeywords(c, keywordQuery));
}

if (candidates.length === 0) {
  const msg = {
    query: { section: sectionQuery || null, keywords: keywordQuery || null },
    results: [],
    note: "No courses matched your query.",
  };
  fs.writeFileSync(OUT_PATH, JSON.stringify(msg, null, 2));
  console.log(JSON.stringify(msg, null, 2));
  process.exit(0);
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({
  model: MODEL_NAME,
  generationConfig: { responseMimeType: "application/json" },
});

const systemInstruction = `
You are a data normalizer for a course catalog. 
From the provided raw course records, produce a JSON object with:
{
  "query": { "section": string|null, "keywords": string|null },
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
- Keep facts faithful to the input; avoid hallucinations.
- If a field is "N/A" or missing, use null or [] as appropriate.
- Return ONLY the JSON (no markdown).
`;

async function main() {
  const fullPrompt = `
${systemInstruction}

Query:
${JSON.stringify({ sectionQuery, keywordQuery })}

Raw course data:
${JSON.stringify(candidates, null, 2)}
`;

  const resp = await model.generateContent(fullPrompt);
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

  fs.writeFileSync(OUT_PATH, JSON.stringify(parsed, null, 2));
  console.log(JSON.stringify(parsed, null, 2));
}

main().catch((err) => {
  console.error("Error:", err?.message || err);
  process.exit(1);
});
