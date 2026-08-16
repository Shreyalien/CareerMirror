export const SKILL_MAP = {
  "Frontend Developer": {
    "HTML/CSS": ["html", "css", "sass", "tailwind"],
    JavaScript: ["javascript", "js", "typescript", "es6"],
    React: ["react", "next.js", "nextjs", "vue", "angular"],
    "Responsive Design": ["responsive", "mobile-first", "figma", "ui"],
    Git: ["git", "github", "gitlab", "version control"],
    Testing: ["jest", "testing", "cypress", "vitest"],
  },
  "Backend Developer": {
    "Server Languages": ["node", "python", "java", "php", "go", "express"],
    Databases: ["sql", "mongodb", "postgres", "mysql", "database"],
    APIs: ["api", "rest", "graphql", "endpoint"],
    Auth: ["authentication", "jwt", "oauth", "security"],
    "Cloud/Deploy": ["aws", "docker", "azure", "deployment", "cloud"],
    Testing: ["testing", "unit test", "postman"],
  },
  "Full-Stack Developer": {
    Frontend: ["react", "html", "css", "javascript", "ui"],
    Backend: ["node", "express", "python", "api", "server"],
    Databases: ["sql", "mongodb", "database", "postgres"],
    Git: ["git", "github", "version control"],
    Deployment: ["deploy", "vercel", "netlify", "docker", "cloud"],
    Projects: ["project", "built", "developed"],
  },
  "UI/UX Designer": {
    "Design Tools": ["figma", "adobe xd", "sketch", "canva"],
    "User Research": ["research", "usability", "user testing", "persona"],
    Prototyping: ["prototype", "wireframe", "mockup"],
    "Visual Design": ["typography", "color theory", "layout"],
    "Design Systems": ["design system", "component library"],
    Handoff: ["developer handoff", "css", "html"],
  },
  "Data Analyst": {
    SQL: ["sql", "query", "database"],
    Python: ["python", "pandas", "numpy"],
    Visualization: ["tableau", "power bi", "chart", "visualization"],
    Statistics: ["statistics", "regression", "analysis"],
    "Excel/Sheets": ["excel", "spreadsheet", "google sheets"],
    Communication: ["report", "presentation", "insight"],
  },
  "Cybersecurity Analyst": {
    Networking: ["network", "tcp/ip", "firewall"],
    "Security Tools": ["wireshark", "nmap", "burp suite", "metasploit"],
    "Threat Analysis": ["vulnerability", "threat", "penetration"],
    Cryptography: ["encryption", "cryptography", "hashing"],
    Compliance: ["compliance", "iso", "gdpr", "policy"],
    "Incident Response": ["incident", "response", "forensics"],
  },
  "Mobile App Developer": {
    "Native/Cross-platform": ["flutter", "react native", "kotlin", "swift"],
    UI: ["ui", "material design", "figma"],
    APIs: ["api", "rest", "firebase"],
    "State Management": ["state management", "redux", "provider"],
    "App Store": ["play store", "app store", "deployment"],
    Testing: ["testing", "debugging"],
  },
};

export function computeSkillGap(cvText, jobTarget) {
  const map = SKILL_MAP[jobTarget] || SKILL_MAP["Full-Stack Developer"];
  const lower = (cvText || "").toLowerCase();
  return Object.entries(map).map(([skill, keywords]) => {
    const hits = keywords.filter((k) => lower.includes(k)).length;
    const score = Math.min(100, Math.round((hits / keywords.length) * 100) + (hits > 0 ? 20 : 0));
    return { skill, score: Math.max(score, hits > 0 ? 40 : 10) };
  });
}

export function rankCareerFit(cvText) {
  return Object.keys(SKILL_MAP)
    .map((field) => {
      const gap = computeSkillGap(cvText, field);
      const avg = Math.round(gap.reduce((a, b) => a + b.score, 0) / gap.length);
      return { field, score: avg };
    })
    .sort((a, b) => b.score - a.score);
}
