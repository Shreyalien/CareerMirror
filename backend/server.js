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

// Smart key detection
const rawAnthropic = process.env.ANTHROPIC_API_KEY || "";
const rawGroq = process.env.GROQ_API_KEY || process.env.GROK_API_KEY || "";
const rawXai = process.env.XAI_API_KEY || "";

let ANTHROPIC_KEY = rawAnthropic.startsWith("sk-ant-") ? rawAnthropic : null;
let GROQ_KEY = rawGroq || (rawAnthropic.startsWith("gsk_") ? rawAnthropic : null);
let XAI_KEY = rawXai || (rawAnthropic.startsWith("xai-") ? rawAnthropic : null);

// Active provider
const PROVIDER = GROQ_KEY ? "groq" : ANTHROPIC_KEY ? "anthropic" : XAI_KEY ? "xai" : "local";

// Supported Groq models with graceful fallback
const GROQ_MODELS = ["qwen/qwen3.8-27b", "openai/gpt-oss-120b", "openai/gpt-oss-20b", "groq/compound"];

// Simple in-memory rate limiter (40 requests / 15 min / IP)
const hits = new Map();
function rateLimit(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const entry = hits.get(ip) || { count: 0, start: now };
  if (now - entry.start > windowMs) {
    entry.count = 0;
    entry.start = now;
  }
  entry.count += 1;
  hits.set(ip, entry);
  if (entry.count > 40) {
    return res.status(429).json({ error: "Rate limit reached. Please try again in a few minutes." });
  }
  next();
}

const PERSONAS = {
  startup: {
    name: "Startup Recruiter",
    voice:
      "You are a fast-talking startup recruiter who values hustle, side-projects, ownership, fast execution, and versatility over corporate credentials. You care about what the candidate has actually built and shipped. Casual tone, occasional dry humor, direct and punchy.",
  },
  faang: {
    name: "Big Tech Recruiter",
    voice:
      "You are a sharp technical recruiter at a Tier-1 tech company. You care deeply about system design exposure, scale, architectural rigor, performance optimizations, and precise quantified impact metrics. Tone is sharp, precise, and high-standard.",
  },
  mnc: {
    name: "MNC HR Manager",
    voice:
      "You are a formal HR manager at a multinational corporate enterprise. You value structure, standardized certifications, clear career progression, teamwork signals, and process discipline. Tone is professional, checklist-driven, structured, and polite.",
  },
  agency: {
    name: "Design Agency Director",
    voice:
      "You are a creative director at a world-class design studio. You care about visual taste, storytelling, portfolio polish, typography, and whether the candidate can defend creative decisions. Tone is opinionated, visual, and dramatic.",
  },
  freelance: {
    name: "Freelance Client",
    voice:
      "You are a non-technical business owner hiring a specialist for a critical project. You care about reliability signals, clear communication, business ROI, transparency, and trust. Tone is friendly, cautious, and practical.",
  },
  bank: {
    name: "Bank / Finance HR",
    voice:
      "You are a conservative HR officer at an investment bank. You value accuracy, risk mitigation, compliance, security discipline, and low-risk career stability. Tone is serious, formal, and risk-averse.",
  },
  cyber: {
    name: "Security Team Lead",
    voice:
      "You are a blunt security team lead. You value hands-on tool experience (Wireshark, Burp, Nmap), attention to detail, and healthy paranoia. You have zero tolerance for vague claims and respect concrete technical proof (CTFs, CVEs, lab writeups).",
  },
  ngo: {
    name: "NGO Program Coordinator",
    voice:
      "You are a warm program coordinator at an international NGO. You value empathy, human impact stories, mission alignment, adaptability, and doing great work with limited resources. Tone is human, inspiring, and grounded.",
  },
  consultancy: {
    name: "Consultancy Partner",
    voice:
      "You are a senior partner at a top management consultancy. You value structured MECE thinking, executive ownership language, quantifiable business impact, and zero wasted words. Tone is sharp, incisive, and high-standard.",
  },
};

function buildSystemPrompt(personaKey, mode, jobTarget) {
  const persona = PERSONAS[personaKey] || PERSONAS.startup;
  const modeInstruction =
    mode === "roast"
      ? `MODE: ROAST. Be witty, sarcastic, borderline savage — think high-intelligence comedy roast of their specific CV content. Never attack personal attributes; roast the resume claims, buzzwords, vagueness, or formatting flaws. No corporate sugarcoating, no emojis, no boilerplate.`
      : `MODE: COACH. Be warm, structured, highly tactical, and actionable. Provide concrete, high-leverage recommendations tailored specifically to what is in their CV. Zero emojis, zero sarcasm.`;

  return `${persona.voice}

${modeInstruction}

TARGET ROLE CANDIDATE IS PURSUING: "${jobTarget || "General Candidate"}".

CRITICAL EVALUATION RULES:
1. ALWAYS inspect and quote/reference the candidate's actual projects, job titles, metrics, or listed skills from their CV text.
2. NEVER give generic, copy-paste, or cookie-cutter advice. Every answer MUST be personalized to this specific candidate.
3. Speak directly to the candidate as "you".
4. Keep the answer concise, punchy, and under 180 words unless the user explicitly asks for an in-depth breakdown.
5. If the user asks a specific question (e.g. "What's my weakest skill?", "Why wouldn't you hire me?", "How do I fix my experience bullet?"), answer THAT EXACT question directly and decisively.`;
}

