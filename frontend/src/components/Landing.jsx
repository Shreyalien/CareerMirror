import { motion } from "framer-motion";
import { PERSONAS } from "../data/personas";
import {
  PersonaIcon,
  Flame,
  Target,
  FileText,
  Users,
  Compass,
  ArrowRight,
  Github,
  Heart,
} from "./Icons.jsx";

export default function Landing({ onStart }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-[calc(100vh-70px)] flex flex-col items-center justify-center px-6 py-12 text-center grid-glow relative overflow-hidden"
    >
      {/* Floating Animated Ambient Glowing Orbs */}
      <motion.div
        className="absolute w-72 h-72 rounded-full bg-signal/20 blur-3xl pointer-events-none"
        style={{ top: "10%", left: "8%" }}
        animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
        transition={{ repeat: Infinity, duration: 9, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-72 h-72 rounded-full bg-roast/10 blur-3xl pointer-events-none"
        style={{ bottom: "8%", right: "10%" }}
        animate={{ x: [0, -30, 0], y: [0, -20, 0] }}
        transition={{ repeat: Infinity, duration: 11, ease: "easeInOut" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="max-w-2xl relative z-10 mx-auto"
      >
        <motion.div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-line text-mist text-xs font-mono mb-6 bg-panel/70 shadow-sm"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <span className="w-2 h-2 rounded-full bg-signal animate-pulseGlow" />
          <span>9 AI recruiter personas, 1 honest mirror</span>
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
          className="text-mist mt-6 text-base md:text-lg max-w-xl mx-auto leading-relaxed"
        >
          Paste your CV. Pick from 9 recruiter bots. Get roasted{" "}
          <span className="inline-flex items-center gap-1 text-roast font-medium">
            <Flame size={15} /> roast
          </span>{" "}
          or coached{" "}
          <span className="inline-flex items-center gap-1 text-coach font-medium">
            <Target size={15} /> coach
          </span>{" "}
          — your call.
        </motion.p>

        <motion.button
          whileHover={{ scale: 1.06, boxShadow: "0 0 30px rgba(139,123,255,0.4)" }}
          whileTap={{ scale: 0.96 }}
          onClick={onStart}
          className="mt-9 px-8 py-3.5 rounded-full bg-signal text-ink font-display font-semibold text-base shadow-lg shadow-signal/20 inline-flex items-center gap-2 transition-all"
        >
          <span>Upload your CV</span>
          <ArrowRight size={17} />
        </motion.button>
      </motion.div>

      {/* Continuous Infinite Scrolling Marquee Ticker */}
      <div className="relative z-10 mt-14 w-full max-w-3xl overflow-hidden">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-line to-transparent mb-5" />
        <motion.div
          className="flex gap-8 items-center whitespace-nowrap"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, duration: 24, ease: "linear" }}
        >
          {[...PERSONAS, ...PERSONAS].map((p, i) => (
            <span key={i} className="flex items-center gap-2 text-mist text-xs md:text-sm font-medium shrink-0">
              <PersonaIcon personaKey={p.iconKey} size={16} color={p.color} />
              <span className="text-cloud">{p.name}</span>
              <span className="text-line ml-6">·</span>
            </span>
          ))}
        </motion.div>
        <div className="h-px w-full bg-gradient-to-r from-transparent via-line to-transparent mt-5" />
      </div>

      {/* 3 Step Features with Vertical Dividers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="relative z-10 flex flex-col sm:flex-row items-center gap-6 sm:gap-0 mt-12 max-w-3xl w-full justify-center"
      >
        {[
          {
            icon: <FileText size={16} className="text-signal" />,
            title: "Drop any CV",
            desc: "PDF, Word, text, or document link",
          },
          {
            icon: <Users size={16} className="text-coach" />,
            title: "Pick a recruiter",
            desc: "9 personas, 9 hiring standards",
          },
          {
            icon: <Compass size={16} className="text-roast" />,
            title: "See the real map",
            desc: "Gaps, fit, ATS score & 1-click fixes",
          },
        ].map((f, i, arr) => (
          <div key={f.title} className="flex items-center flex-1 justify-center">
            <motion.div whileHover={{ y: -2 }} className="text-center sm:text-left px-6">
              <div className="text-mist text-xs tracking-wide uppercase mb-1 flex items-center gap-1.5 justify-center sm:justify-start font-mono">
                {f.icon}
                <span>{f.title}</span>
              </div>
              <div className="text-cloud text-xs md:text-sm font-display font-medium">{f.desc}</div>
            </motion.div>
            {i < arr.length - 1 && <div className="hidden sm:block w-px h-10 bg-line" />}
          </div>
        ))}
      </motion.div>

      {/* Creator Credit Badge */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="mt-12 pt-5 border-t border-line/40 flex items-center justify-center gap-2 text-xs text-mist font-mono relative z-10"
      >
        <span className="flex items-center gap-1.5">
          <span>Crafted with</span>
          <Heart size={12} className="text-roast fill-roast" />
          <span>by</span>
        </span>
        <a
          href="https://github.com/Shreyalien"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-panel2 border border-line hover:border-signal text-cloud hover:text-signal font-semibold transition-all shadow-sm group"
        >
          <Github size={12} className="text-mist group-hover:text-signal transition-colors" />
          <span>Shreyalien (Shreya)</span>
        </a>
      </motion.div>
    </motion.div>
  );
}
