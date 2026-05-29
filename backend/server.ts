import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import Razorpay from "razorpay";
import nodemailer from "nodemailer";

// ─── Environment ────────────────────────────────────────────────────────────
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";

// Allowed origins for CORS
const ALLOWED_ORIGINS: string[] = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:4173", // vite preview
  "http://localhost:4174", // vite preview alternate
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://127.0.0.1:4173",
  "http://127.0.0.1:4174",
  "https://prepzify.vercel.app", // Production Vercel App
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
];

// ─── Gemini AI Client (lazy singleton) ──────────────────────────────────────
let genAI: GoogleGenAI | null = null;
let razorpay: Razorpay | null = null;

type PaidPlanId = "pro" | "pro-plus" | "elite";

const PAYMENT_PLANS: Record<
  PaidPlanId,
  {
    name: string;
    amount: number;
    currency: "INR";
    durationDays: number;
  }
> = {
  pro: {
    name: "Pro",
    amount: 19900,
    currency: "INR",
    durationDays: 30,
  },
  "pro-plus": {
    name: "Pro+",
    amount: 49900,
    currency: "INR",
    durationDays: 90,
  },
  elite: {
    name: "Elite",
    amount: 149900,
    currency: "INR",
    durationDays: 365,
  },
};

function getGenAI(): GoogleGenAI {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GEMINI_API_KEY environment variable is missing. " +
          "Please add it to backend/.env"
      );
    }
    genAI = new GoogleGenAI({ apiKey });
  }
  return genAI;
}

function getRazorpay(): Razorpay {
  if (!razorpay) {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_id || !key_secret) {
      throw new Error(
        "Razorpay credentials are missing. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to backend/.env"
      );
    }
    razorpay = new Razorpay({ key_id, key_secret });
  }
  return razorpay;
}

function isPaidPlanId(planId: unknown): planId is PaidPlanId {
  return typeof planId === "string" && planId in PAYMENT_PLANS;
}

// ─── App Setup ───────────────────────────────────────────────────────────────
const app = express();

// Security & parsing middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (server-to-server, Postman, etc.)
      if (!origin) return callback(null, true);
      // In development, allow all origins
      if (NODE_ENV !== "production") return callback(null, true);
      // Allow main Vercel origin, raw match, or Vercel preview domains
      if (ALLOWED_ORIGINS.includes(origin) || origin.endsWith(".vercel.app")) {
        return callback(null, true);
      }
      callback(new Error(`CORS: origin '${origin}' is not allowed.`));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" })); // allow large payloads (resume PDFs as base64)
app.use(express.urlencoded({ extended: true }));

// ─── Request Logger (dev only) ───────────────────────────────────────────────
if (NODE_ENV !== "production") {
  app.use((req: Request, _res: Response, next: NextFunction) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

// ─── Routes ──────────────────────────────────────────────────────────────────

/** API Root welcome route */
app.get("/", (_req: Request, res: Response) => {
  res.json({
    message: "Welcome to PrepZify API Engine",
    status: "online",
    healthCheck: "/api/health",
    paymentPlans: "/api/payments/plans",
    supportTicket: "/api/support/ticket"
  });
});

/** Health check */
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    env: NODE_ENV,
    hasApiKey: !!process.env.GEMINI_API_KEY,
    hasRazorpay: !!process.env.RAZORPAY_KEY_ID && !!process.env.RAZORPAY_KEY_SECRET,
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/payments/plans", (_req: Request, res: Response) => {
  res.json({
    plans: Object.entries(PAYMENT_PLANS).map(([id, plan]) => ({
      id,
      name: plan.name,
      amount: plan.amount,
      currency: plan.currency,
      durationDays: plan.durationDays,
    })),
  });
});

function isMockRazorpay(): boolean {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  return !key_id || !key_secret || key_id === 'rzp_test_your_key_id' || key_secret === 'your_razorpay_key_secret' || key_id.includes('dummy');
}

