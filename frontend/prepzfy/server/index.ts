import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // Middleware
  app.use(cors());
  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => res.json({ status: "ok", version: "1.0.0" }));

  // Mock Data Endpoints (to be moved to controllers/routes later)
  app.get("/api/topics", (req, res) => {
    res.json([
      { id: 1, name: "Data Structures", description: "Arrays, Trees, Graphs" },
      { id: 2, name: "Algorithms", description: "Sorting, DP, Recursion" },
      { id: 3, name: "System Design", description: "Scalability and Architecture" }
    ]);
  });

  // Vite / Static Serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get("*", (req, res) => res.sendFile(path.join(distPath, "index.html")));
    } else {
      app.get("*", (req, res) => res.status(404).send("Production build not found."));
    }
  }

  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`[Backend] Server running on port ${PORT}`);
  });
}

startServer();
