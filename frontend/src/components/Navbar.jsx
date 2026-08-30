import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BrandLogo, RotateCcw, Cpu, Sparkles, CheckCircle2, Sliders, Briefcase, Star } from "./Icons.jsx";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const STEPS = [
  { id: "upload", label: "Upload CV" },
  { id: "persona", label: "Select Persona" },
  { id: "analysis", label: "Analysis" },
  { id: "report", label: "Executive Report" },
];

export default function Navbar({ currentStep, onReset, onOpenEditor, onOpenJobMatches, onOpenDreamJob }) {
  const [hasKey, setHasKey] = useState(false);
  const [serverOnline, setServerOnline] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/health`)
      .then((r) => r.json())
      .then((data) => {
        setServerOnline(Boolean(data.ok));
        setHasKey(Boolean(data.hasKey));
      })
      .catch(() => {
        setServerOnline(false);
      });
  }, []);

  const currentIndex = STEPS.findIndex((s) => s.id === currentStep);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-line/60 bg-ink/85 backdrop-blur-md px-6 py-3.5 transition-all">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        {/* Brand */}
        <button
          onClick={onReset}
          className="flex items-center gap-2 hover:opacity-90 transition-opacity focus:outline-none"
        >
          <BrandLogo />
        </button>

        {/* Step Indicator (when past landing) */}
        {currentStep !== "landing" && (
          <div className="hidden md:flex items-center gap-2 text-xs">
            {STEPS.map((step, idx) => {
              const isPast = idx < currentIndex;
              const isCurrent = idx === currentIndex;
              return (
                <div key={step.id} className="flex items-center gap-2">
                  <div
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-all ${
                      isCurrent
                        ? "bg-signal/15 border-signal/60 text-signal font-medium shadow-sm shadow-signal/10"
                        : isPast
                        ? "bg-panel border-line text-cloud/70"
                        : "bg-transparent border-transparent text-mist/50"
                    }`}
                  >
                    {isPast ? (
                      <CheckCircle2 size={12} className="text-coach" />
                    ) : (
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isCurrent ? "bg-signal animate-pulse" : "bg-mist/40"
                        }`}
                      />
                    )}
                    <span>{step.label}</span>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <span className="text-line text-xs font-mono">/</span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Right side status & action buttons */}
        <div className="flex items-center gap-2.5">
          {/* Dream Job & ATS Booster Button */}
          {onOpenDreamJob && (
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={onOpenDreamJob}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-signal/50 bg-signal/15 hover:bg-signal text-signal hover:text-ink text-xs font-semibold transition-all shadow-sm shadow-signal/15"
              title="Dream Job Skill Gap Suggestion Box & ATS Score Booster"
            >
              <Star size={13} />
              <span className="hidden sm:inline">Dream Job & Booster</span>
              <span className="sm:hidden">Dream Job</span>
            </motion.button>
          )}

          {/* Job Matches Button */}
          {onOpenJobMatches && (
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={onOpenJobMatches}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-coach/40 bg-coach/10 hover:bg-coach text-coach hover:text-ink text-xs font-semibold transition-all shadow-sm shadow-coach/10"
              title="View Matched Jobs, Salary Benchmarks & Application Guide"
            >
              <Briefcase size={13} />
              <span className="hidden sm:inline">Jobs & Apply</span>
              <span className="sm:hidden">Jobs</span>
            </motion.button>
          )}

          {/* ATS Studio Button */}
          {onOpenEditor && (
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={onOpenEditor}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-line bg-panel2 hover:border-signal text-cloud text-xs font-semibold transition-all shadow-sm"
              title="Open Live ATS Score Checker & CV Editor"
            >
              <Sliders size={13} />
              <span className="hidden sm:inline">ATS Studio</span>
              <span className="sm:hidden">ATS</span>
            </motion.button>
          )}

          {/* Engine Status Pill */}
          <div
            className="flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-mono tracking-tight"
            style={{
              borderColor: serverOnline ? "rgba(79, 209, 197, 0.3)" : "rgba(255, 107, 94, 0.3)",
              backgroundColor: serverOnline ? "rgba(79, 209, 197, 0.08)" : "rgba(255, 107, 94, 0.08)",
              color: serverOnline ? "#4FD1C5" : "#FF6B5E",
            }}
            title={
              hasKey
                ? "Connected to Claude AI Engine"
                : "Using Fast Local Heuristics Engine"
            }
          >
            {hasKey ? (
              <>
                <Sparkles size={12} className="text-signal animate-pulse" />
                <span className="hidden md:inline">Claude Active</span>
                <span className="md:hidden">Claude</span>
              </>
            ) : (
              <>
                <Cpu size={12} />
                <span className="hidden md:inline">Local Engine</span>
                <span className="md:hidden">Local</span>
              </>
            )}
          </div>

          {currentStep !== "landing" && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-line bg-panel text-mist hover:text-cloud hover:border-signal/50 text-xs transition-colors"
              title="Start over with a new CV"
            >
              <RotateCcw size={12} />
              <span className="hidden sm:inline">Reset</span>
            </motion.button>
          )}
        </div>
      </div>
    </header>
  );
}
