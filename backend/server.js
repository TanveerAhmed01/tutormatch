import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// Health check
app.get("/", (req, res) => {
  res.json({ message: "✅ Backend using OpenRouter API" });
});

// ─── QUESTION GENERATION ENDPOINT ───
app.post("/api/generate-questions", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    console.log("Calling OpenRouter API...");

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer": "http://localhost:3001",
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
    console.log("OpenRouter Response:", data);

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

    console.log("Calling OpenRouter API for tutor matching...");

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer": "http://localhost:3001",
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
    console.log("OpenRouter Response:", data);

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

// Start server
app.listen(PORT, () => {
  console.log(`\n🎉 Backend running at http://localhost:3001`);
  console.log(`📝 Using OpenRouter API with GPT-3.5-Turbo\n`);
});