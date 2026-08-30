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
import { computeHealthMetrics, SKILL_ROADMAP, MAINTAIN_TIPS } from "../data/cvMetrics";
import { JOB_BLUEPRINTS, GENERIC_BLUEPRINT } from "../data/blueprints";
import { evaluateAtsScore } from "../data/atsEngine.js";
import TypewriterText from "./Typewriter.jsx";
import BulletRewriterModal from "./BulletRewriterModal.jsx";
import {
  PersonaIcon,
  Target,
  Flame,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Cpu,
  MessageSquare,
  Send,
  Wand2,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Zap,
  ArrowRight,
  ChevronDown,
  Layers,
  FileCheck2,
  Sliders,
  Briefcase,
  Star,
  Compass,
  Award,
  TrendingUp,
  XCircle,
} from "./Icons.jsx";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const SUGGESTED_QUESTIONS = [
  "Why wouldn't you hire me?",
  "What's my weakest skill?",
  "What's my strongest skill?",
  "Which field fits me better?",
  "How should I build my CV for this role?",
];

function CustomTooltip({ active, payload, accent }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-panel border rounded-xl px-3 py-2 text-xs shadow-xl text-cloud" style={{ borderColor: accent }}>
      <div className="font-semibold text-cloud">{payload[0].payload.skill}</div>
      <div className="font-mono mt-0.5" style={{ color: accent }}>
        Match Score: {payload[0].value}/100
      </div>
    </div>
  );
}

function FunnyLoader() {
  const [lineIndex, setLineIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setLineIndex((i) => (i + 1) % FUNNY_LOADING_LINES.length), 1400);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="flex items-center gap-2.5 py-2">
      <div className="flex gap-1">
        {[0, 1, 2].map((d) => (
          <motion.span
            key={d}
            className="w-2 h-2 rounded-full bg-signal"
            animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
            transition={{ repeat: Infinity, duration: 1.2, delay: d * 0.2 }}
          />
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.span
          key={lineIndex}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          className="text-mist text-xs italic font-medium"
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
      className="bg-panel border border-line rounded-xl p-4 flex flex-col justify-between"
    >
      <div>
        <div className="flex justify-between items-baseline mb-2">
          <span className="text-cloud text-xs font-semibold">{label}</span>
          <span className="font-display font-bold text-xs font-mono" style={{ color: accent }}>
            {score}/100
          </span>
        </div>
        <div className="h-2 rounded-full bg-panel2 overflow-hidden mb-2">
          <motion.div
            className="h-full rounded-full"
            style={{ background: accent }}
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 1, delay: delay + 0.15, ease: "easeOut" }}
          />
        </div>
      </div>
      <p className="text-mist text-[11px] leading-tight">{hint}</p>
    </motion.div>
  );
}

function FitBar({ field, score, isTarget, accent, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="mb-3.5"
    >
      <div className="flex justify-between text-xs mb-1.5">
        <span className={`font-medium flex items-center gap-1.5 ${isTarget ? "text-cloud" : "text-mist"}`}>
          <span>{field}</span>
          {isTarget && (
            <span
              className="text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold"
              style={{ backgroundColor: `${accent}20`, color: accent, border: `1px solid ${accent}40` }}
            >
              TARGET
            </span>
          )}
        </span>
        <span className="text-mist font-mono font-medium">{score}%</span>
      </div>
      <div className="h-2.5 rounded-full bg-panel2 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: isTarget ? accent : "#333A52" }}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, delay: delay + 0.1, ease: "easeOut" }}
        />
      </div>
    </motion.div>
  );
}

