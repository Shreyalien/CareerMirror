import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import Navbar from "./components/Navbar.jsx";
import Landing from "./components/Landing.jsx";
import Upload from "./components/Upload.jsx";
import PersonaSelect from "./components/PersonaSelect.jsx";
import Analysis from "./components/Analysis.jsx";
import Report from "./components/Report.jsx";
import CvEditorModal from "./components/CvEditorModal.jsx";
import JobMatchModal from "./components/JobMatchModal.jsx";
import DreamJobModal from "./components/DreamJobModal.jsx";
import { Github, Heart } from "./components/Icons.jsx";

export default function App() {
  const [step, setStep] = useState("landing");
  const [cvText, setCvText] = useState("");
  const [persona, setPersona] = useState(null);
  const [jobTarget, setJobTarget] = useState("Full-Stack Developer");
  const [result, setResult] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [jobMatchOpen, setJobMatchOpen] = useState(false);
  const [dreamJobOpen, setDreamJobOpen] = useState(false);

  function resetToLanding() {
    setStep("landing");
    setCvText("");
    setPersona(null);
    setJobTarget("Full-Stack Developer");
    setResult(null);
  }

  function restartToUpload() {
    setStep("upload");
    setResult(null);
  }

  function handleOpenEditor(initialOverrideText) {
    if (typeof initialOverrideText === "string" && initialOverrideText.trim()) {
      setCvText(initialOverrideText);
    }
    setEditorOpen(true);
  }

  function handleOpenJobMatches() {
    setJobMatchOpen(true);
  }

  function handleOpenDreamJob() {
    setDreamJobOpen(true);
  }

  function handleApplyCv(newText, newRole) {
    setCvText(newText);
    if (newRole) {
      setJobTarget(newRole);
    }
    if (step === "landing") {
      setStep("persona");
    }
  }

  return (
    <div className="min-h-screen bg-ink text-cloud flex flex-col font-sans selection:bg-signal/30 selection:text-cloud">
      {/* Top Navigation */}
      <Navbar
        currentStep={step}
        onReset={resetToLanding}
        onOpenEditor={() => handleOpenEditor(cvText)}
        onOpenJobMatches={handleOpenJobMatches}
        onOpenDreamJob={handleOpenDreamJob}
      />

      {/* Global ATS Score Checker & Live CV Editor Modal */}
      <CvEditorModal
        isOpen={editorOpen}
        onClose={() => setEditorOpen(false)}
        initialText={cvText}
        targetRole={jobTarget || "Full-Stack Developer"}
        onApplyCv={handleApplyCv}
      />

      {/* Global Job Matches & Application Guide Modal */}
      <JobMatchModal
        isOpen={jobMatchOpen}
        onClose={() => setJobMatchOpen(false)}
        cvText={cvText}
        targetRole={jobTarget || "Full-Stack Developer"}
      />

      {/* Global Dream Job Skill Gap & ATS Score Booster Modal */}
      <DreamJobModal
        isOpen={dreamJobOpen}
        onClose={() => setDreamJobOpen(false)}
        cvText={cvText}
        onApplyCv={handleApplyCv}
      />

      {/* Main Content View */}
      <main className="flex-1 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {step === "landing" && (
            <Landing key="landing" onStart={() => setStep("upload")} />
          )}

          {step === "upload" && (
            <Upload
              key="upload"
              initialText={cvText}
              onNext={(text) => {
                setCvText(text);
                setStep("persona");
              }}
              onOpenEditor={handleOpenEditor}
            />
          )}

          {step === "persona" && (
            <PersonaSelect
              key="persona"
              cvText={cvText}
              onNext={({ persona, jobTarget }) => {
                setPersona(persona);
                setJobTarget(jobTarget);
                setStep("analysis");
              }}
            />
          )}

          {step === "analysis" && (
            <Analysis
              key="analysis"
              cvText={cvText}
              persona={persona}
              jobTarget={jobTarget}
              onFinish={(r) => {
                setResult(r);
                setStep("report");
              }}
              onOpenEditor={() => handleOpenEditor(cvText)}
              onOpenJobMatches={handleOpenJobMatches}
              onOpenDreamJob={handleOpenDreamJob}
            />
          )}

          {step === "report" && result && (
            <Report
              key="report"
              persona={persona}
              jobTarget={jobTarget}
              mode={result.mode}
              skillData={result.skillData}
              careerFit={result.careerFit}
              onRestart={restartToUpload}
              onOpenEditor={() => handleOpenEditor(cvText)}
              onOpenJobMatches={handleOpenJobMatches}
              onOpenDreamJob={handleOpenDreamJob}
            />
          )}
        </AnimatePresence>
      </main>

      {/* Subtle Global Footer */}
      {step !== "landing" && (
        <footer className="py-3 px-6 border-t border-line/40 text-center text-xs text-mist font-mono flex items-center justify-center gap-2">
          <span>CareerMirror</span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <span>Created by</span>
            <a
              href="https://github.com/Shreyalien"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cloud hover:text-signal font-semibold inline-flex items-center gap-1 transition-colors"
            >
              <Github size={12} />
              <span>Shreyalien (Shreya)</span>
            </a>
          </span>
        </footer>
      )}
    </div>
  );
}
