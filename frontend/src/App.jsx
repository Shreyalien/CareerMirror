import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import Landing from "./components/Landing.jsx";
import Upload from "./components/Upload.jsx";
import PersonaSelect from "./components/PersonaSelect.jsx";
import Analysis from "./components/Analysis.jsx";
import Report from "./components/Report.jsx";

export default function App() {
  const [step, setStep] = useState("landing");
  const [cvText, setCvText] = useState("");
  const [persona, setPersona] = useState(null);
  const [jobTarget, setJobTarget] = useState(null);
  const [result, setResult] = useState(null);

  function restart() {
    setStep("upload");
    setResult(null);
  }

  return (
    <div className="min-h-screen bg-ink">
      <AnimatePresence mode="wait">
        {step === "landing" && <Landing key="landing" onStart={() => setStep("upload")} />}

        {step === "upload" && (
          <Upload
            key="upload"
            onNext={(text) => {
              setCvText(text);
              setStep("persona");
            }}
          />
        )}

        {step === "persona" && (
          <PersonaSelect
            key="persona"
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
            onRestart={restart}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
