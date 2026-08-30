export const BUZZWORD_REPLACEMENTS = [
  { buzzword: "hardworking", replacement: "consistently delivered ahead of schedule / maintained high velocity" },
  { buzzword: "team player", replacement: "cross-functionally collaborated with design, product, and QA" },
  { buzzword: "passionate", replacement: "authored 5+ production open-source modules / built end-to-end solutions" },
  { buzzword: "detail-oriented", replacement: "achieved 99.9% uptime / reduced bug escape rate by 40%" },
  { buzzword: "self-motivated", replacement: "initiated and executed self-directed migration project" },
  { buzzword: "responsible for", replacement: "Architected / Spearheaded / Engineered / Delivered" },
  { buzzword: "worked on", replacement: "Developed / Deployed / Optimized / Implemented" },
  { buzzword: "helped with", replacement: "Co-authored / Partnered to deliver / Facilitated" },
  { buzzword: "in charge of", replacement: "Directly managed / Orchestrated / Governed" },
  { buzzword: "tasked with", replacement: "Executed / Shipped / Formulated" },
  { buzzword: "dynamic", replacement: "adaptable to high-growth startup velocity" },
  { buzzword: "synergy", replacement: "integrated cross-team workflows" },
];

export const BULLET_TRANSFORMATIONS = [
  {
    role: "Frontend / Full-Stack",
    weak: "Responsible for building the frontend website and fixing styling bugs.",
    improved: "Architected responsive React 18 UI components, reducing page load time by 38% and eliminating 45+ UI regression bugs.",
    category: "Action + Scale + Impact",
  },
  {
    role: "Backend / API",
    weak: "Worked on database queries and helped with API development.",
    improved: "Engineered high-throughput REST APIs and optimized PostgreSQL indexes, cutting p95 query latency from 850ms to 95ms.",
    category: "Technical Specificity",
  },
  {
    role: "UI/UX Design",
    weak: "Created Figma mockups and did user research for our app.",
    improved: "Conducted 25+ usability tests and established a unified Figma design system, increasing user task completion by 32%.",
    category: "User-Centered Metrics",
  },
  {
    role: "Data / Analytics",
    weak: "Made dashboards and ran SQL reports for the marketing team.",
    improved: "Constructed automated SQL pipelines and Tableau executive dashboards, uncovering a $120K growth opportunity.",
    category: "Business Value",
  },
];

export function generateBulletRewrite(text) {
  if (!text || text.length < 5) return null;
  let rewritten = text.trim();
  let changed = false;

  const verbMap = {
    "responsible for building": "Architected and delivered",
    "responsible for creating": "Designed and deployed",
    "responsible for managing": "Spearheaded management of",
    "responsible for": "Engineered and led",
    "worked on": "Developed and optimized",
    "helped with": "Collaborated cross-functionally to execute",
    "involved in": "Spearheaded implementation of",
    "duties included": "Delivered high-impact",
    "in charge of": "Orchestrated end-to-end",
    "tasked with": "Successfully executed",
  };

  const lower = rewritten.toLowerCase();
  for (const [phrase, replacement] of Object.entries(verbMap)) {
    const idx = lower.indexOf(phrase);
    if (idx !== -1) {
      rewritten = rewritten.slice(0, idx) + replacement + rewritten.slice(idx + phrase.length);
      changed = true;
      break;
    }
  }

  if (!changed) {
    rewritten = `Spearheaded: ${rewritten.replace(/^[-•*]\s*/, "")} — increasing efficiency by 25% across key deliverables.`;
  } else if (!/\d+/.test(rewritten)) {
    rewritten += " — achieving 30%+ measurable efficiency gain.";
  }

  return {
    original: text,
    suggestion: rewritten,
  };
}
