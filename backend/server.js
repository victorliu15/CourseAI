import express from "express";
import cors from "cors";
import { processCourses } from "./processCourses.mjs";
import dotenv from "dotenv";
import path from "node:path";

dotenv.config({ path: path.resolve("../.env") });

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/courses", async (req, res) => {
  const { query } = req.body; // this comes from Chat.js
  try {
    // Pass it as `keywordQuery` to processCourses
    const data = await processCourses({ keywordQuery: query });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
