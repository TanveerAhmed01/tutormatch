import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration - Allow both local and production URLs
app.use(cors({
  origin: [
    "http://localhost:5174",
    "http://localhost:3000",
    process.env.FRONTEND_URL || "https://tutormatch.vercel.app"
  ],
  credentials: true
}));

app.use(express.json());

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// Verify API key exists
if (!OPENROUTER_API_KEY && process.env.NODE_ENV === "production") {
  console.error("❌ OPENROUTER_API_KEY not set!");
}

// Health check
app.get("/", (req, res) => {
  res.json({ 
    message: "✅ TutorMatch Backend Running",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// ─── QUESTION GENERATION ENDPOINT ───
app.post("/api/generate-questions", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    if (!OPENROUTER_API_KEY) {
      return res.status(500).json({ error: "API key not configured" });
    }

    console.log("📝 Generating questions...");

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer": process.env.FRONTEND_URL || "https://tutormatch.vercel.app",
        },
        body: JSON.stringify({
          model: "openai/gpt-3.5-turbo",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error("OpenRouter Error:", response.status, errorData);
      throw new Error(`OpenRouter error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("✅ Questions generated");

    const text =
      data.choices?.[0]?.message?.content ||
      JSON.stringify(data);

    res.json({
      content: [
        {
          type: "text",
          text: text,
        },
      ],
    });
  } catch (error) {
    console.error("Full Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ─── TUTOR MATCHING ENDPOINT ───
app.post("/api/match-tutors", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    if (!OPENROUTER_API_KEY) {
      return res.status(500).json({ error: "API key not configured" });
    }

    console.log("🎯 Matching tutors...");

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer": process.env.FRONTEND_URL || "https://tutormatch.vercel.app",
        },
        body: JSON.stringify({
          model: "openai/gpt-3.5-turbo",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error("OpenRouter Error:", response.status, errorData);
      throw new Error(`OpenRouter error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("✅ Tutors matched");

    const text =
      data.choices?.[0]?.message?.content ||
      JSON.stringify(data);

    res.json({
      content: [
        {
          type: "text",
          text: text,
        },
      ],
    });
  } catch (error) {
    console.error("Full Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Error handling
app.use((err, req, res) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🎉 Backend running on port ${PORT}`);
  console.log(`📝 Using OpenRouter API`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}\n`);
});

export default app;