import { wordMatch } from "./textMatch.js";

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
  "Graphic Designer": {
    "Design Tools": ["photoshop", "illustrator", "canva", "figma"],
    "Visual Design": ["typography", "layout", "branding", "color theory"],
    Creativity: ["creative", "portfolio", "concept", "design"],
    "Print/Digital": ["print", "digital", "banner", "social media graphics"],
    "Client Work": ["client", "brief", "revision", "deadline"],
  },
  "Digital Marketing Executive": {
    "Social Media Marketing": ["facebook ads", "instagram", "campaign", "social media"],
    "SEO/SEM": ["seo", "sem", "google ads", "keyword"],
    Analytics: ["analytics", "google analytics", "insight", "metric"],
    "Content Creation": ["content", "creative", "canva", "graphic"],
    Communication: ["communication", "client", "coordination", "presentation"],
  },
  "Content Writer": {
    "Writing Skills": ["writing", "content", "article", "blog", "copywriting"],
    "SEO Basics": ["seo", "keyword", "ranking", "search engine"],
    Research: ["research", "fact-check", "editing", "proofreading"],
    Tools: ["word", "google docs", "grammarly", "wordpress"],
    "Social Media": ["social media", "caption", "post", "content calendar"],
  },
  "Customer Support / Customer Service": {
    "Customer Communication": ["customer service", "support", "inbox", "customer query", "complaint", "client communication"],
    "Support Channels & Tools": ["helpdesk", "crm", "live chat", "email support", "zendesk", "intercom", "freshdesk", "social media"],
    "Issue Resolution & Handling": ["troubleshooting", "resolution", "ticket", "follow-up", "inquiry", "escalation"],
    "Digital Literacy": ["ms word", "excel", "typing", "google sheets", "fast typing", "crm software"],
    "Service Reliability & Empathy": ["teamwork", "punctual", "empathy", "dedicated", "reliable", "customer satisfaction", "csat"],
  },
  "Virtual Assistant / Data Entry": {
    "Data Entry": ["data entry", "excel", "spreadsheet", "typing"],
    Communication: ["email support", "communication", "coordination", "correspondence"],
    Scheduling: ["calendar", "scheduling", "appointment", "booking"],
    "Office Tools": ["ms office", "google sheets", "crm", "ms word"],
    "Attention to Detail": ["accuracy", "detail-oriented", "proofreading", "quality check"],
  },
  "Sales & Business Development": {
    "Sales Skills": ["sales", "negotiation", "deal", "target", "quota"],
    Communication: ["communication", "persuasion", "client", "presentation"],
    "CRM Tools": ["crm", "salesforce", "pipeline", "hubspot"],
    "Market Research": ["market research", "lead generation", "prospecting"],
    "Relationship Building": ["relationship", "networking", "follow-up", "retention"],
  },
  "HR / Admin Executive": {
    Recruitment: ["recruitment", "hiring", "interview", "sourcing"],
    Administration: ["admin", "office", "documentation", "filing"],
    Communication: ["communication", "coordination", "employee relations"],
    "MS Office": ["excel", "ms word", "powerpoint", "office"],
    Compliance: ["policy", "compliance", "hr policy", "procedure"],
  },
  "Teacher / Tutor": {
    "Subject Knowledge": ["subject", "curriculum", "syllabus", "academic"],
    "Teaching & Communication": ["teaching", "communication", "explain", "mentor"],
    "Lesson Planning": ["lesson plan", "planning", "preparation", "material"],
    "Student Engagement": ["student", "engagement", "motivate", "classroom"],
    Assessment: ["assessment", "evaluation", "exam", "grading"],
  },
};

// Fallback for a typed-in custom role that isn't in SKILL_MAP — measures transferable
// signals instead of guessing at tech skills for a non-tech or custom CV.
export const GENERIC_SKILLS = {
  Communication: ["communication", "coordination", "presentation", "email", "client"],
  "Digital Tool Familiarity": ["excel", "ms word", "google sheets", "software", "computer skills", "app"],
  "Reliability & Initiative": ["led", "managed", "organized", "initiative", "took ownership"],
  "Relevant Experience": ["experience", "internship", "worked", "assisted", "handled"],
  "Measurable Impact": ["%", "increased", "reduced", "achieved", "improved"],
};

export function computeSkillGap(cvText, jobTarget) {
  const map = SKILL_MAP[jobTarget] || GENERIC_SKILLS;
  const lower = (cvText || "").toLowerCase();
  return Object.entries(map).map(([skill, keywords]) => {
    const hits = keywords.filter((k) => wordMatch(lower, k)).length;
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
