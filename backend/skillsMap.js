import { wordMatch } from "./textMatch.js";

export const SKILL_MAP = {
  "Frontend Developer": ["html", "css", "javascript", "react", "next.js", "tailwind", "responsive", "figma", "git"],
  "Backend Developer": ["node", "express", "python", "java", "sql", "mongodb", "api", "database", "docker"],
  "Full-Stack Developer": ["react", "node", "javascript", "api", "sql", "mongodb", "git", "deploy"],
  "UI/UX Designer": ["figma", "wireframe", "prototype", "usability", "user research", "adobe xd", "sketch"],
  "Data Analyst": ["sql", "python", "excel", "tableau", "power bi", "statistics", "pandas"],
  "Cybersecurity Analyst": ["network", "firewall", "wireshark", "vulnerability", "encryption", "penetration"],
  "Mobile App Developer": ["flutter", "react native", "kotlin", "swift", "firebase", "android", "ios"],
  "Graphic Designer": ["photoshop", "illustrator", "canva", "figma", "design", "branding", "portfolio"],
  "Digital Marketing Executive": ["social media", "campaign", "seo", "analytics", "content", "ads", "marketing"],
  "Content Writer": ["writing", "content", "article", "blog", "seo", "editing", "copywriting"],
  "Customer Support / Customer Service": ["customer service", "support", "inbox", "zendesk", "intercom", "ticket", "communication", "troubleshooting"],
  "Virtual Assistant / Data Entry": ["data entry", "excel", "spreadsheet", "email support", "scheduling", "crm", "typing"],
  "Sales & Business Development": ["sales", "negotiation", "client", "crm", "lead generation", "target", "deal"],
  "HR / Admin Executive": ["recruitment", "hiring", "admin", "documentation", "employee", "office", "hr policy"],
  "Teacher / Tutor": ["teaching", "curriculum", "lesson plan", "student", "classroom", "mentor", "tutoring"],
};

export const GENERIC_SKILLS = ["communication", "management", "excel", "coordination", "initiative", "problem solving", "experience"];

export function rankFields(cvText) {
  const lower = (cvText || "").toLowerCase();
  const scored = Object.entries(SKILL_MAP).map(([field, keywords]) => {
    const hits = keywords.filter((k) => wordMatch(lower, k)).length;
    const score = Math.round((hits / keywords.length) * 100);
    return { field, score };
  });
  return scored.sort((a, b) => b.score - a.score);
}
