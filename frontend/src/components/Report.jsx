import { useState } from "react";
import { motion } from "framer-motion";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { PERSONAS } from "../data/personas";
import {
  PersonaIcon,
  Download,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Award,
  Sparkles,
  Copy,
  Check,
  Zap,
  Sliders,
  Wand2,
  Briefcase,
  Star,
} from "./Icons.jsx";

function ModernParticleBurst() {
  const particles = [
    { color: "#8B7BFF", size: 6, delay: 0 },
    { color: "#4FD1C5", size: 8, delay: 0.05 },
    { color: "#FF6B5E", size: 5, delay: 0.1 },
    { color: "#FFC15E", size: 7, delay: 0.15 },
    { color: "#5EC2FF", size: 6, delay: 0.2 },
    { color: "#8B7BFF", size: 9, delay: 0.25 },
    { color: "#4FD1C5", size: 6, delay: 0.3 },
    { color: "#FF8FA3", size: 7, delay: 0.35 },
  ];

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center overflow-hidden h-0">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full shadow-lg"
          style={{
            backgroundColor: p.color,
            width: p.size,
            height: p.size,
            boxShadow: `0 0 10px ${p.color}`,
          }}
          initial={{ opacity: 1, y: 0, x: 0, scale: 0 }}
          animate={{
            opacity: 0,
            y: 180 + (i % 3) * 40,
            x: (i % 2 === 0 ? 1 : -1) * (60 + (i * 35)),
            scale: [0, 1.4, 0.4],
          }}
          transition={{ duration: 1.8, ease: "easeOut", delay: p.delay }}
        />
      ))}
    </div>
  );
}

function ReportTooltip({ active, payload, accent }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-panel border rounded-xl px-3 py-2 text-xs shadow-xl text-cloud" style={{ borderColor: accent }}>
      <div className="font-semibold text-cloud">{payload[0].payload.skill}</div>
      <div className="font-mono mt-0.5" style={{ color: accent }}>
        Match: {payload[0].value}/100
      </div>
    </div>
  );
}

