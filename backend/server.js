import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pdfParse from "pdf-parse";
import { buildDemoAnalysis, buildDemoFollowUp } from "./heuristics.js";
import { rankFields } from "./skillsMap.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

const PORT = process.env.PORT || 5000;
const API_KEY = process.env.ANTHROPIC_API_KEY;

// ---- very simple in-memory rate limiter (20 requests / 15 min / IP) ----
const hits = new Map();
function rateLimit(req, res, next) {
  const ip = req.ip;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const entry = hits.get(ip) || { count: 0, start: now };
  if (now - entry.start > windowMs) {
    entry.count = 0;
    entry.start = now;
  }
  entry.count += 1;
  hits.set(ip, entry);
  if (entry.count > 20) {
    return res.status(429).json({ error: "Too many requests. Try again in a few minutes." });
  }
  next();
}

const PERSONAS = {
  startup: {
    name: "Startup Recruiter",
    voice:
      "You are a fast-talking startup recruiter who values hustle, side-projects, ownership, and versatility over polished credentials. You care about what the candidate has actually shipped. Casual tone, occasional dry humor.",
  },
  faang: {
    name: "Big Tech Recruiter",
    voice:
      "You are a sharp technical recruiter at a large tech company. You care about data structures/algorithms signals, system design exposure, scale, and precise, quantified impact. Tone is precise and a little intimidating, but fair.",
  },
  mnc: {
    name: "MNC HR Manager",
    voice:
      "You are a formal HR manager at a large multinational company. You value structure, certifications, clear metrics, communication skills, and process discipline. Tone is formal, checklist-driven, polite.",
  },
  agency: {
    name: "Design Agency Director",
    voice:
      "You are a creative director at a design agency. You care about visual taste, storytelling, portfolio polish, and whether the candidate can defend design decisions. Tone is opinionated and a bit dramatic.",
  },
  freelance: {
    name: "Freelance Client",
    voice:
      "You are a non-technical freelance client hiring for a project. You care about portfolio clarity, communication, reliability signals, and whether the CV builds trust quickly. Tone is friendly but cautious.",
  },
  bank: {
    name: "Bank / Finance HR",
    voice:
      "You are a conservative HR officer at a bank. You value discipline, accuracy, compliance awareness, and low-risk, stable career signals. Tone is serious and risk-averse.",
  },
  cyber: {
    name: "Security Team Lead",
    voice:
      "You are a blunt security team lead hiring for a cybersecurity role. You value hands-on tool experience, attention to detail, and healthy paranoia. You are suspicious of vague claims and respect proof (CTFs, labs, writeups).",
  },
  ngo: {
    name: "NGO Program Coordinator",
    voice:
      "You are a warm program coordinator at an NGO. You value impact stories, adaptability, empathy, and ability to work with limited resources. Tone is human and mission-driven, not corporate.",
  },
  consultancy: {
    name: "Consultancy Partner",
    voice:
      "You are a partner at a management consultancy. You value structured thinking, ownership language, and polish. You have zero patience for wasted words. Tone is sharp and high-standard.",
  },
};

function buildSystemPrompt(personaKey, mode, jobTarget) {
  const persona = PERSONAS[personaKey] || PERSONAS.startup;
  const modeInstruction =
    mode === "roast"
      ? `Mode: ROAST. Structure your first reply as exactly 3 short numbered "burns" (each under 20 words, prefixed with 🔥), followed by one blunt one-line verdict prefixed with 💀. Be witty, sarcastic, borderline savage — think comedy roast, not HR feedback. Never cruel about anything personal (appearance, background) — only roast the CV content itself. No formal language, no "I hope this helps."`
      : `Mode: COACH. Structure your first reply as exactly 3 numbered action steps (prefixed with ✅), each concrete and doable this week, followed by one encouraging one-line summary prefixed with 🎯. Warm, structured, zero sarcasm.`;
  return `${persona.voice}
${modeInstruction}
The candidate is targeting this kind of role: ${jobTarget || "not specified"}.
Always respond in under 180 words unless asked for more detail. Speak directly to the candidate as "you". For follow-up questions (not the first message), you can drop the numbered structure and just answer directly in the same voice and mode.`;
}

async function callClaude(system, messages) {
  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 500,
      system,
      messages,
    }),
  });
  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`Anthropic API error: ${resp.status} ${errText}`);
  }
  const data = await resp.json();
  const textBlock = data.content.find((b) => b.type === "text");
  return textBlock ? textBlock.text : "No response generated.";
}