async function callGroq(system, messages) {
  let lastError = null;
  for (const model of GROQ_MODELS) {
    try {
      const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_KEY}`,
        },
        body: JSON.stringify({
          model,
          max_tokens: 550,
          temperature: 0.7,
          messages: [{ role: "system", content: system }, ...messages],
        }),
      });

      if (!resp.ok) {
        const errText = await resp.text();
        lastError = new Error(`Groq ${model} failed (${resp.status}): ${errText}`);
        continue;
      }

      const data = await resp.json();
      const content = data.choices?.[0]?.message?.content;
      if (content) return content;
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError || new Error("All Groq models failed");
}

async function callClaude(system, messages) {
  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-5",
      max_tokens: 550,
      system,
      messages,
    }),
  });
  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`Anthropic API error (${resp.status}): ${errText}`);
  }
  const data = await resp.json();
  const textBlock = data.content.find((b) => b.type === "text");
  return textBlock ? textBlock.text : "No response generated.";
}

async function callXai(system, messages) {
  const resp = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${XAI_KEY}`,
    },
    body: JSON.stringify({
      model: "grok-beta",
      max_tokens: 550,
      messages: [{ role: "system", content: system }, ...messages],
    }),
  });
  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`xAI Grok API error (${resp.status}): ${errText}`);
  }
  const data = await resp.json();
  return data.choices?.[0]?.message?.content || "No response generated.";
}

async function callAI(system, messages) {
  if (PROVIDER === "groq") return callGroq(system, messages);
  if (PROVIDER === "anthropic") return callClaude(system, messages);
  if (PROVIDER === "xai") return callXai(system, messages);
  throw new Error("No live AI provider configured");
}

app.post("/api/analyze", rateLimit, async (req, res) => {
  try {
    const { cvText, persona, mode, jobTarget } = req.body;
    if (!cvText || typeof cvText !== "string" || cvText.trim().length < 20) {
      return res.status(400).json({ error: "Please provide complete CV content." });
    }
    const skillFit = rankFields(cvText);

    let reply, engine, provider;
    if (PROVIDER !== "local") {
      try {
        const system = buildSystemPrompt(persona, mode, jobTarget);
        const userPrompt = mode === "roast"
          ? `Here is my complete CV:\n\n${cvText.slice(0, 6000)}\n\nGive me your initial roast assessment for the ${jobTarget || "specified"} role. Structure as 3 short numbered call-outs followed by one line starting with "Verdict:". Reference specific items from my text.`
          : `Here is my complete CV:\n\n${cvText.slice(0, 6000)}\n\nGive me your initial coach review for the ${jobTarget || "specified"} role. Structure as 3 concrete numbered action steps followed by one line starting with "Target Guidance:". Reference specific items from my text.`;

        const messages = [{ role: "user", content: userPrompt }];
        reply = await callAI(system, messages);
        engine = "live";
        provider = PROVIDER;
      } catch (err) {
        console.error(`${PROVIDER} API call failed:`, err.message);
      }
    }

    if (!reply) {
      reply = buildDemoAnalysis({ persona, mode, cvText, jobTarget, skillFit });
      engine = "local";
      provider = "local";
    }

    res.json({ reply, skillFit, engine, provider });
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

    let reply, engine, provider;
    if (PROVIDER !== "local") {
      try {
        const system = buildSystemPrompt(persona, mode, jobTarget);
        const messages = [
          {
            role: "user",
            content: `Here is my complete CV:\n\n${(cvText || "").slice(0, 6000)}\n\nTarget Role: ${jobTarget}. Note my exact CV projects and metrics.`,
          },
          { role: "assistant", content: `I have reviewed your CV through my lens as ${PERSONAS[persona]?.name || "a recruiter"}. What would you like to know?` },
          ...(Array.isArray(history) ? history.slice(-6) : []),
          { role: "user", content: question },
        ];
        reply = await callAI(system, messages);
        engine = "live";
        provider = PROVIDER;
      } catch (err) {
        console.error(`${PROVIDER} chat call failed:`, err.message);
      }
    }

    if (!reply) {
      reply = buildDemoFollowUp({ persona, mode, cvText, jobTarget, question, skillFit });
      engine = "local";
      provider = "local";
    }

    res.json({ reply, engine, provider });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong processing your message." });
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

    // 1) Google Docs
    const docsMatch = link.match(/docs\.google\.com\/document\/d\/([a-zA-Z0-9_-]+)/);
    if (docsMatch) {
      const resp = await fetch(`https://docs.google.com/document/d/${docsMatch[1]}/export?format=txt`);
      if (!resp.ok) {
        return res.status(400).json({
          error: "Couldn't fetch that Google Doc. Ensure sharing permission is 'Anyone with the link'.",
        });
      }
      const text = await resp.text();
      return res.json({ text: text.trim() });
    }

    // 2) Google Drive file
    const driveMatch =
      link.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/) || link.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (driveMatch && link.includes("drive.google.com")) {
      const resp = await fetch(`https://drive.google.com/uc?export=download&id=${driveMatch[1]}`);
      if (!resp.ok) {
        return res.status(400).json({
          error: "Couldn't fetch that Drive file. Ensure sharing permission is 'Anyone with the link'.",
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

    // 3) Direct URL
    const resp = await fetch(link);
    if (!resp.ok) {
      return res.status(400).json({ error: "Couldn't fetch that link. Check that it is public and reachable." });
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
    res.status(500).json({ error: "Something went wrong fetching document link." });
  }
});

app.get("/api/health", (req, res) => res.json({ ok: true, provider: PROVIDER }));

app.listen(PORT, () => {
  console.log(`CareerMirror backend running on http://localhost:${PORT}`);
  console.log(`AI Engine Provider: ${PROVIDER.toUpperCase()}`);
  if (PROVIDER === "groq") {
    console.log("Connected to Groq AI (Qwen / Llama / Compound) for live AI responses.");
  } else if (PROVIDER === "local") {
    console.log("No AI key found — using local rule-based heuristic engine.");
  }
});
