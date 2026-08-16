const ACTION_VERBS = [
  "built", "led", "designed", "developed", "created", "launched", "shipped",
  "optimized", "automated", "reduced", "increased", "improved", "implemented",
  "architected", "migrated", "deployed", "mentored", "solved",
];

const WEAK_PHRASES = [
  "responsible for", "worked on", "helped with", "involved in",
  "duties included", "in charge of", "tasked with",
];

const BUZZWORDS = [
  "hardworking", "team player", "passionate", "detail-oriented",
  "self-motivated", "go-getter", "hard-working", "dynamic", "synergy",
  "fast learner", "results-driven",
];

function countMatches(text, list) {
  const lower = text.toLowerCase();
  return list.filter((w) => lower.includes(w)).length;
}

export function parseCvSignals(cvText) {
  const text = cvText || "";
  const words = text.trim().split(/\s+/).filter(Boolean);
  const quantified = (text.match(/\d+(\.\d+)?\s?(%|percent|x|users|hours|days|projects|k\b)/gi) || []).length;
  const actionVerbCount = countMatches(text, ACTION_VERBS);
  const weakPhraseCount = countMatches(text, WEAK_PHRASES);
  const buzzwordCount = countMatches(text, BUZZWORDS);
  const bulletCount = (text.match(/\n\s*[-•*]/g) || []).length;

  return {
    wordCount: words.length,
    quantified,
    actionVerbCount,
    weakPhraseCount,
    buzzwordCount,
    bulletCount,
  };
}

export function computeHealthMetrics(cvText) {
  const s = parseCvSignals(cvText);
  return [
    {
      key: "impact",
      label: "Quantified Impact",
      score: Math.min(100, s.quantified * 25),
      hint: s.quantified >= 3 ? "Strong — numbers back up your claims" : "Weak — add %, counts, or time saved",
    },
    {
      key: "verbs",
      label: "Action Verb Strength",
      score: Math.min(100, s.actionVerbCount * 15),
      hint: s.actionVerbCount >= 5 ? "Great — bullets start with real verbs" : "Swap passive phrasing for verbs like 'built', 'led'",
    },
    {
      key: "clarity",
      label: "Buzzword Density",
      score: Math.max(0, 100 - s.buzzwordCount * 25),
      hint: s.buzzwordCount === 0 ? "Clean — no generic filler detected" : "Cut vague adjectives, they say nothing specific",
    },
    {
      key: "structure",
      label: "Structure & Scannability",
      score: Math.min(100, s.bulletCount * 12 + (s.wordCount > 80 ? 20 : 0)),
      hint: s.bulletCount >= 4 ? "Readable — bullet points are working for you" : "Add bullet points, recruiters scan in seconds",
    },
  ];
}

export const SKILL_ROADMAP = {
  "HTML/CSS": "Rebuild 2-3 layouts from scratch using Flexbox and Grid — no tutorials, just a design and your own CSS.",
  JavaScript: "Do 20 small DOM-manipulation exercises, then build one project without any framework.",
  React: "Build a CRUD app with React + a real API — todo lists don't count anymore.",
  "Responsive Design": "Take one project and make it fully usable on a 375px screen before touching anything else.",
  Git: "Practice branching and resolving a merge conflict on purpose — then document it in your README.",
  Testing: "Add Jest tests to one existing project; aim for testing 3 core functions, not 100% coverage.",
  "Server Languages": "Build a small REST API from scratch with at least 4 endpoints and proper error handling.",
  Databases: "Design a schema for a real idea, then write 5 non-trivial queries against it.",
  APIs: "Consume a public API and build a small tool around it — handle errors and loading states.",
  Auth: "Implement JWT-based login/signup in a toy project — this is a very commonly asked skill.",
  "Cloud/Deploy": "Deploy one project fully (frontend + backend) using a free tier — Render, Railway, or Vercel.",
  "Design Tools": "Recreate one polished landing page pixel-for-pixel in Figma to build muscle memory.",
  "User Research": "Run 3 quick usability tests on a project you've already built and document findings.",
  Prototyping: "Turn one wireframe into a clickable Figma prototype with real interactions.",
  Networking: "Get comfortable with subnetting and TCP/IP basics — this comes up constantly in interviews.",
  "Security Tools": "Install Wireshark and Nmap, run them on your own home network, document what you find.",
  "Threat Analysis": "Work through a few rooms on TryHackMe or HackTheBox and write short reports.",
  SQL: "Practice window functions and joins on a real dataset — Kaggle has plenty for free.",
  Python: "Automate one real annoying task in your life with a Python script.",
  Visualization: "Take one dataset and tell three different stories with three different chart types.",
};