app.post("/api/analyze", rateLimit, async (req, res) => {
  try {
    const { cvText, persona, mode, jobTarget } = req.body;
    if (!cvText || typeof cvText !== "string" || cvText.trim().length < 20) {
      return res.status(400).json({ error: "Paste more CV content (at least a few lines)." });
    }
    const skillFit = rankFields(cvText);

    if (!API_KEY) {
      const reply = buildDemoAnalysis({ persona, mode, cvText, jobTarget, skillFit });
      return res.json({ reply, skillFit, engine: "local" });
    }

    const system = buildSystemPrompt(persona, mode, jobTarget);
    const messages = [
      {
        role: "user",
        content: `Here is my CV:\n\n${cvText.slice(0, 6000)}\n\nGive me your first-impression feedback.`,
      },
    ];
    const reply = await callClaude(system, messages);
    res.json({ reply, skillFit, engine: "live" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong analyzing the CV." });
  }
});

app.post("/api/chat", rateLimit, async (req, res) => {
  try {
    const { cvText, persona, mode, jobTarget, history, question } = req.body;
    if (!question || typeof question !== "string") {
      return res.status(400).json({ error: "Missing question." });
    }
    const skillFit = rankFields(cvText);

    if (!API_KEY) {
      const reply = buildDemoFollowUp({ persona, mode, cvText, jobTarget, question, skillFit });
      return res.json({ reply, engine: "local" });
    }

    const system = buildSystemPrompt(persona, mode, jobTarget);
    const messages = [
      {
        role: "user",
        content: `Here is my CV:\n\n${(cvText || "").slice(0, 6000)}`,
      },
      { role: "assistant", content: "Got it, I've reviewed your CV." },
      ...(Array.isArray(history) ? history.slice(-8) : []),
      { role: "user", content: question },
    ];
    const reply = await callClaude(system, messages);
    res.json({ reply, engine: "live" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong." });
  }
});

app.post("/api/career-fit", rateLimit, (req, res) => {
  const { cvText } = req.body;
  if (!cvText) return res.status(400).json({ error: "Missing CV text." });
  res.json({ ranking: rankFields(cvText) });
});

app.post("/api/fetch-link", rateLimit, async (req, res) => {
  try {
    const { link } = req.body;
    if (!link || typeof link !== "string") {
      return res.status(400).json({ error: "Missing link." });
    }

    // 1) Google Docs (text document) — export as plain text
    const docsMatch = link.match(/docs\.google\.com\/document\/d\/([a-zA-Z0-9_-]+)/);
    if (docsMatch) {
      const resp = await fetch(`https://docs.google.com/document/d/${docsMatch[1]}/export?format=txt`);
      if (!resp.ok) {
        return res.status(400).json({
          error: "Couldn't fetch that Google Doc. Make sure sharing is 'Anyone with the link'.",
        });
      }
      const text = await resp.text();
      return res.json({ text: text.trim() });
    }

    // 2) Google Drive file (PDF/DOCX uploaded to Drive) — direct download
    const driveMatch =
      link.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/) || link.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (driveMatch && link.includes("drive.google.com")) {
      const resp = await fetch(`https://drive.google.com/uc?export=download&id=${driveMatch[1]}`);
      if (!resp.ok) {
        return res.status(400).json({
          error: "Couldn't fetch that Drive file. Make sure sharing is 'Anyone with the link'.",
        });
      }
      const contentType = resp.headers.get("content-type") || "";
      const buffer = Buffer.from(await resp.arrayBuffer());
      if (contentType.includes("pdf") || link.toLowerCase().includes(".pdf")) {
        const parsed = await pdfParse(buffer);
        return res.json({ text: parsed.text.trim() });
      }
      return res.json({ text: buffer.toString("utf-8").trim() });
    }

    // 3) Any other direct link — PDF or plain text hosted somewhere
    const resp = await fetch(link);
    if (!resp.ok) {
      return res.status(400).json({ error: "Couldn't fetch that link. Check it's public and reachable." });
    }
    const contentType = resp.headers.get("content-type") || "";
    if (contentType.includes("pdf") || link.toLowerCase().includes(".pdf")) {
      const buffer = Buffer.from(await resp.arrayBuffer());
      const parsed = await pdfParse(buffer);
      return res.json({ text: parsed.text.trim() });
    }
    const text = await resp.text();
    res.json({ text: text.trim() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong fetching that link." });
  }
});

app.get("/api/health", (req, res) => res.json({ ok: true, hasKey: Boolean(API_KEY) }));

app.listen(PORT, () => {
  console.log(`CareerMirror backend running on http://localhost:${PORT}`);
  if (!API_KEY) {
    console.log("No ANTHROPIC_API_KEY found — running in demo/mock mode.");
  }
});
