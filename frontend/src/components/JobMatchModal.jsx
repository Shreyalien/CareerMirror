import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { matchJobsForCv, HIRING_PLATFORMS } from "../data/jobMatchEngine.js";
import {
  Briefcase,
  ExternalLink,
  Search,
  Mail,
  DollarSign,
  MapPin,
  Sparkles,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  Building2,
  Globe,
  Layers,
  ArrowRight,
} from "./Icons.jsx";

export default function JobMatchModal({ isOpen, onClose, cvText, targetRole = "Full-Stack Developer" }) {
  const [activeTab, setActiveTab] = useState("matches"); // 'matches' | 'platforms' | 'outreach' | 'guide'
  const [copiedPitch, setCopiedPitch] = useState(false);

  const jobData = useMemo(() => {
    return matchJobsForCv(cvText, targetRole);
  }, [cvText, targetRole]);

  function handleCopyPitch() {
    navigator.clipboard.writeText(jobData.outreachTemplate);
    setCopiedPitch(true);
    setTimeout(() => setCopiedPitch(false), 2000);
  }

  if (!isOpen) return null;

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
                <Briefcase size={18} />
              </div>
              <div>
                <h3 className="font-display font-bold text-cloud text-sm md:text-base flex items-center gap-2">
                  <span>Job Matches & Application Navigator</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-signal/20 text-signal border border-signal/30 font-mono">
                    {targetRole}
                  </span>
                </h3>
                <p className="text-mist text-xs">
                  Tailored job titles, salary ranges, direct hiring portal links, and cold outreach templates
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

          {/* Navigation Tabs */}
          <div className="flex border-b border-line px-6 pt-2 bg-panel gap-3 overflow-x-auto">
            <button
              onClick={() => setActiveTab("matches")}
              className={`pb-2.5 text-xs font-medium border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                activeTab === "matches"
                  ? "border-signal text-signal font-semibold"
                  : "border-transparent text-mist hover:text-cloud"
              }`}
            >
              <Briefcase size={13} />
              Matched Roles ({jobData.matchedRoles.length})
            </button>

            <button
              onClick={() => setActiveTab("platforms")}
              className={`pb-2.5 text-xs font-medium border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                activeTab === "platforms"
                  ? "border-signal text-signal font-semibold"
                  : "border-transparent text-mist hover:text-cloud"
              }`}
            >
              <Globe size={13} />
              Where to Apply ({HIRING_PLATFORMS.length} Portals)
            </button>

            <button
              onClick={() => setActiveTab("outreach")}
              className={`pb-2.5 text-xs font-medium border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                activeTab === "outreach"
                  ? "border-signal text-signal font-semibold"
                  : "border-transparent text-mist hover:text-cloud"
              }`}
            >
              <Mail size={13} />
              1-Click Recruiter DM Pitch
            </button>

            <button
              onClick={() => setActiveTab("guide")}
              className={`pb-2.5 text-xs font-medium border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                activeTab === "guide"
                  ? "border-signal text-signal font-semibold"
                  : "border-transparent text-mist hover:text-cloud"
              }`}
            >
              <Sparkles size={13} />
              Application Playbook
            </button>
          </div>

          {/* Tab Contents */}
          <div className="p-6 overflow-y-auto space-y-4 flex-1">
            {/* Tab 1: Matched Roles */}
            {activeTab === "matches" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-mist">
                  <span>Roles matched based on technical vocabulary extracted from your CV:</span>
                  <span className="font-mono text-cloud font-medium">Target: {targetRole}</span>
                </div>

                <div className="grid gap-3.5">
                  {jobData.matchedRoles.map((role) => (
                    <motion.div
                      key={role.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-2xl bg-panel2/60 border border-line hover:border-signal/40 transition-all space-y-3 shadow-sm"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-cloud font-display font-bold text-sm">{role.title}</h4>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-signal/15 text-signal border border-signal/30 font-mono">
                              {role.seniority}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-mist mt-1">
                            <span className="flex items-center gap-1 text-coach font-mono font-medium">
                              <DollarSign size={12} />
                              {role.salary}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <MapPin size={12} />
                              {role.workStyle}
                            </span>
                          </div>
                        </div>

                        {/* Match score ring */}
                        <div className="flex items-center gap-2 self-start sm:self-center">
                          <div
                            className="px-2.5 py-1 rounded-xl text-xs font-mono font-bold flex items-center gap-1 border"
                            style={{
                              backgroundColor: role.matchScore >= 80 ? "rgba(79, 209, 197, 0.15)" : "rgba(255, 193, 94, 0.15)",
                              color: role.matchScore >= 80 ? "#4FD1C5" : "#FFC15E",
                              borderColor: role.matchScore >= 80 ? "rgba(79, 209, 197, 0.4)" : "rgba(255, 193, 94, 0.4)",
                            }}
                          >
                            <Sparkles size={11} />
                            <span>{role.matchScore}% Match</span>
                          </div>
                        </div>
                      </div>

                      {/* Skills match badge row */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[11px] text-mist mr-1">Skills:</span>
                        {role.matchedSkills.map((s) => (
                          <span
                            key={s}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-coach-soft/60 border border-coach/30 text-coach flex items-center gap-1"
                          >
                            <Check size={10} />
                            {s}
                          </span>
                        ))}
                        {role.missingSkills.map((s) => (
                          <span
                            key={s}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-panel border border-line text-mist/80"
                            title="Consider adding this skill or project to boost match rate"
                          >
                            + {s}
                          </span>
                        ))}
                      </div>

                      {/* Direct Search 1-Click Buttons */}
                      <div className="pt-2 border-t border-line/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <span className="text-[11px] text-mist font-medium">Search Live Openings:</span>
                        <div className="flex flex-wrap gap-1.5">
                          <a
                            href={role.searchQueries.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 rounded-lg border border-line bg-panel hover:border-[#0A66C2] hover:text-[#0A66C2] text-cloud text-[11px] font-medium flex items-center gap-1 transition-colors"
                          >
                            <span>LinkedIn Jobs</span>
                            <ExternalLink size={11} />
                          </a>
                          <a
                            href={role.searchQueries.wellfound}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 rounded-lg border border-line bg-panel hover:border-[#FF6154] hover:text-[#FF6154] text-cloud text-[11px] font-medium flex items-center gap-1 transition-colors"
                          >
                            <span>Wellfound Startups</span>
                            <ExternalLink size={11} />
                          </a>
                          <a
                            href={role.searchQueries.indeed}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 rounded-lg border border-line bg-panel hover:border-[#2164f3] hover:text-[#2164f3] text-cloud text-[11px] font-medium flex items-center gap-1 transition-colors"
                          >
                            <span>Indeed</span>
                            <ExternalLink size={11} />
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 2: Where to Apply Hub */}
            {activeTab === "platforms" && (
              <div className="space-y-4">
                <p className="text-xs text-mist">
                  Top recommended hiring portals curated for <strong className="text-cloud">{targetRole}</strong> candidates:
                </p>

                <div className="grid sm:grid-cols-2 gap-3.5">
                  {HIRING_PLATFORMS.map((platform) => {
                    const searchUrl = platform.getUrl(targetRole);
                    return (
                      <div
                        key={platform.name}
                        className="p-4 rounded-2xl bg-panel2/60 border border-line hover:border-signal/40 transition-all flex flex-col justify-between space-y-3"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-display font-bold text-cloud text-sm">{platform.name}</span>
                            <span
                              className="text-[10px] px-2 py-0.5 rounded font-mono font-medium"
                              style={{ backgroundColor: `${platform.color}18`, color: platform.color }}
                            >
                              {platform.category}
                            </span>
                          </div>
                          <p className="text-mist text-xs leading-relaxed">{platform.tagline}</p>
                        </div>

                        <a
                          href={searchUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2 rounded-xl bg-panel border border-line hover:border-signal text-cloud text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                        >
                          <span>Open Live {targetRole} Postings</span>
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab 3: Cold Outreach Message Generator */}
            {activeTab === "outreach" && (
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-cloud font-semibold text-xs">Personalized Recruiter & Hiring Manager Pitch</h4>
                    <p className="text-mist text-[11px]">Send this via LinkedIn InMail or cold email within 24 hours of applying.</p>
                  </div>
                  <button
                    onClick={handleCopyPitch}
                    className="px-3 py-1.5 rounded-lg border border-line bg-panel2 hover:border-coach text-xs text-cloud flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    {copiedPitch ? <Check size={13} className="text-coach" /> : <Copy size={13} />}
                    <span>{copiedPitch ? "Copied to Clipboard!" : "Copy Pitch Template"}</span>
                  </button>
                </div>

                <div className="relative">
                  <textarea
                    value={jobData.outreachTemplate}
                    readOnly
                    rows={11}
                    className="w-full bg-panel2/80 border border-line rounded-xl p-4 text-cloud font-mono text-xs focus:outline-none leading-relaxed selection:bg-signal/30 resize-none"
                  />
                </div>

                <div className="p-3 rounded-xl bg-signal/10 border border-signal/30 text-xs text-cloud/90 flex items-start gap-2">
                  <Sparkles size={16} className="text-signal shrink-0 mt-0.5" />
                  <span>
                    <strong>Strategy Tip:</strong> Replace bracketed fields like <em>[Company Name]</em> with specific recent product launches or tech stack details you noticed on their engineering blog.
                  </span>
                </div>
              </div>
            )}

            {/* Tab 4: Application Playbook */}
            {activeTab === "guide" && (
              <div className="space-y-4">
                <p className="text-xs text-mist">
                  Follow this 4-step strategic blueprint to maximize interview response rates:
                </p>

                <div className="grid gap-3">
                  {jobData.applicationSteps.map((step, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-panel2/60 border border-line space-y-1">
                      <div className="font-display font-semibold text-cloud text-xs flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-signal/20 text-signal border border-signal/40 flex items-center justify-center font-mono text-[11px]">
                          {idx + 1}
                        </span>
                        <span>{step.step}</span>
                      </div>
                      <p className="text-mist text-xs pl-7 leading-relaxed">{step.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3.5 border-t border-line bg-panel2/70 flex items-center justify-between">
            <span className="text-xs text-mist flex items-center gap-1.5 font-mono">
              <Sparkles size={13} className="text-signal" />
              <span>Direct links open live hiring portals in new tabs.</span>
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
