import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase payload bounds for draft backups and and asset handling
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// Lazy initializer for the modern Google GenAI SDK (prevents startup crashes)
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set. Please add it in Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// 1. Health check routing
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// 2. Server-side Gemini Content Generation Route
app.post("/api/gemini/generate", async (req, res) => {
  try {
    const { prompt, config, systemInstruction } = req.body;

    if (!prompt) {
      res.status(400).json({ error: "Missing required prompt parameter." });
      return;
    }

    const ai = getGeminiClient();

    // Call Gemini 3.5 Flash for writing & audit automation tasks (as per skill guidelines)
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        temperature: config?.temperature ?? 0.7,
        systemInstruction: systemInstruction ?? "You are an expert Jekyll CMS writing tutor, helping content creators draft, audit, and clean Jekyll blog posts.",
        maxOutputTokens: config?.maxTokens ?? 2000,
      },
    });

    const outputText = response.text;
    res.json({ text: outputText });
  } catch (error: any) {
    console.error("Gemini route error:", error);
    res.status(500).json({
      error: error.message || "An error occurred during text generation.",
    });
  }
});

async function startServer() {
  // Vite integration for rich live development experience
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development server middleware mounted.");
  } else {
    // Serve static files from compiled dist
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving build files in production mode.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Jekyll Forge Engine launched at http://localhost:${PORT}`);
  });
}

startServer();
