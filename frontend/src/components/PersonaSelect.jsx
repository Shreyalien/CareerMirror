import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { PERSONAS, JOB_TARGETS } from "../data/personas";

export default function PersonaSelect({ onNext }) {
  const [jobTarget, setJobTarget] = useState(JOB_TARGETS[0]);
  const [persona, setPersona] = useState(null);

  const sorted = useMemo(() => {
    return [...PERSONAS].sort((a, b) => {
      const aRec = a.recommendedFor.includes(jobTarget) ? 0 : 1;
      const bRec = b.recommendedFor.includes(jobTarget) ? 0 : 1;
      return aRec - bRec;
    });
  }, [jobTarget]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen px-6 py-16 max-w-4xl mx-auto"
    >
      <h2 className="font-display text-3xl text-cloud mb-2">Target role first</h2>
      <p className="text-mist mb-4">This decides which recruiters get recommended to you.</p>

      <div className="flex flex-wrap gap-2 mb-10">
        {JOB_TARGETS.map((j) => (
          <motion.button
            key={j}
            onClick={() => setJobTarget(j)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
              jobTarget === j
                ? "bg-signal text-ink border-signal"
                : "bg-panel text-mist border-line hover:border-signal"
            }`}
          >
            {j}
          </motion.button>
        ))}
      </div>

      <h2 className="font-display text-3xl text-cloud mb-2">Who's reading your CV?</h2>
      <p className="text-mist mb-6">
        Nine recruiter bots, each with their own priorities. Same CV, wildly different verdicts.
      </p>

      <div className="grid md:grid-cols-3 gap-4 mb-10">
        {sorted.map((p, i) => {
          const recommended = p.recommendedFor.includes(jobTarget);
          const selected = persona === p.key;
          return (
            <motion.button
              key={p.key}
              onClick={() => setPersona(p.key)}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -5, rotate: [0, -1, 1, 0] }}
              whileTap={{ scale: 0.97 }}
              className="relative text-left p-5 rounded-2xl border bg-panel transition-colors"
              style={{
                borderColor: selected ? p.color : "#2A2F42",
                boxShadow: selected ? `0 0 0 1px ${p.color}` : "none",
              }}
            >
              {recommended && (
                <span
                  className="absolute -top-2 -right-2 text-[10px] px-2 py-0.5 rounded-full font-medium"
                  style={{ background: `${p.color}22`, color: p.color, border: `1px solid ${p.color}` }}
                >
                  Recommended
                </span>
              )}
              <div className="text-3xl mb-3">{p.icon}</div>
              <div className="font-display text-cloud font-semibold mb-1">{p.name}</div>
              <div className="text-mist text-xs mb-1">{p.tagline}</div>
              <div className="text-mist text-xs italic opacity-70">{p.vibe}</div>
            </motion.button>
          );
        })}
      </div>

      <motion.button
        whileHover={{ scale: persona ? 1.03 : 1 }}
        whileTap={{ scale: persona ? 0.97 : 1 }}
        disabled={!persona}
        onClick={() => onNext({ persona, jobTarget })}
        className={`w-full py-3 rounded-full font-display font-semibold transition-opacity ${
          persona ? "bg-signal text-ink" : "bg-panel2 text-mist cursor-not-allowed"
        }`}
      >
        {persona ? "Start analysis →" : "Pick a persona first"}
      </motion.button>
    </motion.div>
  );
}