export default function Report({
  persona,
  jobTarget,
  mode,
  skillData,
  careerFit,
  onRestart,
  onOpenEditor,
  onOpenJobMatches,
  onOpenDreamJob,
}) {
  const [copiedSummary, setCopiedSummary] = useState(false);
  const personaInfo = PERSONAS.find((p) => p.key === persona) || PERSONAS[0];
  const accent = mode === "roast" ? "#FF6B5E" : "#4FD1C5";
  const avg = Math.round(skillData.reduce((a, b) => a + b.score, 0) / skillData.length);
  const strong = skillData.filter((s) => s.score >= 60).map((s) => s.skill);
  const weak = skillData.filter((s) => s.score < 60).map((s) => s.skill);
  const bestFit = careerFit && careerFit.length ? careerFit[0] : null;

  function handleCopySummary() {
    const summary = `# CareerMirror Executive Analysis
Target Role: ${jobTarget}
Reviewer: ${personaInfo.name} (${mode.toUpperCase()} Mode)
Overall Fit Score: ${avg}/100

## Strong Sectors (>=60%)
${strong.map((s) => `- ${s}`).join("\n")}

## Growth Sectors (<60%)
${weak.map((s) => `- ${s}`).join("\n")}

## Top Cross-Role Fit
${bestFit ? `- ${bestFit.field} (${bestFit.score}%)` : "N/A"}
`;
    navigator.clipboard.writeText(summary);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-[calc(100vh-70px)] px-6 py-10 max-w-2xl mx-auto text-center relative"
    >
      <ModernParticleBurst />

      {/* Top score ring */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120 }}
        className="w-24 h-24 mx-auto rounded-full flex flex-col items-center justify-center font-display font-bold mb-5 shadow-xl"
        style={{
          background: `radial-gradient(circle, ${accent}25 0%, ${accent}08 70%)`,
          color: accent,
          border: `2px solid ${accent}`,
          boxShadow: `0 0 25px ${accent}25`,
        }}
      >
        <span className="text-3xl">{avg}</span>
        <span className="text-[10px] uppercase font-mono tracking-widest text-mist">/ 100</span>
      </motion.div>

      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-panel2 border border-line text-xs text-mist font-mono mb-3">
        <PersonaIcon personaKey={personaInfo.iconKey} size={14} color={personaInfo.color} />
        <span>Reviewed by {personaInfo.name}</span>
      </div>

      <h2 className="font-display text-2xl md:text-3xl font-bold text-cloud mb-1">
        Executive CV Scorecard
      </h2>
      <p className="text-mist text-xs md:text-sm mb-6">
        Evaluated specifically for <strong className="text-cloud">{jobTarget}</strong>
      </p>

      {/* Strengths and Growth Tags */}
      <div className="space-y-3 mb-7">
        {strong.length > 0 && (
          <div className="flex flex-wrap gap-1.5 justify-center">
            {strong.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-coach-soft/70 border border-coach/30 text-coach text-xs font-medium"
              >
                <CheckCircle2 size={12} />
                <span>{s}</span>
              </span>
            ))}
          </div>
        )}

        {weak.length > 0 && (
          <div className="flex flex-wrap gap-1.5 justify-center">
            {weak.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-roast-soft/70 border border-roast/30 text-roast text-xs font-medium"
              >
                <AlertCircle size={12} />
                <span>{s} (Needs Polish)</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Radar Chart */}
      <div className="bg-panel border border-line rounded-2xl p-5 mb-6 relative shadow-sm">
        <div className="text-cloud font-display font-semibold text-xs mb-3 text-left flex items-center gap-1.5">
          <Award size={15} className="text-signal" />
          <span>Role Competency Distribution</span>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <RadarChart data={skillData} outerRadius="72%">
            <defs>
              <radialGradient id="reportRadarFill" cx="50%" cy="50%" r="65%">
                <stop offset="0%" stopColor={accent} stopOpacity={0.6} />
                <stop offset="100%" stopColor={accent} stopOpacity={0.06} />
              </radialGradient>
            </defs>
            <PolarGrid stroke="#2A2F42" strokeDasharray="3 3" />
            <PolarAngleAxis dataKey="skill" tick={{ fill: "#8B93A8", fontSize: 10, fontWeight: 500 }} />
            <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
            <Radar
              dataKey="score"
              stroke={accent}
              strokeWidth={2}
              fill="url(#reportRadarFill)"
              animationDuration={1000}
              animationEasing="ease-out"
              dot={{ r: 3, fill: accent, strokeWidth: 0 }}
            />
            <Tooltip content={<ReportTooltip accent={accent} />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Career Fit Card */}
      {bestFit && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-panel border border-line rounded-2xl p-4 mb-6 text-left shadow-sm"
        >
          <div className="text-cloud font-display font-semibold text-xs mb-1 flex items-center gap-1.5">
            <Sparkles size={14} className="text-signal" />
            <span>Optimal Role Alignment</span>
          </div>
          <p className="text-mist text-xs leading-relaxed">
            Based on all analyzed roles, your technical vocabulary scores highest for{" "}
            <strong style={{ color: accent }}>{bestFit.field}</strong> ({bestFit.score}%)
            {bestFit.field !== jobTarget
              ? ` — consider positioning your CV for both ${jobTarget} and ${bestFit.field}.`
              : ", directly validating your target role selection."}
          </p>
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="grid sm:grid-cols-2 gap-3 mb-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCopySummary}
          className="py-3 rounded-full border border-line bg-panel2 text-cloud text-xs font-semibold hover:border-signal/50 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
        >
          {copiedSummary ? <Check size={14} className="text-coach" /> : <Copy size={14} />}
          <span>{copiedSummary ? "Copied Markdown!" : "Copy Summary"}</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => window.print()}
          className="py-3 rounded-full border border-line bg-panel text-cloud text-xs font-semibold hover:border-signal transition-colors flex items-center justify-center gap-1.5 shadow-sm"
        >
          <Download size={14} />
          <span>Export / Print PDF</span>
        </motion.button>
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-2.5">
        {onOpenDreamJob && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenDreamJob}
            className="py-3 rounded-full border border-signal/50 bg-signal/15 text-signal font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Star size={14} />
            <span>Dream Job Gap</span>
          </motion.button>
        )}

        {onOpenJobMatches && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenJobMatches}
            className="py-3 rounded-full border border-coach/40 bg-coach/15 text-coach font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Briefcase size={14} />
            <span>Jobs & Apply</span>
          </motion.button>
        )}

        {onOpenEditor && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenEditor}
            className="py-3 rounded-full border border-line bg-panel text-cloud font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Sliders size={14} />
            <span>ATS Studio</span>
          </motion.button>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onRestart}
          className="py-3 rounded-full bg-signal text-ink font-display font-semibold text-xs shadow-md shadow-signal/20 flex items-center justify-center gap-1.5"
        >
          <RotateCcw size={14} />
          <span>New Review</span>
        </motion.button>
      </div>
    </motion.div>
  );
}
