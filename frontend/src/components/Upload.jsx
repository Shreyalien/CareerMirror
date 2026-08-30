import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import mammoth from "mammoth";
import {
  UploadCloud,
  FileText,
  FileCode2,
  CheckCircle2,
  Link2,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Zap,
  Sliders,
  Wand2,
} from "./Icons.jsx";
import { SAMPLE_CVS } from "../data/personas";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Upload({ onNext, onOpenEditor, initialText = "" }) {
  const [text, setText] = useState(initialText);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [fileName, setFileName] = useState("");
  const [driveLink, setDriveLink] = useState("");
  const [fetchingDrive, setFetchingDrive] = useState(false);

  async function extractPdfText(file) {
    const buffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      fullText += content.items.map((it) => it.str).join(" ") + "\n";
    }
    return fullText.trim();
  }

  async function extractDocxText(file) {
    const buffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer: buffer });
    return result.value.trim();
  }

  async function handleFile(file) {
    if (!file) return;
    setError("");
    setFileName(file.name);
    const lower = file.name.toLowerCase();

    try {
      setParsing(true);
      let extracted = "";
      if (lower.endsWith(".pdf")) {
        extracted = await extractPdfText(file);
      } else if (lower.endsWith(".docx")) {
        extracted = await extractDocxText(file);
      } else if (lower.endsWith(".txt")) {
        extracted = await file.text();
      } else if (lower.endsWith(".doc")) {
        setError("Legacy .doc format cannot be parsed directly in browser — please convert to .docx or .pdf.");
        setParsing(false);
        return;
      } else {
        setError("Unsupported file format. Please upload .pdf, .docx, or .txt.");
        setParsing(false);
        return;
      }

      if (extracted.length < 20) {
        setError("Could not extract readable text from that file — try pasting the text below.");
      } else {
        setText(extracted);
      }
    } catch {
      setError("Failed to parse this document. Try copying and pasting the text below.");
    } finally {
      setParsing(false);
    }
  }

  async function handleDriveFetch() {
    if (!driveLink.trim()) return;
    setError("");
    setFetchingDrive(true);
    try {
      const res = await fetch(`${API_URL}/api/fetch-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ link: driveLink.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to fetch document link.");
      } else if (data.text.length < 20) {
        setError("Document appeared empty — make sure sharing permissions are set to 'Anyone with link'.");
      } else {
        setText(data.text);
        setFileName("Imported via Link");
      }
    } catch {
      setError("Could not connect to the backend link fetcher. Ensure server is active.");
    } finally {
      setFetchingDrive(false);
    }
  }

  function handleLoadSample(sample) {
    setText(sample.text);
    setFileName(`Sample: ${sample.label}`);
    setError("");
  }

  function handleContinue() {
    if (text.trim().length < 20) {
      setError("Please provide more CV content (at least a few paragraphs) for an accurate analysis.");
      return;
    }
    setError("");
    onNext(text);
  }

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.4 }}
      className="min-h-[calc(100vh-70px)] px-6 py-10 max-w-2xl mx-auto flex flex-col justify-center"
    >
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <div>
          <h2 className="font-display text-2xl md:text-3xl text-cloud font-bold mb-1 flex items-center gap-2.5">
            <FileText className="text-signal" size={26} />
            Upload Your CV
          </h2>
          <p className="text-mist text-xs md:text-sm">
            PDF, Word (.docx), or plain text. You can also edit and check ATS score in real-time.
          </p>
        </div>

        {onOpenEditor && (
          <button
            onClick={() => onOpenEditor(text)}
            className="px-3.5 py-1.5 rounded-full border border-signal/40 bg-signal/10 hover:bg-signal text-signal hover:text-ink text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Sliders size={13} />
            <span>Open ATS Studio</span>
          </button>
        )}
      </div>

      {/* Quick Sample Selector */}
      <div className="mb-5 p-3 rounded-xl bg-panel2/70 border border-line flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 text-xs text-mist font-medium">
          <Sparkles size={14} className="text-signal" />
          <span>Need a quick test?</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {SAMPLE_CVS.map((s) => (
            <button
              key={s.id}
              onClick={() => handleLoadSample(s)}
              className="px-2.5 py-1 rounded-lg bg-panel border border-line hover:border-signal/50 text-[11px] text-cloud font-mono hover:text-signal transition-colors flex items-center gap-1"
            >
              <Zap size={10} className="text-signal" />
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Drag and Drop Zone */}
      <motion.div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFile(e.dataTransfer.files[0]);
        }}
        animate={{
          borderColor: dragging ? "#8B7BFF" : "#2A2F42",
          backgroundColor: dragging ? "rgba(139, 123, 255, 0.06)" : "#141826",
          scale: dragging ? 1.01 : 1,
        }}
        whileHover={{ scale: 1.005 }}
        className="border-2 border-dashed rounded-2xl p-7 text-center mb-4 bg-panel relative overflow-hidden transition-all shadow-sm"
      >
        <AnimatePresence mode="wait">
          {parsing ? (
            <motion.div
              key="parsing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3 py-4"
            >
              <div className="w-12 h-12 rounded-xl bg-signal/10 border border-signal/30 flex items-center justify-center text-signal animate-spin">
                <FileCode2 size={24} />
              </div>
              <p className="text-signal text-sm font-medium">Extracting textual structure from document...</p>
            </motion.div>
          ) : (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="w-12 h-12 rounded-xl bg-panel2 border border-line flex items-center justify-center text-signal mx-auto mb-3 shadow-inner">
                <UploadCloud size={24} />
              </div>
              <p className="text-cloud text-sm font-medium mb-1">Drag and drop your CV file here</p>
              <p className="text-mist text-xs mb-3">Supports .pdf, .docx, or .txt</p>
              <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-line bg-panel2 text-cloud text-xs font-medium cursor-pointer hover:border-signal hover:text-signal transition-all shadow-sm">
                <span>Browse Local File</span>
                <input
                  type="file"
                  accept=".pdf,.docx,.doc,.txt"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files[0])}
                />
              </label>
              {fileName && !error && (
                <div className="flex items-center justify-center gap-1.5 text-coach text-xs mt-3 bg-coach-soft/40 py-1 px-3 rounded-full mx-auto w-fit border border-coach/30">
                  <CheckCircle2 size={13} />
                  <span>{fileName} loaded successfully</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Link importer divider */}
      <div className="flex items-center gap-3 my-3">
        <div className="flex-1 h-px bg-line" />
        <span className="text-mist text-[11px] uppercase tracking-wider font-mono">Or import direct link</span>
        <div className="flex-1 h-px bg-line" />
      </div>

      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Link2 size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mist" />
          <input
            value={driveLink}
            onChange={(e) => setDriveLink(e.target.value)}
            placeholder="Google Docs URL, Drive PDF link, or public URL"
            className="w-full bg-panel border border-line rounded-xl pl-9 pr-4 py-2.5 text-xs text-cloud focus:outline-none focus:border-signal transition-colors font-mono"
          />
        </div>
        <button
          onClick={handleDriveFetch}
          disabled={fetchingDrive || !driveLink.trim()}
          className="px-4 py-2.5 rounded-xl bg-panel2 border border-line text-cloud text-xs font-medium disabled:opacity-40 hover:border-signal/60 transition-colors shrink-0 flex items-center gap-1.5"
        >
          {fetchingDrive ? (
            <span className="animate-pulse">Fetching...</span>
          ) : (
            <>
              <ArrowRight size={13} />
              <span>Fetch</span>
            </>
          )}
        </button>
      </div>

      {/* Text Area Header with Live Editor Link */}
      <div className="relative">
        <div className="flex items-center justify-between text-xs text-mist mb-1.5">
          <span>CV Raw Text Content</span>
          <div className="flex items-center gap-2">
            {wordCount > 0 && <span className="font-mono text-[11px]">{wordCount} words</span>}
            {onOpenEditor && (
              <button
                onClick={() => onOpenEditor(text)}
                className="text-signal hover:underline text-[11px] font-medium flex items-center gap-1"
              >
                <Wand2 size={11} />
                <span>Live Editor & Auto-Fix</span>
              </button>
            )}
          </div>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="...or paste your complete CV text directly here"
          rows={7}
          className="w-full bg-panel border border-line rounded-xl p-3.5 text-cloud font-mono text-xs focus:outline-none focus:border-signal transition-colors resize-y leading-relaxed"
        />
      </div>

      {/* Error alert */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 p-3 rounded-xl bg-roast-soft/40 border border-roast/30 text-roast text-xs mt-3"
          >
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit button */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleContinue}
        disabled={text.trim().length < 20}
        className="mt-5 w-full py-3.5 rounded-full bg-signal hover:bg-signal/95 text-ink font-display font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-signal/20 transition-all"
      >
        <span>Proceed to Persona Selection</span>
        <ArrowRight size={16} />
      </motion.button>
    </motion.div>
  );
}
