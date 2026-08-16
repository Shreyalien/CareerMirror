import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { PERSONAS, FUNNY_LOADING_LINES } from "../data/personas";
import { computeSkillGap, rankCareerFit } from "../data/skillsDB";
import { computeHealthMetrics, SKILL_ROADMAP } from "../data/cvMetrics";
import TypewriterText from "./Typewriter.jsx";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const SUGGESTED_QUESTIONS = [
  "Why wouldn't you hire me?",
  "What's my weakest skill?",
  "What's my strongest skill?",
  "Which field fits me better?",
  "What should I fix first?",
];

function CustomTooltip({ active, payload, accent }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "#141826",
        border: `1px solid ${accent}`,
        borderRadius: 10,
        padding: "8px 12px",
        fontSize: 12,
        color: "#D8DCEA",
      }}
    >
      <div style={{ fontWeight: 600 }}>{payload[0].payload.skill}</div>
      <div style={{ color: accent }}>{payload[0].value}/100</div>
    </div>
  );
}

function FunnyLoader() {
  const [lineIndex, setLineIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setLineIndex((i) => (i + 1) % FUNNY_LOADING_LINES.length), 1300);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {[0, 1, 2].map((d) => (
          <motion.span
            key={d}
            className="w-1.5 h-1.5 rounded-full bg-mist"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ repeat: Infinity, duration: 1, delay: d * 0.2 }}
          />
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.span
          key={lineIndex}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          className="text-mist text-xs italic"
        >
          {FUNNY_LOADING_LINES[lineIndex]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

function MetricBar({ label, score, hint, accent, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-panel border border-line rounded-xl p-4"
    >
      <div className="flex justify-between items-baseline mb-2">
        <span className="text-cloud text-sm font-medium">{label}</span>
        <span className="font-display font-semibold text-sm" style={{ color: accent }}>
          {score}
        </span>
      </div>
      <div className="h-2 rounded-full bg-panel2 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: accent }}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, delay: delay + 0.2, ease: "easeOut" }}
        />
      </div>
      <p className="text-mist text-xs mt-2">{hint}</p>
    </motion.div>
  );
}

function FitBar({ field, score, isTarget, accent, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="mb-3"
    >
      <div className="flex justify-between text-xs mb-1">
        <span className={`font-medium ${isTarget ? "text-cloud" : "text-mist"}`}>
          {field} {isTarget && <span style={{ color: accent }}>← your target</span>}
        </span>
        <span className="text-mist">{score}%</span>
      </div>
      <div className="h-2.5 rounded-full bg-panel2 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: isTarget ? accent : "#3A4058" }}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, delay: delay + 0.15, ease: "easeOut" }}
        />
      </div>
    </motion.div>
  );
}

export default function Analysis({ cvText, persona, jobTarget, onFinish }) {
  const [mode, setMode] = useState("coach");
  const [verdict, setVerdict] = useState("");
  const [engine, setEngine] = useState(null);
  const [loadingVerdict, setLoadingVerdict] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [sending, setSending] = useState(false);
  const chatRef = useRef(null);

  const personaInfo = PERSONAS.find((p) => p.key === persona) || PERSONAS[0];
  const skillData = useMemo(() => computeSkillGap(cvText, jobTarget), [cvText, jobTarget]);
  const careerFit = useMemo(() => rankCareerFit(cvText), [cvText]);
  const healthMetrics = useMemo(() => computeHealthMetrics(cvText), [cvText]);
  const avgScore = Math.round(skillData.reduce((a, b) => a + b.score, 0) / skillData.length);
  const weakSkills = skillData.filter((s) => s.score < 55).slice(0, 3);

  const accent = mode === "roast" ? "#FF6B5E" : "#4FD1C5";

  useEffect(() => {
    fetchVerdict(mode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function fetchVerdict(nextMode) {
    setLoadingVerdict(true);
    try {
      const res = await fetch(`${API_URL}/api/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvText, persona, mode: nextMode, jobTarget }),
      });
      const data = await res.json();
      setVerdict(data.reply || data.error || "Couldn't generate a verdict.");
      setEngine(data.engine || null);
    } catch {
      setVerdict("Couldn't reach the backend. Is it running on port 5000?");
    } finally {
      setLoadingVerdict(false);
    }
  }

  function toggleMode() {
    const next = mode === "coach" ? "roast" : "coach";
    setMode(next);
    setMessages([]);
    fetchVerdict(next);
  }

  async function sendQuestion(overrideText) {
    const q = (overrideText ?? question).trim();
    if (!q || sending) return;
    setQuestion("");
    setMessages((m) => [...m, { role: "user", content: q }]);
    setSending(true);
    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cvText,
          persona,
          mode,
          jobTarget,
          question: q,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: "assistant", content: data.reply || data.error }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Connection issue — try again." }]);
    } finally {
      setSending(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen px-6 py-10 max-w-5xl mx-auto"
    >
      {/* header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{personaInfo.icon}</span>
          <div>
            <div className="font-display text-cloud font-semibold">{personaInfo.name}</div>
            <div className="text-mist text-xs">{jobTarget}</div>
          </div>
        </div>
        <motion.button
          onClick={toggleMode}
          className="relative flex items-center gap-1 px-1 py-1 rounded-full border border-line bg-panel"
          whileTap={{ scale: 0.96 }}
        >
          <span className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${mode === "coach" ? "bg-coach text-ink" : "text-mist"}`}>
            🎯 Coach
          </span>
          <span className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${mode === "roast" ? "bg-roast text-ink" : "text-mist"}`}>
            🔥 Roast
          </span>
        </motion.button>
      </div>

      {/* cinematic score + radar */}
      <div className="grid md:grid-cols-5 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="md:col-span-2 bg-panel border border-line rounded-2xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden"
        >
          <motion.div
            className="absolute w-40 h-40 rounded-full blur-3xl opacity-25"
            style={{ background: accent }}
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ repeat: Infinity, duration: 4 }}
          />
          <motion.div
            className="relative w-28 h-28 rounded-full flex items-center justify-center text-3xl font-display font-bold mb-3"
            style={{ background: `${accent}18`, color: accent, border: `2px solid ${accent}` }}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          >
            {avgScore}
          </motion.div>
          <div className="text-cloud font-display font-semibold relative">Fit for {jobTarget}</div>
          <div className="text-mist text-xs mt-1 relative">as scored by {personaInfo.name.toLowerCase()}</div>
        </motion.div>

        <div className="md:col-span-3 bg-panel border border-line rounded-2xl p-5">
          <div className="text-cloud font-display font-semibold mb-1">Skill gap map</div>
          <div className="text-mist text-xs mb-2">Detected from keywords in your CV, for this role</div>
          <div className="relative">
            <div className="absolute inset-0 rounded-full blur-2xl opacity-15" style={{ background: accent }} />
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={skillData} outerRadius="75%">
                <defs>
                  <radialGradient id="radarFill" cx="50%" cy="50%" r="65%">
                    <stop offset="0%" stopColor={accent} stopOpacity={0.55} />
                    <stop offset="100%" stopColor={accent} stopOpacity={0.08} />
                  </radialGradient>
                </defs>
                <PolarGrid stroke="#2A2F42" />
                <PolarAngleAxis dataKey="skill" tick={{ fill: "#8B93A8", fontSize: 11 }} />
                <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
                <Radar
                  dataKey="score"
                  stroke={accent}
                  strokeWidth={2}
                  fill="url(#radarFill)"
                  animationDuration={1200}
                  animationEasing="ease-out"
                  dot={{ r: 3, fill: accent, strokeWidth: 0 }}
                />
                <Tooltip content={<CustomTooltip accent={accent} />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* verdict */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-panel border rounded-2xl p-5 mb-6"
        style={{ borderColor: mode === "roast" ? "#FF6B5E33" : "#2A2F42" }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="text-cloud font-display font-semibold flex items-center gap-2">
            <span>{mode === "roast" ? "🔥" : "✅"}</span>
            {personaInfo.name}'s {mode === "roast" ? "roast" : "verdict"}
          </div>
          {engine && (
            <span
              className="text-[10px] px-2 py-0.5 rounded-full border text-mist"
              style={{ borderColor: "#2A2F42" }}
              title={
                engine === "local"
                  ? "Computed instantly from your CV text — no external AI call"
                  : "Generated live by Claude"
              }
            >
              {engine === "local" ? "⚙️ instant analysis" : "✨ live AI"}
            </span>
          )}
        </div>
        {loadingVerdict ? (
          <FunnyLoader />
        ) : (
          <div className="text-cloud text-sm leading-relaxed whitespace-pre-wrap">
            <TypewriterText text={verdict} speed={8} />
          </div>
        )}
      </motion.div>

      {/* health metrics */}
      <div className="mb-2 text-cloud font-display font-semibold">CV health check</div>
      <p className="text-mist text-xs mb-4">Signal-based, computed straight from your text</p>
      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {healthMetrics.map((m, i) => (
          <MetricBar key={m.key} label={m.label} score={m.score} hint={m.hint} accent={accent} delay={i * 0.08} />
        ))}
      </div>

      {/* career fit ranking + roadmap */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-panel border border-line rounded-2xl p-5">
          <div className="text-cloud font-display font-semibold mb-1">Where you actually fit</div>
          <p className="text-mist text-xs mb-4">Ranked across all roles based on your CV, not just the one you picked</p>
          {careerFit.map((f, i) => (
            <FitBar key={f.field} field={f.field} score={f.score} isTarget={f.field === jobTarget} accent={accent} delay={i * 0.06} />
          ))}
        </div>

        <div className="bg-panel border border-line rounded-2xl p-5">
          <div className="text-cloud font-display font-semibold mb-1">Which sector to strengthen</div>
          <p className="text-mist text-xs mb-4">
            {weakSkills.length
              ? `For ${jobTarget}, these are the weakest sectors in your CV — fix these first`
              : "You're covering the basics — go deeper on your strongest sector"}
          </p>
          <div className="space-y-3">
            {(weakSkills.length ? weakSkills : skillData.slice(0, 3)).map((s, i) => (
              <motion.div
                key={s.skill}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-3 rounded-xl bg-panel2 border border-line"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-cloud text-sm font-medium">{s.skill}</span>
                  <span className="text-xs" style={{ color: accent }}>{s.score}/100</span>
                </div>
                <p className="text-mist text-xs leading-relaxed">
                  {SKILL_ROADMAP[s.skill] || "Build one small project that specifically exercises this skill."}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => onFinish({ mode, skillData, careerFit })}
        className="w-full py-3 rounded-full border border-line text-cloud text-sm hover:border-signal transition-colors mb-8"
      >
        View full report →
      </motion.button>

      {/* secondary chat, collapsed by default */}
      <div className="bg-panel border border-line rounded-2xl overflow-hidden">
        <button
          onClick={() => setChatOpen((v) => !v)}
          className="w-full flex items-center justify-between px-5 py-3 text-sm text-mist hover:text-cloud transition-colors"
        >
          <span>💬 Ask {personaInfo.name} something specific</span>
          <motion.span animate={{ rotate: chatOpen ? 180 : 0 }}>▾</motion.span>
        </button>
        <AnimatePresence>
          {chatOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-line"
            >
              <div ref={chatRef} className="max-h-64 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && (
                  <p className="text-mist text-xs italic mb-1">
                    Tap a question below for a guaranteed accurate answer, or type your own.
                  </p>
                )}
                {messages.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed whitespace-pre-wrap ${
                        m.role === "user" ? "bg-signal text-ink" : "bg-panel2 text-cloud"
                      }`}
                    >
                      {m.role === "assistant" ? <TypewriterText text={m.content} speed={7} /> : m.content}
                    </div>
                  </motion.div>
                ))}
                {sending && <FunnyLoader />}
              </div>
              <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                {SUGGESTED_QUESTIONS.map((sq) => (
                  <button
                    key={sq}
                    onClick={() => sendQuestion(sq)}
                    disabled={sending}
                    className="px-2.5 py-1 rounded-full border border-line text-mist text-[11px] hover:border-signal hover:text-cloud transition-colors disabled:opacity-40"
                  >
                    {sq}
                  </button>
                ))}
              </div>
              <div className="p-3 border-t border-line flex gap-2">
                <input
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendQuestion()}
                  placeholder="...or type your own question"
                  className="flex-1 bg-panel2 border border-line rounded-full px-3 py-1.5 text-xs text-cloud focus:outline-none focus:border-signal"
                />
                <button
                  onClick={() => sendQuestion()}
                  disabled={sending}
                  className="px-3 py-1.5 rounded-full bg-signal text-ink text-xs font-medium disabled:opacity-50"
                >
                  Send
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