app.post("/api/payments/create-order", async (req: Request, res: Response) => {
  try {
    const { planId, userId, email } = req.body;
    if (!isPaidPlanId(planId)) {
      res.status(400).json({ error: "A valid paid planId is required" });
      return;
    }

    const plan = PAYMENT_PLANS[planId];

    if (isMockRazorpay()) {
      const orderId = `order_mock_${Math.random().toString(36).substring(2, 11)}`;
      res.json({
        orderId,
        amount: plan.amount,
        currency: plan.currency,
        plan: {
          id: planId,
          name: plan.name,
          durationDays: plan.durationDays,
        },
      });
      return;
    }

    const order = await getRazorpay().orders.create({
      amount: plan.amount,
      currency: plan.currency,
      receipt: `prepzify_${planId}_${Date.now()}`.slice(0, 40),
      notes: {
        planId,
        planName: plan.name,
        userId: userId || "",
        email: email || "",
      },
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      plan: {
        id: planId,
        name: plan.name,
        durationDays: plan.durationDays,
      },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unable to create Razorpay order";
    console.error("[/api/payments/create-order]", message);
    res.status(500).json({ error: message });
  }
});

app.post("/api/payments/verify", (req: Request, res: Response) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planId,
    } = req.body;

    if (!isPaidPlanId(planId)) {
      res.status(400).json({ error: "A valid paid planId is required" });
      return;
    }

    const plan = PAYMENT_PLANS[planId];
    const startedAt = new Date();
    const expiresAt = new Date(startedAt);
    expiresAt.setDate(expiresAt.getDate() + plan.durationDays);

    if (isMockRazorpay() || (razorpay_order_id && razorpay_order_id.startsWith('order_mock_'))) {
      res.json({
        verified: true,
        paymentId: razorpay_payment_id || `pay_mock_${Math.random().toString(36).substring(2, 11)}`,
        orderId: razorpay_order_id || `order_mock_${Math.random().toString(36).substring(2, 11)}`,
        plan: {
          id: planId,
          name: plan.name,
          amount: plan.amount,
          currency: plan.currency,
          durationDays: plan.durationDays,
        },
        subscription: {
          status: "active",
          startedAt: startedAt.toISOString(),
          expiresAt: expiresAt.toISOString(),
        },
      });
      return;
    }

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      res.status(400).json({ error: "Payment verification details are incomplete" });
      return;
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      throw new Error("RAZORPAY_KEY_SECRET is missing");
    }

    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      res.status(400).json({ error: "Invalid payment signature" });
      return;
    }

    res.json({
      verified: true,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      plan: {
        id: planId,
        name: plan.name,
        amount: plan.amount,
        currency: plan.currency,
        durationDays: plan.durationDays,
      },
      subscription: {
        status: "active",
        startedAt: startedAt.toISOString(),
        expiresAt: expiresAt.toISOString(),
      },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unable to verify payment";
    console.error("[/api/payments/verify]", message);
    res.status(500).json({ error: message });
  }
});

/**
 * Generic Gemini content generation.
 * Body: { model?, prompt, systemInstruction?, responseMimeType?, image? }
 */
app.post("/api/gemini/generate", async (req: Request, res: Response) => {
  try {
    const { model, prompt, systemInstruction, responseMimeType, image } =
      req.body;

    if (!prompt) {
      res.status(400).json({ error: "prompt is required" });
      return;
    }

    const ai = getGenAI();
    const parts: Array<Record<string, unknown>> = [];

    if (image?.data && image?.mimeType) {
      parts.push({
        inlineData: { data: image.data, mimeType: image.mimeType },
      });
    }
    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: model || "gemini-2.0-flash",
      contents: [{ role: "user", parts }],
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: responseMimeType || "text/plain",
      },
    });

    res.json({ text: response.text });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("[/api/gemini/generate]", message);
    res.status(500).json({ error: message });
  }
});

/**
 * Interview conversation endpoint.
 * Body: { history: Array<{ role: string; content: string }>, systemInstruction? }
 */
