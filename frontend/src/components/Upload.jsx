import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import mammoth from "mammoth";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Upload({ onNext }) {
  const [text, setText] = useState("");
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
        setError("Old .doc format isn't readable in-browser — save it as .docx or PDF and try again.");
        setParsing(false);
        return;
      } else {
        setError("Unsupported file type. Try .pdf, .docx, or .txt.");
        setParsing(false);
        return;
      }

      if (extracted.length < 20) {
        setError("Couldn't find readable text in that file — try pasting the text instead.");
      } else {
        setText(extracted);
      }
    } catch (e) {
      setError("Couldn't read that file. Try a different one or paste the text below.");
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
        setError(data.error || "Couldn't fetch that link.");
      } else if (data.text.length < 20) {
        setError("That document looked empty — try pasting the text instead.");
      } else {
        setText(data.text);
        setFileName("Link");
      }
    } catch {
      setError("Couldn't reach the backend to fetch that link.");
    } finally {
      setFetchingDrive(false);
    }
  }

  function handleContinue() {
    if (text.trim().length < 20) {
      setError("Paste a bit more of your CV — at least a few lines.");
      return;
    }
    setError("");
    onNext(text);
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen px-6 py-16 max-w-2xl mx-auto"
    >
      <h2 className="font-display text-3xl text-cloud mb-2">Bring your CV</h2>
      <p className="text-mist mb-8">
        PDF, Word (.docx), or plain text — we pull the words out automatically. Or paste it yourself.
      </p>

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
          scale: dragging ? 1.02 : 1,
        }}
        whileHover={{ scale: 1.005 }}
        className="border-2 border-dashed rounded-2xl p-8 text-center mb-4 bg-panel relative overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {parsing ? (
            <motion.div
              key="parsing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3"
            >
              <motion.div
                className="text-3xl"
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
              >
                📄
              </motion.div>
              <p className="text-signal text-sm font-medium">Squeezing the words out of your file...</p>
            </motion.div>
          ) : (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div
                className="text-4xl mb-3"
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 2.4 }}
              >
                🗂️
              </motion.div>
              <p className="text-mist mb-3">Drag a .pdf, .docx, or .txt file here</p>
              <label className="inline-block px-4 py-2 rounded-full border border-line text-cloud text-sm cursor-pointer hover:border-signal hover:scale-105 transition-all">
                Browse file
                <input
                  type="file"
                  accept=".pdf,.docx,.doc,.txt"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files[0])}
                />
              </label>
              {fileName && !error && <p className="text-coach text-xs mt-3">✓ {fileName} loaded</p>}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="flex items-center gap-3 my-4">
        <div className="flex-1 h-px bg-line" />
        <span className="text-mist text-xs">or paste a link (Google Docs / Drive / any PDF URL)</span>
        <div className="flex-1 h-px bg-line" />
      </div>

      <div className="flex gap-2 mb-6">
        <input
          value={driveLink}
          onChange={(e) => setDriveLink(e.target.value)}
          placeholder="Google Docs, Drive PDF, or any direct file link"
          className="flex-1 bg-panel border border-line rounded-full px-4 py-2 text-sm text-cloud focus:outline-none focus:border-signal"
        />
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleDriveFetch}
          disabled={fetchingDrive}
          className="px-4 py-2 rounded-full bg-panel2 border border-line text-cloud text-sm disabled:opacity-50"
        >
          {fetchingDrive ? "Fetching..." : "Fetch"}
        </motion.button>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="...or paste your CV text here"
        rows={8}
        className="w-full bg-panel border border-line rounded-xl p-4 text-cloud font-mono text-sm focus:outline-none focus:border-signal transition-colors"
      />

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-roast text-sm mt-2"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleContinue}
        className="mt-6 w-full py-3 rounded-full bg-signal text-ink font-display font-semibold"
      >
        Continue →
      </motion.button>
    </motion.div>
  );
}
