import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DREAM_JOB_PRESETS, analyzeDreamJobGap } from "../data/dreamJobEngine.js";
import {
  Star,
  Sparkles,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  Wand2,
  Copy,
  Check,
  Zap,
  ArrowRight,
  GraduationCap,
  PlusCircle,
  Building,
  Target,
} from "./Icons.jsx";

export default function DreamJobModal({ isOpen, onClose, cvText, onApplyCv }) {
  const [selectedPresetId, setSelectedPresetId] = useState(DREAM_JOB_PRESETS[0].id);
  const [customRole, setCustomRole] = useState(DREAM_JOB_PRESETS[0].title);
  const [customCompany, setCustomCompany] = useState(DREAM_JOB_PRESETS[0].company);
  const [injected, setInjected] = useState(false);

  const selectedPreset = DREAM_JOB_PRESETS.find((p) => p.id === selectedPresetId) || DREAM_JOB_PRESETS[0];

  const gapAnalysis = useMemo(() => {
    return analyzeDreamJobGap(cvText, customRole || selectedPreset.title, customCompany || selectedPreset.company);
  }, [cvText, customRole, customCompany, selectedPreset]);

  function handleSelectPreset(preset) {
    setSelectedPresetId(preset.id);
    setCustomRole(preset.title);
    setCustomCompany(preset.company);
  }

  function handleInjectSkills() {
    if (!onApplyCv) return;
    const updatedCv = (cvText || "").trim() + gapAnalysis.snippetToInject;
    onApplyCv(updatedCv, customRole);
    setInjected(true);
    setTimeout(() => setInjected(false), 2500);
  }

  if (!isOpen) return null;

  const matchColor =
    gapAnalysis.matchPercentage >= 75
      ? "#4FD1C5"
      : gapAnalysis.matchPercentage >= 55
      ? "#FFC15E"
      : "#FF6B5E";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-ink/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          className="w-full max-w-5xl bg-panel border border-line rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-line flex items-center justify-between bg-panel2/70">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-signal/15 border border-signal/40 flex items-center justify-center text-signal">
                <Star size={18} />
              </div>
              <div>
                <h3 className="font-display font-bold text-cloud text-sm md:text-base flex items-center gap-2">
                  <span>Dream Job Skill Gap Suggestion Box & ATS Booster</span>
                </h3>
                <p className="text-mist text-xs">
                  Discover what skills you need to improve to land your dream role and boost your ATS score
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg border border-line flex items-center justify-center text-mist hover:text-cloud hover:bg-line/40 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Target Dream Job Selector & Inputs */}
          <div className="p-6 border-b border-line bg-panel2/40 space-y-3">
            <div className="text-xs font-semibold text-cloud flex items-center gap-1.5">
              <Lightbulb size={14} className="text-signal" />
              <span>Select a Dream Target Benchmark or Enter Custom Role:</span>
            </div>

            {/* Presets Row */}
            <div className="flex flex-wrap gap-2">
              {DREAM_JOB_PRESETS.map((preset) => {
                const isSelected = selectedPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                      isSelected
                        ? "bg-signal text-ink font-semibold border-signal shadow-sm"
                        : "bg-panel border-line text-mist hover:text-cloud hover:border-signal/40"
                    }`}
                  >
                    <span>{preset.title}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom Inputs */}
            <div className="grid sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[11px] text-mist block mb-1 font-mono">Dream Role Title:</label>
                <input
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  placeholder="e.g. Senior Frontend Engineer"
                  className="w-full bg-panel border border-line rounded-xl px-3.5 py-2 text-xs text-cloud focus:outline-none focus:border-signal font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] text-mist block mb-1 font-mono">Dream Company / Industry:</label>
                <input
                  value={customCompany}
                  onChange={(e) => setCustomCompany(e.target.value)}
                  placeholder="e.g. OpenAI / Stripe / Google"
                  className="w-full bg-panel border border-line rounded-xl px-3.5 py-2 text-xs text-cloud focus:outline-none focus:border-signal font-mono"
                />
              </div>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            {/* Fit Overview Banner */}
            <div className="p-5 rounded-2xl bg-panel2/60 border border-line flex flex-col md:flex-row items-center justify-between gap-5 shadow-sm">
              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-display font-bold text-xl shrink-0 border shadow-lg"
                  style={{
                    backgroundColor: `${matchColor}15`,
                    color: matchColor,
                    borderColor: `${matchColor}40`,
                    boxShadow: `0 0 20px ${matchColor}15`,
                  }}
                >
                  <span>{gapAnalysis.matchPercentage}%</span>
                  <span className="text-[9px] uppercase font-mono text-mist">Match</span>
                </div>

                <div>
                  <div className="text-cloud font-display font-bold text-sm md:text-base flex items-center gap-2">
                    <span>{gapAnalysis.dreamRoleTitle}</span>
                    <span className="text-xs font-normal text-mist">at {gapAnalysis.targetCompany}</span>
                  </div>
                  <p className="text-mist text-xs mt-0.5">
                    {gapAnalysis.missingSkills.length === 0
                      ? "High qualification match! Your CV demonstrates strong core requirements."
                      : `Identified ${gapAnalysis.missingSkills.length} key skill gaps to bridge for maximum interview readiness.`}
                  </p>
                </div>
              </div>

              {/* 1-Click Injection Action */}
              {onApplyCv && (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleInjectSkills}
                  className="shrink-0 px-4 py-2.5 rounded-full bg-signal text-ink font-display font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-signal/20 hover:opacity-90 transition-opacity"
                >
                  {injected ? <Check size={14} className="text-ink" /> : <Wand2 size={14} />}
                  <span>{injected ? "Injected into CV!" : "1-Click Inject Skills & Boost Score"}</span>
                </motion.button>
              )}
            </div>

            {/* Two-Column Grid: Missing Skills to Improve vs Verified Ready Skills */}
            <div className="grid md:grid-cols-2 gap-5">
              {/* Left Column: Skills to Improve */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-display font-semibold text-cloud text-xs flex items-center gap-1.5">
                    <AlertCircle size={14} className="text-roast" />
                    <span>Skills You Need to Improve ({gapAnalysis.missingSkills.length})</span>
                  </h4>
                  <span className="text-[10px] text-mist font-mono">Priority Gaps</span>
                </div>

                {gapAnalysis.missingSkills.length === 0 ? (
                  <div className="p-4 rounded-xl bg-coach-soft/40 border border-coach/30 text-coach text-xs">
                    Great news! Your CV currently satisfies all primary core requirements for this role.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {gapAnalysis.missingSkills.map((gap, i) => (
                      <div
                        key={i}
                        className="p-3.5 rounded-xl bg-panel2 border border-line hover:border-roast/40 transition-colors space-y-1.5 shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-cloud text-xs font-semibold">{gap.skill}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-roast-soft text-roast border border-roast/30 font-mono">
                            {gap.priority}
                          </span>
                        </div>
                        <p className="text-mist text-xs leading-relaxed">{gap.recommendation}</p>
                        <div className="flex flex-wrap gap-1 pt-1">
                          <span className="text-[10px] text-mist mr-1">Recommended Keywords:</span>
                          {gap.keywordsToInclude.map((kw) => (
                            <span key={kw} className="text-[10px] px-1.5 py-0.5 rounded bg-panel border border-line font-mono text-cloud">
                              +{kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Verified Ready Skills */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-display font-semibold text-cloud text-xs flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-coach" />
                    <span>Verified Ready Skills in CV ({gapAnalysis.verifiedSkills.length})</span>
                  </h4>
                  <span className="text-[10px] text-mist font-mono">Validated</span>
                </div>

                {gapAnalysis.verifiedSkills.length === 0 ? (
                  <div className="p-4 rounded-xl bg-panel2 border border-line text-mist text-xs">
                    No exact technical matches found yet in your current CV text. Use the ATS booster below to add relevant keywords.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {gapAnalysis.verifiedSkills.map((ready, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl bg-panel2 border border-line text-xs flex items-center justify-between"
                      >
                        <span className="text-cloud font-medium">{ready.skill}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-coach-soft text-coach border border-coach/30 font-mono flex items-center gap-1">
                          <Check size={10} />
                          Matched
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Tailored Milestone Project Blueprint & Recruiter Signals */}
            <div className="grid md:grid-cols-2 gap-5">
              <div className="p-4 rounded-2xl bg-panel2/60 border border-line space-y-2">
                <div className="font-display font-semibold text-cloud text-xs flex items-center gap-1.5">
                  <GraduationCap size={15} className="text-signal" />
                  <span>Recommended Portfolio Project to Prove Mastery</span>
                </div>
                <p className="text-mist text-xs leading-relaxed">{gapAnalysis.projectBlueprint}</p>
              </div>

              <div className="p-4 rounded-2xl bg-panel2/60 border border-line space-y-2">
                <div className="font-display font-semibold text-cloud text-xs flex items-center gap-1.5">
                  <Sparkles size={15} className="text-signal" />
                  <span>What Recruiters & Hiring Leads Grill You On</span>
                </div>
                <p className="text-mist text-xs leading-relaxed">{gapAnalysis.recruiterInsight}</p>
              </div>
            </div>

            {/* ATS Score Booster Checklist */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-display font-semibold text-cloud text-xs flex items-center gap-1.5">
                  <Zap size={14} className="text-signal" />
                  <span>ATS Score Booster Suggestions for this Dream Role</span>
                </h4>
                <span className="text-[10px] text-coach font-mono font-semibold">+40 pts Potential Gain</span>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {gapAnalysis.atsBoosterSuggestions.map((boost) => (
                  <div key={boost.id} className="p-3.5 rounded-xl bg-panel2 border border-line space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-cloud font-semibold text-xs">{boost.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-coach-soft text-coach border border-coach/30 font-mono font-medium">
                        {boost.points}
                      </span>
                    </div>
                    <p className="text-mist text-xs leading-relaxed">{boost.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-3.5 border-t border-line bg-panel2/70 flex items-center justify-between">
            <span className="text-xs text-mist flex items-center gap-1.5 font-mono">
              <Sparkles size={13} className="text-signal" />
              <span>Clicking '1-Click Inject' adds missing keywords & project highlights directly to your CV.</span>
            </span>

            <button
              onClick={onClose}
              className="px-5 py-2 rounded-full bg-signal text-ink font-display font-semibold text-xs shadow-md shadow-signal/20 hover:opacity-90 transition-opacity"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