app.post("/api/gemini/interview", async (req: Request, res: Response) => {
  try {
    const { history, systemInstruction } = req.body;
    const ai = getGenAI();

    // ── Normalise history ──────────────────────────────────────────────────
    type GeminiPart = { text: string };
    type GeminiContent = { role: "user" | "model"; parts: GeminiPart[] };

    let contents: GeminiContent[] = [];

    if (Array.isArray(history)) {
      contents = history.map(
        (h: { role: string; content?: string; chunk?: string }) => ({
          role:
            h.role === "ai" || h.role === "model"
              ? ("model" as const)
              : ("user" as const),
          parts: [{ text: h.content || h.chunk || " " }],
        })
      );
    }

    // Gemini history must start with 'user'
    if (contents.length > 0 && contents[0].role === "model") {
      contents.unshift({ role: "user", parts: [{ text: "Let's begin." }] });
    }

    // Enforce strict role alternation
    const alternated: GeminiContent[] = [];
    let expected: "user" | "model" = "user";
    for (const msg of contents) {
      if (msg.role === expected) {
        alternated.push(msg);
      } else {
        alternated.push({ role: expected, parts: [{ text: "Ok." }] });
        alternated.push(msg);
      }
      expected = expected === "user" ? "model" : "user";
    }

    const finalContents: GeminiContent[] =
      alternated.length > 0
        ? alternated
        : [{ role: "user", parts: [{ text: "Hello, please start the interview." }] }];

    if (NODE_ENV !== "production") {
      console.log(
        "[/api/gemini/interview] contents:",
        JSON.stringify(finalContents)
      );
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: finalContents,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
      },
    });

    res.json({ text: response.text });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("[/api/gemini/interview]", message);
    res.status(500).json({ error: message });
  }
});

/**
 * Support Ticket Info endpoint
 */
app.get("/api/support/ticket", (_req: Request, res: Response) => {
  res.json({
    message: "Support ticket endpoint is active. Please use the POST method to submit a support ticket.",
    requiredFields: ["subject", "message"],
    optionalFields: ["email"],
    examplePayload: {
      subject: "technical",
      message: "Detailed description of the issue...",
      email: "user@example.com"
    }
  });
});

/**
 * Dispatch Support Ticket via Email
 * Body: { subject, message, email }
 */
app.post("/api/support/ticket", async (req: Request, res: Response) => {
  try {
    const { subject, message, email } = req.body;
    if (!subject || !message) {
      res.status(400).json({ error: "Subject and message are required" });
      return;
    }

    const senderEmail = email || "anonymous@prepzify.com";
    console.log(`[Support Ticket] New submission from ${senderEmail}:`);
    console.log(`   Subject: ${subject}`);
    console.log(`   Message: ${message}`);

    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    if (emailUser && emailPass) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: emailUser,
          pass: emailPass,
        },
      });

      const mailOptions = {
        from: `"Prepzify Support" <${emailUser}>`,
        to: "teamprepzify@gmail.com",
        replyTo: senderEmail,
        subject: `[Support Ticket] [${subject.toUpperCase()}] from ${senderEmail}`,
        text: `You have received a new support ticket.\n\nFrom: ${senderEmail}\nSubject: ${subject}\n\nMessage:\n${message}\n\n---\nSent automatically from Prepzify Backend.`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #6366f1; border-bottom: 2px solid #6366f1; padding-bottom: 10px;">New Support Ticket</h2>
            <p><strong>From:</strong> <a href="mailto:${senderEmail}">${senderEmail}</a></p>
            <p><strong>Category:</strong> ${subject.toUpperCase()}</p>
            <div style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #6366f1; margin: 20px 0; border-radius: 4px; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">
              ${message}
            </div>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p style="font-size: 11px; color: #64748b;">This email was automatically generated and sent from Prepzify Support System.</p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log(`[Support Ticket] Mail successfully sent to teamprepzify@gmail.com`);
    } else {
      console.log(
        `[Support Ticket] EMAIL_USER or EMAIL_PASS not set. Skipping real SMTP send. (Simulated Success)`
      );
    }

    res.json({ success: true, message: "Ticket successfully dispatched" });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("[/api/support/ticket]", errorMsg);
    res.status(500).json({ error: errorMsg });
  }
});

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" });
});

// ─── Global Error Handler ────────────────────────────────────────────────────
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("[Unhandled Error]", err.message);
  res.status(500).json({ error: err.message || "Internal server error" });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`\n🚀 Prepzify Backend`);
  console.log(`   Mode  : ${NODE_ENV}`);
  console.log(`   URL   : http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health\n`);
});

// ─── Graceful Shutdown ────────────────────────────────────────────────────────
function shutdown(signal: string) {
  console.log(`\n[${signal}] Shutting down gracefully…`);
  server.close(() => {
    console.log("Server closed.");
    process.exit(0);
  });
  // Force exit after 10 s if hanging
  setTimeout(() => process.exit(1), 10_000);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("uncaughtException", (err) => {
  console.error("[uncaughtException]", err);
  shutdown("uncaughtException");
});
process.on("unhandledRejection", (reason) => {
  console.error("[unhandledRejection]", reason);
});
