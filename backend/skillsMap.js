export const SKILL_MAP = {
  "Frontend Developer": ["html", "css", "javascript", "react", "next.js", "tailwind", "responsive", "figma", "git"],
  "Backend Developer": ["node", "express", "python", "java", "sql", "mongodb", "api", "database", "docker"],
  "Full-Stack Developer": ["react", "node", "javascript", "api", "sql", "mongodb", "git", "deploy"],
  "UI/UX Designer": ["figma", "wireframe", "prototype", "usability", "user research", "adobe xd", "sketch"],
  "Data Analyst": ["sql", "python", "excel", "tableau", "power bi", "statistics", "pandas"],
  "Cybersecurity Analyst": ["network", "firewall", "wireshark", "vulnerability", "encryption", "penetration"],
  "Mobile App Developer": ["flutter", "react native", "kotlin", "swift", "firebase", "android", "ios"],
};

export function rankFields(cvText) {
  const lower = (cvText || "").toLowerCase();
  const scored = Object.entries(SKILL_MAP).map(([field, keywords]) => {
    const hits = keywords.filter((k) => lower.includes(k)).length;
    const score = Math.round((hits / keywords.length) * 100);
    return { field, score };
  });
  return scored.sort((a, b) => b.score - a.score);
}