export default function Analysis({
  cvText,
  persona,
  jobTarget,
  onFinish,
  onOpenEditor,
  onOpenJobMatches,
  onOpenDreamJob,
}) {
  const [mode, setMode] = useState("coach");
  const [verdict, setVerdict] = useState("");
  const [engine, setEngine] = useState(null);
  const [provider, setProvider] = useState(null);
  const [loadingVerdict, setLoadingVerdict] = useState(true);
  // Chatbot section is OPEN by default as requested
  const [chatOpen, setChatOpen] = useState(true);
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [sending, setSending] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copiedVerdict, setCopiedVerdict] = useState(false);
  const [rewriterOpen, setRewriterOpen] = useState(false);
  const chatRef = useRef(null);

  const personaInfo = PERSONAS.find((p) => p.key === persona) || PERSONAS[0];
  const skillData = useMemo(() => computeSkillGap(cvText, jobTarget), [cvText, jobTarget]);
  const careerFit = useMemo(() => rankCareerFit(cvText), [cvText]);
  const healthMetrics = useMemo(() => computeHealthMetrics(cvText), [cvText]);
  const atsEvaluation = useMemo(() => evaluateAtsScore(cvText, jobTarget), [cvText, jobTarget]);
  const avgScore = Math.round(skillData.reduce((a, b) => a + b.score, 0) / skillData.length);
  
  // Categorize Develop vs Maintain
  const weakSkills = skillData.filter((s) => s.score < 55).slice(0, 3);
  const sortedSkills = [...skillData].sort((a, b) => b.score - a.score);
  const developSkills = weakSkills.length ? weakSkills.slice(0, 2) : sortedSkills.slice(-2).reverse();
  const maintainSkills = skillData.filter((s) => s.score >= 60).slice(0, 2).length
    ? skillData.filter((s) => s.score >= 60).slice(0, 2)
    : sortedSkills.slice(0, 2);

  const blueprint = JOB_BLUEPRINTS[jobTarget] || GENERIC_BLUEPRINT;
  const accent = mode === "roast" ? "#FF6B5E" : "#4FD1C5";

  useEffect(() => {
    fetchVerdict(mode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cvText, persona, jobTarget]);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Clean speech synthesis on unmount
  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  async function fetchVerdict(nextMode) {
    setLoadingVerdict(true);
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    try {
      const res = await fetch(`${API_URL}/api/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvText, persona, mode: nextMode, jobTarget }),
      });
      const data = await res.json();
      setVerdict(data.reply || data.error || "Could not generate analysis verdict.");
      setEngine(data.engine || null);
      setProvider(data.provider || null);
    } catch {
      setVerdict("Could not reach the backend analysis service. Ensure server is active on port 5000.");
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

  function handleSpeakToggle() {
    if (!("speechSynthesis" in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const cleanText = verdict.replace(/[[\]]/g, " ").replace(/\s+/g, " ");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = mode === "roast" ? 1.05 : 0.98;
    utterance.pitch = mode === "roast" ? 0.95 : 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }

  function handleCopyVerdict() {
    navigator.clipboard.writeText(verdict);
    setCopiedVerdict(true);
    setTimeout(() => setCopiedVerdict(false), 2000);
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

  const atsScore = atsEvaluation.overallScore;
  const atsColor = atsScore >= 80 ? "#4FD1C5" : atsScore >= 60 ? "#FFC15E" : "#FF6B5E";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-[calc(100vh-70px)] px-6 py-8 max-w-5xl mx-auto"
    >
      {/* Rewriter & Optimizer Modal */}
      <BulletRewriterModal isOpen={rewriterOpen} onClose={() => setRewriterOpen(false)} />

      {/* Header bar */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4 bg-panel border border-line rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <PersonaIcon
            personaKey={personaInfo.iconKey}
            size={22}
            color={personaInfo.color}
            withBadge
          />
          <div>
            <div className="font-display text-cloud font-bold text-base flex items-center gap-2">
              <span>{personaInfo.name}</span>
              <span
                className="text-[10px] px-2 py-0.5 rounded-full font-mono font-medium"
                style={{ backgroundColor: `${personaInfo.color}15`, color: personaInfo.color }}
              >
                {personaInfo.tagline}
              </span>
            </div>
            <div className="text-mist text-xs mt-0.5">
              Reviewing fit for: <strong className="text-cloud font-medium">{jobTarget}</strong>
            </div>
          </div>
        </div>

        {/* Mode Switcher & Quick Navigation CTAs */}
        <div className="flex items-center gap-2 flex-wrap">
          {onOpenDreamJob && (
            <button
              onClick={onOpenDreamJob}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-signal/50 bg-signal/15 hover:bg-signal text-signal hover:text-ink text-xs font-semibold transition-all shadow-sm"
              title="Open Dream Job Skill Gap & ATS Booster"
            >
              <Star size={13} />
              <span>Dream Job Gap</span>
            </button>
          )}

          {onOpenJobMatches && (
            <button
              onClick={onOpenJobMatches}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-coach/40 bg-coach/10 hover:bg-coach text-coach hover:text-ink text-xs font-semibold transition-all shadow-sm"
              title="Search Real Job Types and How to Apply"
            >
              <Briefcase size={13} />
              <span>Search Real Job Types</span>
            </button>
          )}

          {onOpenEditor && (
            <button
              onClick={() => onOpenEditor(cvText)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-line bg-panel2 hover:border-signal text-cloud text-xs font-semibold transition-all shadow-sm"
              title="Compare My CV & Open Live ATS Studio"
            >
              <Sliders size={13} />
              <span>Compare My CV</span>
            </button>
          )}

          <div className="flex items-center gap-1 p-1 rounded-full border border-line bg-panel2">
            <button
              onClick={() => mode !== "coach" && toggleMode()}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                mode === "coach"
                  ? "bg-coach text-ink font-semibold shadow-md shadow-coach/20"
                  : "text-mist hover:text-cloud"
              }`}
            >
              <Target size={13} />
              <span>Coach Mode</span>
            </button>
            <button
              onClick={() => mode !== "roast" && toggleMode()}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                mode === "roast"
                  ? "bg-roast text-ink font-semibold shadow-md shadow-roast/20"
                  : "text-mist hover:text-cloud"
              }`}
            >
              <Flame size={13} />
              <span>Roast Mode</span>
            </button>
          </div>
        </div>
      </div>

      {/* Live ATS Quick Banner */}
      <div className="mb-6 p-4 rounded-2xl bg-panel border border-line flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center font-display font-bold font-mono text-lg shrink-0 shadow-sm"
            style={{
              backgroundColor: `${atsColor}18`,
              color: atsColor,
              border: `1.5px solid ${atsColor}`,
            }}
          >
            {atsScore}
          </div>
          <div>
            <div className="text-xs font-bold text-cloud flex items-center gap-2">
              <span>ATS Pass Rating: {atsEvaluation.rating}</span>
              <span
                className="text-[10px] px-2 py-0.5 rounded-full font-mono font-medium"
                style={{ backgroundColor: `${atsColor}20`, color: atsColor }}
              >
                {atsScore}/100
              </span>
            </div>
            <p className="text-mist text-xs mt-0.5">
              {atsEvaluation.stats.passiveCount > 0 || atsEvaluation.stats.buzzwordCount > 0
                ? `Detected ${atsEvaluation.stats.passiveCount} passive phrases and ${atsEvaluation.stats.buzzwordCount} buzzwords.`
                : "All essential section headers, active verbs, and key metrics verified."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onOpenJobMatches && (
            <button
              onClick={onOpenJobMatches}
              className="px-3 py-2 rounded-full border border-coach/40 bg-coach/10 hover:bg-coach text-coach hover:text-ink text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Briefcase size={13} />
              <span>Search Real Job Types</span>
            </button>
          )}

          {onOpenEditor && (
            <button
              onClick={() => onOpenEditor(cvText)}
              className="shrink-0 px-4 py-2 rounded-full bg-signal text-ink font-display font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-signal/20 hover:opacity-90 transition-opacity"
            >
              <Wand2 size={13} />
              <span>Auto-Fix (1-Click)</span>
            </button>
          )}
        </div>
      </div>

      {/* Primary Score & Radar Section */}
      <div className="grid md:grid-cols-5 gap-5 mb-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="md:col-span-2 bg-panel border border-line rounded-2xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden"
        >
          <motion.div
            className="absolute w-44 h-44 rounded-full blur-3xl opacity-20 pointer-events-none"
            style={{ background: accent }}
            animate={{ scale: [1, 1.25, 1] }}
            transition={{ repeat: Infinity, duration: 4 }}
          />
          <div className="relative mb-3">
            <div
              className="w-28 h-28 rounded-full flex flex-col items-center justify-center font-display font-bold shadow-2xl transition-colors"
              style={{
                background: `radial-gradient(circle, ${accent}25 0%, ${accent}08 70%)`,
                color: accent,
                border: `2px solid ${accent}`,
                boxShadow: `0 0 25px ${accent}20`,
              }}
            >
              <span className="text-3xl tracking-tight">{avgScore}</span>
              <span className="text-[10px] text-mist uppercase font-mono tracking-widest">/ 100</span>
            </div>
          </div>
          <div className="text-cloud font-display font-semibold text-base relative">
            Overall Fit for {jobTarget}
          </div>
          <div className="text-mist text-xs mt-1 relative max-w-xs">
            Evaluated by {personaInfo.name} against real industry hiring criteria
          </div>
        </motion.div>

        <div className="md:col-span-3 bg-panel border border-line rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <div className="text-cloud font-display font-semibold text-sm flex items-center gap-2">
              <Layers size={16} className="text-signal" />
              Skill Distribution Radar
            </div>
            <span className="text-mist text-[11px] font-mono">Taxonomy Map</span>
          </div>
          <p className="text-mist text-xs mb-2">
            Skill keyword coverage extracted directly from your CV text
          </p>

          <div className="relative w-full h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={skillData} outerRadius="72%">
                <defs>
                  <radialGradient id="radarFill" cx="50%" cy="50%" r="65%">
                    <stop offset="0%" stopColor={accent} stopOpacity={0.6} />
                    <stop offset="100%" stopColor={accent} stopOpacity={0.06} />
                  </radialGradient>
                </defs>
                <PolarGrid stroke="#2A2F42" strokeDasharray="3 3" />
                <PolarAngleAxis dataKey="skill" tick={{ fill: "#8B93A8", fontSize: 11, fontWeight: 500 }} />
                <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
                <Radar
                  dataKey="score"
                  stroke={accent}
                  strokeWidth={2}
                  fill="url(#radarFill)"
                  animationDuration={1000}
                  animationEasing="ease-out"
                  dot={{ r: 3, fill: accent, strokeWidth: 0 }}
                />
                <Tooltip content={<CustomTooltip accent={accent} />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recruiter Verdict Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-panel border rounded-2xl p-5 mb-6 shadow-sm transition-all"
        style={{ borderColor: mode === "roast" ? "rgba(255, 107, 94, 0.35)" : "rgba(42, 47, 66, 0.9)" }}
      >
        <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-line/60 flex-wrap gap-2">
          <div className="text-cloud font-display font-semibold flex items-center gap-2 text-sm">
            {mode === "roast" ? (
              <Flame size={18} className="text-roast" />
            ) : (
              <CheckCircle2 size={18} className="text-coach" />
            )}
            <span>
              {personaInfo.name}'s {mode === "roast" ? "Roast Review" : "Actionable Verdict"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Voice button */}
            {"speechSynthesis" in window && (
              <button
                onClick={handleSpeakToggle}
                disabled={loadingVerdict}
                className={`p-1.5 rounded-lg border border-line text-xs transition-colors flex items-center gap-1 ${
                  isSpeaking
                    ? "bg-signal text-ink border-signal"
                    : "bg-panel2 text-mist hover:text-cloud hover:border-signal/50"
                }`}
                title={isSpeaking ? "Stop voice narration" : "Listen to recruiter audio"}
              >
                {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
                <span className="hidden sm:inline text-[11px]">{isSpeaking ? "Mute" : "Voice"}</span>
              </button>
            )}

            {/* Copy button */}
            <button
              onClick={handleCopyVerdict}
              disabled={loadingVerdict}
              className="p-1.5 rounded-lg border border-line bg-panel2 text-mist hover:text-cloud hover:border-signal/50 text-xs transition-colors flex items-center gap-1"
              title="Copy verdict to clipboard"
            >
              {copiedVerdict ? <Check size={14} className="text-coach" /> : <Copy size={14} />}
              <span className="hidden sm:inline text-[11px]">{copiedVerdict ? "Copied" : "Copy"}</span>
            </button>

            {/* Engine status */}
            {engine && (
              <span
                className="text-[11px] px-2.5 py-1 rounded-full border text-mist font-mono flex items-center gap-1.5"
                style={{ borderColor: "#2A2F42", backgroundColor: "#1B2032" }}
              >
                {engine === "local" ? (
                  <>
                    <Cpu size={12} className="text-signal" />
                    <span>Instant Local Engine</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={12} className="text-signal animate-pulse" />
                    <span>Live AI ({provider === "groq" ? "Groq" : "Claude"})</span>
                  </>
                )}
              </span>
            )}
          </div>
        </div>

        {loadingVerdict ? (
          <FunnyLoader />
        ) : (
          <div className="text-cloud text-xs md:text-sm leading-relaxed whitespace-pre-wrap font-sans">
            <TypewriterText text={verdict} speed={6} />
          </div>
        )}
      </motion.div>

      {/* CV Health Check & Bullet Rewriter CTA */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div>
          <h3 className="text-cloud font-display font-semibold text-sm">CV Health & Signal Scorecard</h3>
          <p className="text-mist text-xs">Signal-based structural audit computed straight from your text</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setRewriterOpen(true)}
          className="px-3.5 py-1.5 rounded-full bg-signal/15 border border-signal/40 text-signal hover:bg-signal text-xs font-semibold hover:text-ink transition-all flex items-center gap-1.5 shadow-sm"
        >
          <Wand2 size={13} />
          <span>Open Bullet Rewriter</span>
        </motion.button>
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3.5 mb-7">
        {healthMetrics.map((m, i) => (
          <MetricBar key={m.key} label={m.label} score={m.score} hint={m.hint} accent={accent} delay={i * 0.06} />
        ))}
      </div>

      {/* 1. Where You Actually Fit & 2. Develop vs Maintain */}
      <div className="grid md:grid-cols-2 gap-5 mb-7">
        {/* Where you actually fit */}
        <div className="bg-panel border border-line rounded-2xl p-5">
          <div className="text-cloud font-display font-semibold text-sm mb-1 flex items-center gap-2">
            <Target size={16} className="text-signal" />
            <span>Where you actually fit</span>
          </div>
          <p className="text-mist text-xs mb-4">Ranked across all career paths based on your current vocabulary</p>
          <div className="max-h-[380px] overflow-y-auto pr-1">
            {careerFit.map((f, i) => (
              <FitBar key={f.field} field={f.field} score={f.score} isTarget={f.field === jobTarget} accent={accent} delay={i * 0.04} />
            ))}
          </div>
        </div>

        {/* Develop vs Maintain */}
        <div className="bg-panel border border-line rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="text-cloud font-display font-semibold text-sm mb-1 flex items-center gap-2">
              <TrendingUp size={16} className="text-signal" />
              <span>Develop vs. maintain</span>
            </div>
            <p className="text-mist text-xs mb-3.5">
              For <strong>{jobTarget}</strong> specifically — what to prioritize, and what to preserve
            </p>

            {/* Develop Sub-section */}
            <div className="mb-4">
              <div className="text-roast text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1">
                <AlertCircle size={13} />
                <span>Develop (Priority Focus)</span>
              </div>
              <div className="space-y-2">
                {developSkills.map((s, i) => (
                  <motion.div
                    key={s.skill}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="p-3 rounded-xl bg-roast-soft/30 border border-roast/20"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-cloud text-xs font-semibold">{s.skill}</span>
                      <span className="text-roast font-mono text-xs font-semibold">{s.score}/100</span>
                    </div>
                    <p className="text-mist text-xs leading-relaxed">
                      {SKILL_ROADMAP[s.skill] || "Build one focused real-world feature or proof point that specifically exercises this competency."}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Maintain Sub-section */}
            <div>
              <div className="text-coach text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1">
                <CheckCircle2 size={13} />
                <span>Maintain (Proven Strengths)</span>
              </div>
              <div className="space-y-2">
                {maintainSkills.map((s, i) => (
                  <motion.div
                    key={s.skill}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="p-3 rounded-xl bg-coach-soft/30 border border-coach/20"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-cloud text-xs font-semibold">{s.skill}</span>
                      <span className="text-coach font-mono text-xs font-semibold">{s.score}/100</span>
                    </div>
                    <p className="text-mist text-xs leading-relaxed">
                      {MAINTAIN_TIPS[i % MAINTAIN_TIPS.length]}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. How to Build a CV for {jobTarget} */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-panel border border-line rounded-2xl p-5 mb-7 shadow-sm"
      >
        <div className="text-cloud font-display font-semibold mb-1 flex items-center gap-2 text-sm">
          <Compass size={17} className="text-signal" />
          <span>How to build a CV for {jobTarget}</span>
        </div>
        <p className="text-mist text-xs mb-4">Structural blueprints and presentation guidelines for this role</p>

        <div className="grid sm:grid-cols-3 gap-3.5">
          <div className="p-3.5 rounded-xl bg-panel2 border border-line flex flex-col justify-between">
            <div className="text-xs text-coach font-semibold mb-1.5 flex items-center gap-1.5">
              <Award size={14} />
              <span>Lead with</span>
            </div>
            <div className="text-cloud text-xs leading-relaxed">
              {blueprint.lead}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-panel2 border border-line flex flex-col justify-between">
            <div className="text-xs text-signal font-semibold mb-1.5 flex items-center gap-1.5">
              <TrendingUp size={14} />
              <span>Emphasize</span>
            </div>
            <div className="text-cloud text-xs leading-relaxed">
              {blueprint.emphasize}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-panel2 border border-line flex flex-col justify-between">
            <div className="text-xs text-roast font-semibold mb-1.5 flex items-center gap-1.5">
              <XCircle size={14} />
              <span>Avoid</span>
            </div>
            <div className="text-cloud text-xs leading-relaxed">
              {blueprint.avoid}
            </div>
          </div>
        </div>
      </motion.div>

      {/* 4. What Should I Do Now / Priority Action Roadmap */}
      <div className="bg-panel border border-line rounded-2xl p-5 mb-7">
        <div className="text-cloud font-display font-semibold text-sm mb-1 flex items-center gap-2">
          <Sparkles size={16} className="text-signal" />
          <span>What should I do now? (Priority Action Steps)</span>
        </div>
        <p className="text-mist text-xs mb-3.5">
          High-leverage action items to elevate your CV from applicant to interview shortlist
        </p>

        <div className="grid sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-panel2 border border-line">
            <div className="text-xs font-semibold text-cloud mb-1 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-signal/20 text-signal font-mono text-[11px] flex items-center justify-center font-bold">1</span>
              <span>Quantify Outcomes</span>
            </div>
            <p className="text-mist text-xs leading-relaxed">
              Add at least one percentage, dollar value, speedup, or volume metric to every experience bullet point.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-panel2 border border-line">
            <div className="text-xs font-semibold text-cloud mb-1 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-coach/20 text-coach font-mono text-[11px] flex items-center justify-center font-bold">2</span>
              <span>Align Keywords</span>
            </div>
            <p className="text-mist text-xs leading-relaxed">
              Inject the highest-scoring missing skills for {jobTarget} directly into your Skills & Summary sections.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-panel2 border border-line">
            <div className="text-xs font-semibold text-cloud mb-1 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-roast/20 text-roast font-mono text-[11px] flex items-center justify-center font-bold">3</span>
              <span>Review Against ATS</span>
            </div>
            <p className="text-mist text-xs leading-relaxed">
              Open the ATS Studio or 1-Click Auto-Fix to eliminate passive phrasing and format bullets consistently.
            </p>
          </div>
        </div>
      </div>

      {/* Button to Full Report */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onFinish({ mode, skillData, careerFit })}
        className="w-full py-4 rounded-full border border-signal/50 bg-panel hover:bg-panel2 text-cloud text-sm font-semibold hover:border-signal transition-all flex items-center justify-center gap-2 mb-7 shadow-md"
      >
        <FileCheck2 size={18} className="text-signal" />
        <span>View Full Report & Export PDF →</span>
      </motion.button>

      {/* Interactive Recruiter Chat (OPEN BY DEFAULT) */}
      <div className="bg-panel border border-line rounded-2xl overflow-hidden shadow-sm mb-6">
        <button
          onClick={() => setChatOpen((v) => !v)}
          className="w-full flex items-center justify-between px-5 py-3.5 text-xs text-mist hover:text-cloud transition-colors bg-panel2/60"
        >
          <span className="flex items-center gap-2 font-semibold text-cloud">
            <MessageSquare size={16} className="text-signal" />
            <span>Ask {personaInfo.name} a Follow-up Question</span>
          </span>
          <ChevronDown
            size={16}
            className={`transition-transform duration-300 ${chatOpen ? "rotate-180 text-signal" : ""}`}
          />
        </button>

        <AnimatePresence>
          {chatOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-line"
            >
              <div ref={chatRef} className="max-h-72 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && (
                  <p className="text-mist text-xs italic">
                    Tap a question below or type your own question to chat directly with {personaInfo.name}:
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
                      className={`max-w-[85%] px-3.5 py-2.5 rounded-xl text-xs leading-relaxed whitespace-pre-wrap ${
                        m.role === "user"
                          ? "bg-signal text-ink font-medium shadow-sm"
                          : "bg-panel2 text-cloud border border-line/60"
                      }`}
                    >
                      {m.role === "assistant" ? <TypewriterText text={m.content} speed={6} /> : m.content}
                    </div>
                  </motion.div>
                ))}
                {sending && <FunnyLoader />}
              </div>

              {/* Preset prompt pills */}
              <div className="px-4 pb-2.5 flex flex-wrap gap-1.5">
                {SUGGESTED_QUESTIONS.map((sq) => (
                  <button
                    key={sq}
                    onClick={() => sendQuestion(sq)}
                    disabled={sending}
                    className="px-2.5 py-1 rounded-full border border-line bg-panel2 text-mist text-[11px] hover:border-signal hover:text-cloud transition-colors disabled:opacity-40"
                  >
                    {sq}
                  </button>
                ))}
              </div>

              {/* Chat Input */}
              <div className="p-3 border-t border-line flex gap-2 bg-panel2/40">
                <input
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendQuestion()}
                  placeholder={`Ask ${personaInfo.name} about your CV...`}
                  className="flex-1 bg-panel2 border border-line rounded-full px-4 py-2 text-xs text-cloud focus:outline-none focus:border-signal font-sans"
                />
                <button
                  onClick={() => sendQuestion()}
                  disabled={sending || !question.trim()}
                  className="px-4 py-2 rounded-full bg-signal text-ink text-xs font-semibold flex items-center gap-1 disabled:opacity-40 hover:opacity-90 transition-opacity"
                >
                  <span>Send</span>
                  <Send size={12} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
