import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let genAI: GoogleGenAI | null = null;

function getGenAI() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing. Please configure it in the AI Studio Settings.");
    }
    genAI = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return genAI;
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", hasApiKey: !!process.env.GEMINI_API_KEY, length: process.env.GEMINI_API_KEY?.length });
  });

  app.post("/api/gemini/generate", async (req, res) => {
    try {
      const { model, prompt, systemInstruction, responseMimeType, image } = req.body;
      const ai = getGenAI();
      
      const parts: any[] = [];
      if (image) {
        parts.push({
          inlineData: {
            data: image.data,
            mimeType: image.mimeType
          }
        });
      }
      parts.push({ text: prompt });

      const response = await ai.models.generateContent({
        model: model || "gemini-3-flash-preview",
        contents: [{ role: "user", parts }],
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: responseMimeType || "text/plain",
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini Server Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/gemini/interview", async (req, res) => {
    try {
      const { history, systemInstruction } = req.body;
      const ai = getGenAI();
      
      let contents: any[] = [];
      if (Array.isArray(history)) {
        contents = history.map((h: any) => ({
          role: h.role === 'ai' || h.role === 'model' ? 'model' : 'user',
          parts: [{ text: h.content || h.chunk || " " }]
        }));
      }

      console.log("INCOMING HISTORY FOR /api/gemini/interview: ", JSON.stringify(history));

      // Gemini history must start with 'user'
      if (contents.length > 0 && contents[0].role === 'model') {
        contents.unshift({
          role: 'user',
          parts: [{ text: "Let's begin." }]
        });
      }

      // Gemini history roles MUST alternate
      let alternatedContents = [];
      let expectedRole = 'user';
      for (let i = 0; i < contents.length; i++) {
        if (contents[i].role === expectedRole) {
          alternatedContents.push(contents[i]);
          expectedRole = expectedRole === 'user' ? 'model' : 'user';
        } else {
          // Instead of dropping, we can try to merge with previous, or insert a dummy message
          if (expectedRole === 'model') {
            alternatedContents.push({ role: 'model', parts: [{ text: "Ok." }] });
          } else {
            alternatedContents.push({ role: 'user', parts: [{ text: "Ok." }] });
          }
          alternatedContents.push(contents[i]);
          expectedRole = contents[i].role === 'user' ? 'model' : 'user';
        }
      }
      contents = alternatedContents;

      console.log("FINAL CONTENTS FOR GEMINI: ", JSON.stringify(contents));

      if (contents.length === 0) {
        contents = [{
          role: "user",
          parts: [{ text: "Hello, please start the interview." }]
        }];
      }

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini Interview Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
