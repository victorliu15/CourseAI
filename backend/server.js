import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { processCourses } from "./processCourses.mjs";

// Needed for __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/courses", async (req, res) => {
  try {
    const { message } = req.body;
    const result = await processCourses({ nlQuery: message });
    res.json(result);
  } catch (err) {
    console.error("Error processing request:", err);
    res.status(500).json({ error: err.message || "Internal Server Error" });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
