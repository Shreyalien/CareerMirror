import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  evaluateAtsScore,
  autoFixCv,
} from "../data/atsEngine.js";
import {
  Wand2,
  Copy,
  Check,
  Zap,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  RotateCcw,
  Download,
  FileText,
  Sliders,
  ListChecks,
  Undo2,
  CheckCheck,
  Filter,
} from "./Icons.jsx";

export default function CvEditorModal({ isOpen, onClose, initialText, targetRole = "Full-Stack Developer", onApplyCv }) {
  const [editorText, setEditorText] = useState(initialText || "");
  const [history, setHistory] = useState([initialText || ""]);
  const [appliedChanges, setAppliedChanges] = useState(null);
  const [copied, setCopied] = useState(false);
  const [checklistFilter, setChecklistFilter] = useState("all"); // 'all' | 'issues' | 'passed'
  const [selectedRole, setSelectedRole] = useState(targetRole);

  useEffect(() => {
    if (initialText) {
      setEditorText(initialText);
      setHistory([initialText]);
      setAppliedChanges(null);
    }
  }, [initialText, isOpen]);

  // Real-time ATS Evaluation
  const atsResult = useMemo(() => {
    return evaluateAtsScore(editorText, selectedRole);
  }, [editorText, selectedRole]);

  function handleTextChange(newVal) {
    setEditorText(newVal);
  }

  function handleAutoFix() {
    const fixResult = autoFixCv(editorText, selectedRole);
    setHistory((prev) => [...prev, editorText]);
    setEditorText(fixResult.fixedText);
    setAppliedChanges(fixResult);
  }

  function handleUndo() {
    if (history.length > 1) {
      const prev = history[history.length - 1];
      setHistory((h) => h.slice(0, -1));
      setEditorText(prev);
      setAppliedChanges(null);
    }
  }

  function handleStandardizeBullets() {
    const lines = editorText.split("\n");
    let count = 0;
    const formatted = lines.map((l) => {
      const trimmed = l.trim();
      if (/^[-*>]\s*/.test(trimmed)) {
        count++;
        return "• " + trimmed.replace(/^[-*>]\s*/, "");
      }
      return l;
    });
    setHistory((prev) => [...prev, editorText]);
    setEditorText(formatted.join("\n"));
    setAppliedChanges({
      changes: [`Standardized ${count} bullet points to clean ATS format`],
      scoreBefore: atsResult.overallScore,
      scoreAfter: Math.min(100, atsResult.overallScore + 8),
    });
  }

  function handleInsertHeaders() {
    const template = `PROFESSIONAL SUMMARY\n• Results-driven professional with strong technical background and execution capabilities.\n\nWORK EXPERIENCE\n• Software Developer — Tech Corp (2022 - Present)\n  - Engineered scalable systems with 99.9% uptime and reduced latency by 30%.\n\nTECHNICAL SKILLS\n• Core: Clean Code, APIs, Databases, Testing\n\nEDUCATION\n• Relevant Degree / Certifications`;
    setHistory((prev) => [...prev, editorText]);
    setEditorText(editorText.trim() ? `${editorText}\n\n${template}` : template);
    setAppliedChanges({
      changes: ["Injected standard ATS section headers (SUMMARY, EXPERIENCE, SKILLS, EDUCATION)"],
      scoreBefore: atsResult.overallScore,
      scoreAfter: Math.min(100, atsResult.overallScore + 15),
    });
  }

  function handleCopy() {
    navigator.clipboard.writeText(editorText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownloadTxt() {
    const blob = new Blob([editorText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CV_Optimized_${selectedRole.replace(/\s+/g, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleSaveAndApply() {
    if (onApplyCv) {
      onApplyCv(editorText, selectedRole);
    }
    onClose();
  }

  if (!isOpen) return null;

  const score = atsResult.overallScore;
  const scoreColor = score >= 80 ? "#4FD1C5" : score >= 60 ? "#FFC15E" : "#FF6B5E";

  const filteredChecklist = atsResult.checklist.filter((item) => {
    if (checklistFilter === "issues") return item.status === "fail" || item.status === "warning";
    if (checklistFilter === "passed") return item.status === "pass";
    return true;
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-ink/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          className="w-full max-w-6xl bg-panel border border-line rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[92vh]"
        >
          {/* Header */}
          <div className="px-6 py-3.5 border-b border-line flex items-center justify-between bg-panel2/80">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-signal/15 border border-signal/40 flex items-center justify-center text-signal">
                <Sliders size={18} />
              </div>
              <div>
                <h3 className="font-display font-bold text-cloud text-sm md:text-base flex items-center gap-2">
                  <span>ATS Score Checker & Live CV Editor</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-signal/20 text-signal border border-signal/30 font-mono">
                    LIVE REAL-TIME
                  </span>
                </h3>
                <p className="text-mist text-xs">
                  Real-time ATS parser, grammar & buzzword cleaner with 1-click auto-fix
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

          {/* Main Body (Split Pane) */}
          <div className="flex-1 grid lg:grid-cols-12 overflow-hidden">
            {/* Left Pane: Live Editor (7 cols) */}
            <div className="lg:col-span-7 border-r border-line flex flex-col bg-panel overflow-hidden">
              {/* Editor Toolbar */}
              <div className="p-3 border-b border-line bg-panel2/50 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex flex-wrap items-center gap-1.5">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleAutoFix}
                    className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-signal to-[#4FD1C5] text-ink font-semibold flex items-center gap-1.5 shadow-md shadow-signal/20 hover:opacity-95 transition-opacity"
                    title="1-Click: Upgrade passive verbs, purge buzzwords, and standardize formatting"
                  >
                    <Wand2 size={13} />
                    <span>Magic Auto-Fix CV (1-Click)</span>
                  </motion.button>

                  <button
                    onClick={handleStandardizeBullets}
                    className="px-2.5 py-1.5 rounded-lg bg-panel border border-line hover:border-signal/40 text-mist hover:text-cloud transition-colors"
                    title="Convert irregular bullet styles to clean ATS bullets"
                  >
                    Format Bullets (•)
                  </button>

                  <button
                    onClick={handleInsertHeaders}
                    className="px-2.5 py-1.5 rounded-lg bg-panel border border-line hover:border-signal/40 text-mist hover:text-cloud transition-colors"
                    title="Insert standard ATS section headings"
                  >
                    + ATS Headers
                  </button>

                  {history.length > 1 && (
                    <button
                      onClick={handleUndo}
                      className="px-2.5 py-1.5 rounded-lg bg-panel border border-line hover:border-roast/40 text-mist hover:text-cloud flex items-center gap-1 transition-colors"
                      title="Undo last auto-fix"
                    >
                      <Undo2 size={12} />
                      <span>Undo</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-mist">
                    {atsResult.stats.wordCount} words
                  </span>
                  <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-lg border border-line bg-panel hover:border-signal/40 text-mist hover:text-cloud transition-colors"
                    title="Copy edited CV text"
                  >
                    {copied ? <Check size={13} className="text-coach" /> : <Copy size={13} />}
                  </button>
                  <button
                    onClick={handleDownloadTxt}
                    className="p-1.5 rounded-lg border border-line bg-panel hover:border-signal/40 text-mist hover:text-cloud transition-colors"
                    title="Download clean .txt file"
                  >
                    <Download size={13} />
                  </button>
                </div>
              </div>

              {/* Auto-Fix Banner / Changelog */}
              <AnimatePresence>
                {appliedChanges && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3 bg-coach-soft/30 border-b border-coach/30 text-xs text-cloud"
                  >
                    <div className="flex items-center justify-between mb-1.5 font-semibold text-coach">
                      <div className="flex items-center gap-1.5">
                        <Sparkles size={14} />
                        <span>Auto-Fix Applied Successfully!</span>
                      </div>
                      <span className="font-mono text-[11px]">
                        ATS Score: {appliedChanges.scoreBefore} →{" "}
                        <strong className="text-coach">{atsResult.overallScore}/100</strong>
                      </span>
                    </div>
                    <ul className="space-y-1 text-[11px] text-cloud/90 list-disc list-inside">
                      {appliedChanges.changes.slice(0, 4).map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Live Text Area */}
              <div className="flex-1 p-4 overflow-y-auto">
                <textarea
                  value={editorText}
                  onChange={(e) => handleTextChange(e.target.value)}
                  placeholder="Paste or type your CV text here..."
                  className="w-full h-full bg-transparent border-0 text-cloud font-mono text-xs focus:outline-none resize-none leading-relaxed selection:bg-signal/30"
                  spellCheck="false"
                />
              </div>
            </div>

            {/* Right Pane: ATS Score & Real-Time Inspector (5 cols) */}
            <div className="lg:col-span-5 flex flex-col bg-panel2/40 overflow-y-auto p-5 space-y-5">
              {/* ATS Score Radial Card */}
              <div className="bg-panel border border-line rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-cloud uppercase font-mono tracking-wider">
                    ATS Compatibility Index
                  </span>
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold"
                    style={{
                      backgroundColor: `${scoreColor}20`,
                      color: scoreColor,
                      border: `1px solid ${scoreColor}40`,
                    }}
                  >
                    {atsResult.rating}
                  </span>
                </div>

                <div className="flex items-center gap-5">
                  <div
                    className="w-20 h-20 rounded-2xl flex flex-col items-center justify-center font-display font-bold shadow-lg shrink-0"
                    style={{
                      background: `radial-gradient(circle, ${scoreColor}25 0%, ${scoreColor}08 70%)`,
                      color: scoreColor,
                      border: `2px solid ${scoreColor}`,
                      boxShadow: `0 0 20px ${scoreColor}20`,
                    }}
                  >
                    <span className="text-2xl font-mono">{score}</span>
                    <span className="text-[9px] uppercase font-mono text-mist">/ 100</span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <p className="text-cloud font-semibold">
                      {score >= 80
                        ? "High ATS Pass Probability"
                        : score >= 60
                        ? "Moderate Risk of Filter Rejection"
                        : "High Risk of ATS Filtering"}
                    </p>
                    <p className="text-mist text-[11px] leading-relaxed">
                      {score >= 80
                        ? "Structure, action verbs, and keyword density meet top candidate thresholds."
                        : "Click 'Magic Auto-Fix' on the left to instantly resolve passive phrases and missing headers."}
                    </p>
                  </div>
                </div>

                {/* 4 Category Breakdown Progress Bars */}
                <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-line/60">
                  {Object.entries(atsResult.categories).map(([key, cat]) => (
                    <div key={key} className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-mist">{cat.label}</span>
                        <span className="font-mono text-cloud font-semibold">{cat.score}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-panel2 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${cat.score}%`,
                            backgroundColor: cat.score >= 70 ? "#4FD1C5" : cat.score >= 45 ? "#FFC15E" : "#FF6B5E",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Real-Time ATS Checklist */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-cloud">
                    <ListChecks size={15} className="text-signal" />
                    <span>Real-Time Audit Checklist</span>
                  </div>

                  {/* Filter tabs */}
                  <div className="flex items-center gap-1 text-[10px] p-0.5 rounded-lg bg-panel border border-line">
                    <button
                      onClick={() => setChecklistFilter("all")}
                      className={`px-2 py-0.5 rounded ${checklistFilter === "all" ? "bg-signal text-ink font-semibold" : "text-mist hover:text-cloud"}`}
                    >
                      All ({atsResult.checklist.length})
                    </button>
                    <button
                      onClick={() => setChecklistFilter("issues")}
                      className={`px-2 py-0.5 rounded ${checklistFilter === "issues" ? "bg-signal text-ink font-semibold" : "text-mist hover:text-cloud"}`}
                    >
                      Issues ({atsResult.checklist.filter((i) => i.status !== "pass").length})
                    </button>
                    <button
                      onClick={() => setChecklistFilter("passed")}
                      className={`px-2 py-0.5 rounded ${checklistFilter === "passed" ? "bg-signal text-ink font-semibold" : "text-mist hover:text-cloud"}`}
                    >
                      Passed ({atsResult.checklist.filter((i) => i.status === "pass").length})
                    </button>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {filteredChecklist.map((item) => {
                    const isPass = item.status === "pass";
                    const isWarning = item.status === "warning";
                    const statusColor = isPass ? "#4FD1C5" : isWarning ? "#FFC15E" : "#FF6B5E";

                    return (
                      <div
                        key={item.id}
                        className="p-3 rounded-xl bg-panel border border-line space-y-1.5 shadow-sm"
                        style={{
                          borderLeftWidth: "3px",
                          borderLeftColor: statusColor,
                        }}
                      >
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 font-semibold text-cloud">
                            {isPass ? (
                              <CheckCircle2 size={14} className="text-coach" />
                            ) : isWarning ? (
                              <AlertTriangle size={14} className="text-[#FFC15E]" />
                            ) : (
                              <AlertCircle size={14} className="text-roast" />
                            )}
                            <span>{item.title}</span>
                          </div>
                          <span className="font-mono text-[11px]" style={{ color: statusColor }}>
                            {item.score}
                          </span>
                        </div>
                        <p className="text-mist text-[11px] leading-relaxed">
                          {item.desc}
                        </p>
                        {!isPass && item.tip && (
                          <div className="p-2 rounded-lg bg-panel2 text-[10px] text-cloud/90 flex items-start gap-1.5 border border-line/60">
                            <span className="text-signal font-semibold uppercase font-mono">FIX TIP:</span>
                            <span>{item.tip}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-3.5 border-t border-line bg-panel2/80 flex items-center justify-between gap-3">
            <div className="text-xs text-mist flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-signal animate-pulse" />
              <span>Edits are saved directly into your current session.</span>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-full border border-line bg-panel text-mist hover:text-cloud text-xs font-medium transition-colors"
              >
                Close Without Applying
              </button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSaveAndApply}
                className="px-6 py-2 rounded-full bg-signal text-ink font-display font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-signal/20"
              >
                <CheckCheck size={14} />
                <span>Apply Changes & Continue</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
