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

const CONFETTI = ["🎉", "✨", "🏆", "💫", "🎊"];

function ConfettiBurst() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center overflow-hidden h-0">
      {Array.from({ length: 14 }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute text-xl"
          initial={{ opacity: 1, y: 0, x: 0 }}
          animate={{
            opacity: 0,
            y: 160 + Math.random() * 80,
            x: (Math.random() - 0.5) * 500,
            rotate: Math.random() * 360,
          }}
          transition={{ duration: 1.6 + Math.random(), ease: "easeOut", delay: i * 0.03 }}
        >
          {CONFETTI[i % CONFETTI.length]}
        </motion.span>
      ))}
    </div>
  );
}

function ReportTooltip({ active, payload, accent }) {
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

export default function Report({ persona, jobTarget, mode, skillData, careerFit, onRestart }) {
  const personaInfo = PERSONAS.find((p) => p.key === persona) || PERSONAS[0];
  const accent = mode === "roast" ? "#FF6B5E" : "#4FD1C5";
  const avg = Math.round(skillData.reduce((a, b) => a + b.score, 0) / skillData.length);
  const strong = skillData.filter((s) => s.score >= 60).map((s) => s.skill);
  const weak = skillData.filter((s) => s.score < 60).map((s) => s.skill);
  const bestFit = careerFit && careerFit.length ? careerFit[0] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen px-6 py-16 max-w-2xl mx-auto text-center relative"
    >
      <ConfettiBurst />
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120 }}
        className="w-24 h-24 mx-auto rounded-full flex items-center justify-center text-3xl font-display font-bold mb-6"
        style={{ background: `${accent}22`, color: accent, border: `2px solid ${accent}` }}
      >
        {avg}
      </motion.div>

      <h2 className="font-display text-3xl text-cloud mb-1">Your CareerMirror score</h2>
      <p className="text-mist mb-8">
        As seen by a {personaInfo.name.toLowerCase()}, targeting {jobTarget}
      </p>

      <div className="flex flex-wrap gap-2 justify-center mb-2">
        {strong.map((s) => (
          <span key={s} className="px-3 py-1 rounded-full bg-coach-soft text-coach text-xs">
            {s}
          </span>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        {weak.map((s) => (
          <span key={s} className="px-3 py-1 rounded-full bg-roast-soft text-roast text-xs">
            {s} — needs work
          </span>
        ))}
      </div>

      <div className="bg-panel border border-line rounded-2xl p-5 mb-8 relative">
        <div className="absolute inset-0 rounded-full blur-2xl opacity-20 m-auto w-1/2 h-1/2" style={{ background: accent }} />
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={skillData} outerRadius="75%">
            <defs>
              <radialGradient id="reportRadarFill" cx="50%" cy="50%" r="65%">
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
              fill="url(#reportRadarFill)"
              animationDuration={1200}
              animationEasing="ease-out"
              dot={{ r: 3, fill: accent, strokeWidth: 0 }}
            />
            <Tooltip content={<ReportTooltip accent={accent} />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {bestFit && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-panel border border-line rounded-2xl p-5 mb-8 text-left"
        >
          <div className="text-cloud font-display font-semibold mb-1">Honest career-fit read</div>
          <p className="text-mist text-sm">
            Across every role we checked, your CV actually scores highest for{" "}
            <span style={{ color: accent }} className="font-medium">{bestFit.field}</span> ({bestFit.score}%)
            {bestFit.field !== jobTarget ? ` — worth considering alongside ${jobTarget}.` : ", which matches what you're targeting."}
          </p>
        </motion.div>
      )}

      <div className="flex gap-3">        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => window.print()}
          className="flex-1 py-3 rounded-full border border-line text-cloud font-medium hover:border-signal transition-colors"
        >
          Download as PDF
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onRestart}
          className="flex-1 py-3 rounded-full bg-signal text-ink font-display font-semibold"
        >
          Try another persona
        </motion.button>
      </div>
    </motion.div>
  );
}
