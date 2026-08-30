import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wand2,
  Copy,
  Check,
  Zap,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  FileCheck2,
} from "./Icons.jsx";
import {
  BUZZWORD_REPLACEMENTS,
  BULLET_TRANSFORMATIONS,
  generateBulletRewrite,
} from "../data/rewriterData";

export default function BulletRewriterModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState("transform"); // 'transform' | 'custom' | 'buzzwords'
  const [customInput, setCustomInput] = useState("");
  const [customResult, setCustomResult] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  function handleCopy(text, id) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function handleRewriteCustom() {
    if (!customInput.trim()) return;
    const res = generateBulletRewrite(customInput);
    setCustomResult(res);
  }

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-3xl bg-panel border border-line rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-line flex items-center justify-between bg-panel2/60">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-signal/15 border border-signal/30 flex items-center justify-center text-signal">
                <Wand2 size={18} />
              </div>
              <div>
                <h3 className="font-display font-semibold text-cloud text-base flex items-center gap-2">
                  CV Bullet & Impact Optimizer
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-signal/20 text-signal border border-signal/30 font-mono">
                    PRO TOOL
                  </span>
                </h3>
                <p className="text-mist text-xs">Transform weak, passive job duties into quantified achievement signals</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg border border-line flex items-center justify-center text-mist hover:text-cloud hover:bg-line/40 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-line px-6 pt-3 bg-panel gap-3">
            <button
              onClick={() => setActiveTab("transform")}
              className={`pb-3 text-xs font-medium border-b-2 flex items-center gap-1.5 transition-colors ${
                activeTab === "transform"
                  ? "border-signal text-signal font-semibold"
                  : "border-transparent text-mist hover:text-cloud"
              }`}
            >
              <FileCheck2 size={14} />
              High-Impact Examples
            </button>
            <button
              onClick={() => setActiveTab("custom")}
              className={`pb-3 text-xs font-medium border-b-2 flex items-center gap-1.5 transition-colors ${
                activeTab === "custom"
                  ? "border-signal text-signal font-semibold"
                  : "border-transparent text-mist hover:text-cloud"
              }`}
            >
              <Sparkles size={14} />
              Custom Bullet Transformer
            </button>
            <button
              onClick={() => setActiveTab("buzzwords")}
              className={`pb-3 text-xs font-medium border-b-2 flex items-center gap-1.5 transition-colors ${
                activeTab === "buzzwords"
                  ? "border-signal text-signal font-semibold"
                  : "border-transparent text-mist hover:text-cloud"
              }`}
            >
              <ShieldAlert size={14} />
              Buzzword Purge Matrix
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto space-y-4">
            {activeTab === "transform" && (
              <div className="space-y-4">
                <p className="text-xs text-mist">
                  Recruiters spend 6 seconds scanning. Replace task descriptions with the <strong className="text-cloud">XYZ Formula</strong>: <em>"Accomplished [X] as measured by [Y] by doing [Z]"</em>.
                </p>

                <div className="grid gap-3">
                  {BULLET_TRANSFORMATIONS.map((item, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-panel2 border border-line space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-signal font-mono">{item.role}</span>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-line/60 text-mist">{item.category}</span>
                      </div>
                      <div className="space-y-1.5 text-xs">
                        <div className="p-2.5 rounded bg-roast-soft/40 border border-roast/20 text-mist line-through opacity-80">
                          <span className="text-roast font-semibold not-italic mr-1.5">BEFORE:</span>
                          {item.weak}
                        </div>
                        <div className="p-2.5 rounded bg-coach-soft/40 border border-coach/20 text-cloud flex items-start justify-between gap-2">
                          <div>
                            <span className="text-coach font-semibold mr-1.5">AFTER:</span>
                            {item.improved}
                          </div>
                          <button
                            onClick={() => handleCopy(item.improved, `example-${idx}`)}
                            className="shrink-0 p-1.5 rounded-lg border border-line bg-panel hover:border-signal/50 text-mist hover:text-cloud transition-colors"
                            title="Copy improved bullet"
                          >
                            {copiedId === `example-${idx}` ? <Check size={13} className="text-coach" /> : <Copy size={13} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "custom" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-cloud mb-1.5">
                    Paste a bullet point from your CV:
                  </label>
                  <textarea
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="e.g., Responsible for updating website features and helping with backend database queries..."
                    rows={3}
                    className="w-full bg-panel2 border border-line rounded-xl p-3 text-xs text-cloud focus:outline-none focus:border-signal font-mono"
                  />
                  <div className="mt-2 flex justify-end">
                    <button
                      onClick={handleRewriteCustom}
                      disabled={!customInput.trim()}
                      className="px-4 py-2 rounded-full bg-signal text-ink text-xs font-semibold flex items-center gap-1.5 disabled:opacity-40 hover:opacity-90 transition-opacity"
                    >
                      <Zap size={13} />
                      Transform into High-Impact Bullet
                    </button>
                  </div>
                </div>

                {customResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-panel2 border border-coach/30 space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-coach font-semibold flex items-center gap-1.5">
                        <Check size={14} />
                        Optimized Rewrite Suggestion
                      </span>
                      <button
                        onClick={() => handleCopy(customResult.suggestion, "custom-copy")}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-line bg-panel text-xs text-mist hover:text-cloud hover:border-coach/60 transition-colors"
                      >
                        {copiedId === "custom-copy" ? (
                          <>
                            <Check size={12} className="text-coach" />
                            <span className="text-coach">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy size={12} />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-cloud font-mono leading-relaxed p-3 rounded-lg bg-ink/60 border border-line/60">
                      {customResult.suggestion}
                    </p>
                    <div className="text-[11px] text-mist flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-signal" />
                      Pro Tip: Replace estimated metrics with your real project percentages or user counts.
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {activeTab === "buzzwords" && (
              <div className="space-y-3">
                <p className="text-xs text-mist">
                  Generic adjectives trigger recruiter eye-rolls. Replace empty buzzwords with concrete proof:
                </p>
                <div className="grid sm:grid-cols-2 gap-2.5">
                  {BUZZWORD_REPLACEMENTS.map((item, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-panel2 border border-line space-y-1">
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="text-roast font-mono line-through font-medium">"{item.buzzword}"</span>
                        <ArrowRight size={11} className="text-mist" />
                      </div>
                      <p className="text-[11px] text-cloud font-medium leading-tight">
                        {item.replacement}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-line bg-panel2/40 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-full bg-line text-cloud hover:bg-line/80 text-xs font-medium transition-colors"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
