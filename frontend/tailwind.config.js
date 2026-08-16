/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0B0D14",
        panel: "#141826",
        panel2: "#1B2032",
        line: "#2A2F42",
        mist: "#8B93A8",
        cloud: "#D8DCEA",
        coach: {
          DEFAULT: "#4FD1C5",
          soft: "#1E3A38",
        },
        roast: {
          DEFAULT: "#FF6B5E",
          soft: "#3A2020",
        },
        signal: "#8B7BFF",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { opacity: 0.6 },
          "50%": { opacity: 1 },
        },
        floatY: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      animation: {
        pulseGlow: "pulseGlow 2.4s ease-in-out infinite",
        floatY: "floatY 5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
