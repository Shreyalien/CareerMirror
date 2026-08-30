import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PERSONAS, JOB_TARGETS } from "../data/personas";
import { rankCareerFit } from "../data/skillsDB";
import {
  PersonaIcon,
  Target,
  Users,
  Check,
  ArrowRight,
  Sparkles,
  Search,
} from "./Icons.jsx";

export default function PersonaSelect({ cvText = "", onNext }) {
  const fitRanking = useMemo(() => rankCareerFit(cvText), [cvText]);
  const bestMatch = fitRanking[0]?.field || JOB_TARGETS[0];
  const scoreOf = (field) => fitRanking.find((f) => f.field === field)?.score ?? 0;

  const sortedTargets = useMemo(() => {
    return [...JOB_TARGETS].sort((a, b) => scoreOf(b) - scoreOf(a));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitRanking]);

  const TOP_N = 9;
  const [showAllRoles, setShowAllRoles] = useState(false);
  const [roleSearch, setRoleSearch] = useState("");
  const [jobTarget, setJobTarget] = useState(bestMatch);
  const [persona, setPersona] = useState(null);
  const [customRole, setCustomRole] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [showAllPersonas, setShowAllPersonas] = useState(false);

  // Filter targets based on search query
  const filteredTargets = useMemo(() => {
    if (!roleSearch.trim()) {
      return showAllRoles ? sortedTargets : sortedTargets.slice(0, TOP_N);
    }
    const q = roleSearch.toLowerCase().trim();
    return sortedTargets.filter((r) => r.toLowerCase().includes(q));
  }, [roleSearch, showAllRoles, sortedTargets]);

  const effectiveTarget = useCustom && customRole.trim() ? customRole.trim() : jobTarget;

  const sortedPersonas = useMemo(() => {
    return [...PERSONAS].sort((a, b) => {
      const aRec = a.recommendedFor.includes(effectiveTarget) ? 0 : 1;
      const bRec = b.recommendedFor.includes(effectiveTarget) ? 0 : 1;
      return aRec - bRec;
    });
  }, [effectiveTarget]);

  const recommendedCount = sortedPersonas.filter((p) =>
    p.recommendedFor.includes(effectiveTarget)
  ).length;

  const visiblePersonas =
    showAllPersonas || recommendedCount === 0
      ? sortedPersonas
      : sortedPersonas.filter((p) => p.recommendedFor.includes(effectiveTarget));

  // Switching target role resets the selected persona to ensure alignment
  useEffect(() => {
    setShowAllPersonas(false);
    setPersona(null);
  }, [effectiveTarget]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.4 }}
      className="min-h-[calc(100vh-70px)] px-6 py-10 max-w-5xl mx-auto"
    >
      {/* Target Role Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Target size={20} className="text-signal" />
            <h2 className="font-display text-2xl md:text-3xl text-cloud font-bold">1. Select Target Role</h2>
          </div>
          {fitRanking[0] && (
            <span className="text-signal text-xs font-mono inline-flex items-center gap-1.5 bg-signal/10 border border-signal/30 px-3 py-1 rounded-full">
              <Sparkles size={12} /> Detected best fit: <strong>{bestMatch}</strong> ({scoreOf(bestMatch)}%)
            </span>
          )}
        </div>
        <p className="text-mist text-xs md:text-sm mb-4">
          Ranked against your actual CV keywords — closest matches shown first. You can also search or type any custom role.
        </p>

        {/* Role Search & Custom Input Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 mb-4">
          <div className="relative flex-1 w-full">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mist" />
            <input
              value={roleSearch}
              onChange={(e) => setRoleSearch(e.target.value)}
              placeholder="Search target roles (e.g., Customer Support, React, Marketing, UI/UX)..."
              className="w-full bg-panel border border-line rounded-full pl-9 pr-4 py-2 text-xs text-cloud focus:outline-none focus:border-signal transition-colors font-sans"
            />
            {roleSearch && (
              <button
                onClick={() => setRoleSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-mist hover:text-cloud text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <div className="relative flex-1 w-full">
            <input
              value={customRole}
              onChange={(e) => {
                setCustomRole(e.target.value);
                setUseCustom(true);
              }}
              onFocus={() => customRole && setUseCustom(true)}
              placeholder="None of these fit? Type your exact target role..."
              className={`w-full bg-panel border rounded-full px-4 py-2 text-xs text-cloud focus:outline-none transition-colors ${
                useCustom && customRole.trim() ? "border-signal shadow-sm shadow-signal/20" : "border-line"
              }`}
            />
          </div>
        </div>

        {/* Role Pills */}
        <div className="flex flex-wrap gap-2 mb-2">
          <AnimatePresence mode="popLayout">
            {filteredTargets.map((j) => {
              const isSelected = !useCustom && jobTarget === j;
              const matchScore = scoreOf(j);
              return (
                <motion.button
                  key={j}
                  layout
                  onClick={() => {
                    setJobTarget(j);
                    setUseCustom(false);
                  }}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  title={`${matchScore}% CV match`}
                  className={`relative px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    isSelected
                      ? "bg-signal text-ink border-signal shadow-md shadow-signal/20 font-semibold"
                      : "bg-panel text-mist border-line hover:border-signal/50 hover:text-cloud"
                  }`}
                >
                  {j === bestMatch && !useCustom && (
                    <span className="absolute -top-1.5 -right-1.5 text-[8px] px-1.5 py-0.2 rounded-full bg-signal text-ink font-bold inline-flex items-center gap-0.5 shadow-sm">
                      <Sparkles size={8} /> best
                    </span>
                  )}
                  <span>{j}</span>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>

        {!roleSearch && sortedTargets.length > TOP_N && (
          <button
            onClick={() => setShowAllRoles((v) => !v)}
            className="text-signal text-xs hover:underline inline-block mt-1 font-mono"
          >
            {showAllRoles
              ? "← Show closest matches only"
              : `Show all ${sortedTargets.length} standard roles →`}
          </button>
        )}
      </div>

      {/* Recruiter Persona Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Users size={20} className="text-coach" />
            <h2 className="font-display text-2xl md:text-3xl text-cloud font-bold">2. Choose Your Reviewer Persona</h2>
          </div>
          <span className="text-mist text-xs font-mono">
            Evaluating fit for: <strong className="text-cloud">{effectiveTarget}</strong>
          </span>
        </div>
        <p className="text-mist text-xs md:text-sm mb-2">
          Only reviewer bots tailored for <strong className="text-cloud">{effectiveTarget}</strong> are highlighted.
        </p>

        {recommendedCount < PERSONAS.length && recommendedCount > 0 && (
          <button
            onClick={() => setShowAllPersonas((v) => !v)}
            className="text-signal text-xs hover:underline inline-block mb-4 font-mono"
          >
            {showAllPersonas
              ? "← Show only recommended personas"
              : `Show all ${PERSONAS.length} reviewer personas anyway →`}
          </button>
        )}
        {(recommendedCount === PERSONAS.length || recommendedCount === 0) && <div className="mb-4" />}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          <AnimatePresence mode="popLayout">
            {visiblePersonas.map((p, i) => {
              const recommended = p.recommendedFor.includes(effectiveTarget);
              const selected = persona === p.key;
              return (
                <motion.button
                  key={p.key}
                  layout
                  onClick={() => setPersona(p.key)}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.03 }}
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative text-left p-4 rounded-2xl border bg-panel transition-all flex flex-col justify-between group overflow-hidden"
                  style={{
                    borderColor: selected ? p.color : "rgba(42, 47, 66, 0.8)",
                    boxShadow: selected
                      ? `0 0 20px ${p.color}25, inset 0 0 0 1px ${p.color}`
                      : "none",
                    backgroundColor: selected ? `${p.color}08` : "#141826",
                    opacity: recommended || recommendedCount === 0 || showAllPersonas ? 1 : 0.6,
                  }}
                >
                  {/* Recommended Badge */}
                  {recommended && recommendedCount < PERSONAS.length && (
                    <span
                      className="absolute top-3 right-3 text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 shadow-sm"
                      style={{
                        background: `${p.color}20`,
                        color: p.color,
                        border: `1px solid ${p.color}40`,
                      }}
                    >
                      <Sparkles size={10} />
                      Recommended
                    </span>
                  )}

                  <div>
                    <div className="mb-3">
                      <PersonaIcon
                        personaKey={p.iconKey}
                        size={22}
                        color={p.color}
                        withBadge
                      />
                    </div>
                    <div className="font-display text-cloud font-bold text-base mb-1 flex items-center justify-between">
                      <span>{p.name}</span>
                      {selected && (
                        <span
                          className="w-5 h-5 rounded-full flex items-center justify-center text-ink text-xs"
                          style={{ backgroundColor: p.color }}
                        >
                          <Check size={12} strokeWidth={3} />
                        </span>
                      )}
                    </div>
                    <div className="text-cloud/80 text-xs font-medium mb-2 leading-relaxed">
                      {p.tagline}
                    </div>
                  </div>

                  <div className="pt-2.5 mt-2 border-t border-line/60 flex items-center justify-between text-[11px] text-mist">
                    <span className="italic opacity-80">{p.vibe}</span>
                  </div>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Start Button */}
      <motion.button
        whileHover={{ scale: persona ? 1.01 : 1 }}
        whileTap={{ scale: persona ? 0.98 : 1 }}
        disabled={!persona}
        onClick={() => onNext({ persona, jobTarget: effectiveTarget })}
        className={`w-full py-3.5 rounded-full font-display font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
          persona
            ? "bg-signal hover:bg-signal/95 text-ink shadow-signal/20 cursor-pointer"
            : "bg-panel2 text-mist/50 border border-line cursor-not-allowed"
        }`}
      >
        <span>{persona ? `Launch CV Analysis for ${effectiveTarget}` : "Select a Recruiter Persona to Continue"}</span>
        {persona && <ArrowRight size={16} />}
      </motion.button>
    </motion.div>
  );
}
