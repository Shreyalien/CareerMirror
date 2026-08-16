import { motion } from "framer-motion";
import { PERSONAS } from "../data/personas";

export default function Landing({ onStart }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center grid-glow relative overflow-hidden"
    >
      <motion.div
        className="absolute w-72 h-72 rounded-full bg-signal/20 blur-3xl"
        style={{ top: "10%", left: "8%" }}
        animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
        transition={{ repeat: Infinity, duration: 9, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-72 h-72 rounded-full bg-roast/10 blur-3xl"
        style={{ bottom: "8%", right: "10%" }}
        animate={{ x: [0, -30, 0], y: [0, -20, 0] }}
        transition={{ repeat: Infinity, duration: 11, ease: "easeInOut" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="max-w-2xl relative z-10"
      >
        <motion.div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-line text-mist text-xs font-mono mb-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <span className="w-2 h-2 rounded-full bg-signal animate-pulseGlow" />
          9 AI recruiter personas, 1 honest mirror
        </motion.div>

        <h1 className="font-display text-4xl md:text-6xl font-bold text-cloud leading-tight">
          What does your CV
          <br />
          <motion.span
            className="text-signal inline-block"
            animate={{ rotate: [0, -3, 3, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          >
            really
          </motion.span>{" "}
          say about you?
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-mist mt-6 text-lg"
        >
          Paste your CV. Pick from 9 recruiter bots. Get roasted 🔥 or coached 🎯 — your call.
        </motion.p>

        <motion.button
          whileHover={{ scale: 1.06, boxShadow: "0 0 30px rgba(139,123,255,0.4)" }}
          whileTap={{ scale: 0.96 }}
          onClick={onStart}
          className="mt-10 px-8 py-3 rounded-full bg-signal text-ink font-display font-semibold text-lg shadow-lg shadow-signal/20"
        >
          Upload your CV →
        </motion.button>
      </motion.div>

      <div className="relative z-10 mt-16 w-full max-w-3xl overflow-hidden">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-line to-transparent mb-6" />
        <motion.div
          className="flex gap-8 items-center whitespace-nowrap"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, duration: 26, ease: "linear" }}
        >
          {[...PERSONAS, ...PERSONAS].map((p, i) => (
            <span key={i} className="flex items-center gap-2 text-mist text-sm font-medium shrink-0">
              <span className="text-base opacity-80">{p.icon}</span>
              {p.name}
              <span className="text-line ml-6">·</span>
            </span>
          ))}
        </motion.div>
        <div className="h-px w-full bg-gradient-to-r from-transparent via-line to-transparent mt-6" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="relative z-10 flex flex-col sm:flex-row items-center gap-6 sm:gap-0 mt-14 max-w-3xl w-full justify-center"
      >
        {[
          { icon: "📄", title: "Drop any CV", desc: "PDF, Word, or a document link" },
          { icon: "🎭", title: "Pick a recruiter", desc: "9 personas, 9 sets of standards" },
          { icon: "📊", title: "See the real map", desc: "Gaps, fit, and what to fix next" },
        ].map((f, i, arr) => (
          <div key={f.title} className="flex items-center">
            <motion.div whileHover={{ y: -2 }} className="text-center sm:text-left px-6">
              <div className="text-mist text-xs tracking-wide uppercase mb-1 flex items-center gap-1.5 justify-center sm:justify-start">
                <span>{f.icon}</span> {f.title}
              </div>
              <div className="text-cloud text-sm font-display">{f.desc}</div>
            </motion.div>
            {i < arr.length - 1 && <div className="hidden sm:block w-px h-10 bg-line" />}
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}
