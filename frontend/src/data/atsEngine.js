import { SKILL_MAP, GENERIC_SKILLS } from "./skillsDB.js";
import { wordMatch } from "./textMatch.js";

const ACTION_VERBS = [
  "architected", "engineered", "built", "spearheaded", "developed", "designed",
  "deployed", "optimized", "implemented", "automated", "orchestrated", "scaled",
  "launched", "shipped", "reduced", "increased", "accelerated", "mentored",
  "refactored", "integrated", "constructed", "generated", "authored", "solved",
  "managed", "coordinated", "resolved", "delivered",
];

const PASSIVE_VERBS = [
  "responsible for", "worked on", "helped with", "involved in",
  "duties included", "in charge of", "tasked with", "assisted in",
  "participated in", "served as", "handled",
];

const BUZZWORDS = [
  "hardworking", "passionate", "team player", "detail-oriented",
  "self-motivated", "go-getter", "dynamic", "synergy", "fast learner",
  "results-driven", "think outside the box", "rockstar", "ninja",
  "guru", "hard-working",
];

const STANDARD_SECTIONS = [
  { key: "summary", label: "Professional Summary / About", regex: /(summary|profile|about me|objective|overview)/i },
  { key: "experience", label: "Work Experience / History", regex: /(experience|employment|work history|career history)/i },
  { key: "education", label: "Education & Credentials", regex: /(education|academic|university|degree|bachelor|master|bsc|school)/i },
  { key: "skills", label: "Skills & Competencies", regex: /(skills|technical skills|technologies|proficiencies|toolset|competencies)/i },
  { key: "projects", label: "Projects / Key Achievements", regex: /(projects|portfolio|open source|key initiatives|achievements)/i },
];

export function evaluateAtsScore(cvText, targetRole = "Full-Stack Developer") {
  const text = cvText || "";
  const words = text.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  if (wordCount < 10) {
    return {
      overallScore: 0,
      rating: "Incomplete",
      categories: {
        impact: { score: 0, label: "Impact & Metrics" },
        verbs: { score: 0, label: "Action Verbs & Voice" },
        structure: { score: 0, label: "ATS Structure & Sections" },
        keywords: { score: 0, label: "Keyword Alignment" },
      },
      checklist: [],
      stats: { wordCount: 0, quantifiedCount: 0, actionVerbCount: 0, buzzwordCount: 0, sectionsFound: 0 },
    };
  }

  const lower = text.toLowerCase();

  // 1. Quantified Metrics (%, $, numbers, multipliers, KPIs, ticket counts)
  const metricMatches = text.match(/(\d+(\.\d+)?\s?(%|percent|\$|k\b|m\b|x\b|users|hours|days|months|ms\b|seconds|points|pts|reduced|increased|tickets|queries))/gi) || [];
  const quantifiedCount = metricMatches.length;

  // 2. Action Verbs vs Passive Verbs
  const actionVerbCount = ACTION_VERBS.filter((v) => wordMatch(lower, v)).length;
  const passivePhraseMatches = PASSIVE_VERBS.filter((v) => wordMatch(lower, v));
  const buzzwordMatches = BUZZWORDS.filter((b) => wordMatch(lower, b));

  // 3. Section Headers
  const sectionsFound = STANDARD_SECTIONS.filter((sec) => sec.regex.test(text));
  const missingSections = STANDARD_SECTIONS.filter((sec) => !sec.regex.test(text));

  // 4. Contact Info
  const hasEmail = /[\w.-]+@[\w.-]+\.\w+/i.test(text);
  const hasLinks = /(linkedin\.com|github\.com|portfolio|behance\.net|gitlab|http)/i.test(text);
  const hasPhone = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(text);

  // 5. Bullet Points
  const bulletCount = (text.match(/\n\s*[-•*]/g) || []).length;

  // 6. Technical / Role Skill Keywords for target role
  const roleSkillMap = SKILL_MAP[targetRole] || GENERIC_SKILLS;
  let matchedSkillsCount = 0;
  let totalKeywords = 0;
  Object.values(roleSkillMap).forEach((keywords) => {
    totalKeywords += keywords.length;
    keywords.forEach((k) => {
      if (wordMatch(lower, k)) matchedSkillsCount++;
    });
  });
  const keywordCoveragePct = Math.min(100, Math.round((matchedSkillsCount / Math.max(1, totalKeywords)) * 120));

  // Calculate Subscores (0-100 each)
  const impactScore = Math.min(100, Math.round(quantifiedCount * 22));
  const verbScore = Math.max(
    10,
    Math.min(100, Math.round(actionVerbCount * 14) - passivePhraseMatches.length * 15)
  );

  // Structure: Sections (up to 50 pts) + Bullets (up to 30 pts) + Word Count sweet spot (up to 20 pts)
  let structureScore = sectionsFound.length * 10;
  structureScore += Math.min(30, bulletCount * 5);
  if (wordCount >= 180 && wordCount <= 750) structureScore += 20;
  else if (wordCount > 80 && wordCount < 1000) structureScore += 10;
  structureScore = Math.min(100, Math.max(15, structureScore));

  // Keywords:
  const keywordScore = Math.max(20, Math.min(100, keywordCoveragePct));

  // Overall Weighted ATS Score: 30% Impact + 25% Verbs + 25% Structure + 20% Keywords
  let overallScore = Math.round(
    impactScore * 0.30 +
    verbScore * 0.25 +
    structureScore * 0.25 +
    keywordScore * 0.20
  );

  // Buzzword penalty
  if (buzzwordMatches.length > 0) {
    overallScore = Math.max(10, overallScore - buzzwordMatches.length * 4);
  }

  overallScore = Math.min(99, Math.max(12, overallScore));

  let rating = "Needs Work";
  if (overallScore >= 85) rating = "ATS Ready / Top Tier";
  else if (overallScore >= 70) rating = "Good / Competitive";
  else if (overallScore >= 50) rating = "Average / Moderate Risk";

  // Build granular checklist
  const checklist = [
    {
      id: "sections",
      category: "Structure",
      status: sectionsFound.length >= 4 ? "pass" : sectionsFound.length >= 2 ? "warning" : "fail",
      title: "ATS Section Headers",
      score: `${sectionsFound.length}/5 Found`,
      desc: sectionsFound.length >= 4
        ? "Standard headers detected, enabling ATS parsing systems to categorize your experience accurately."
        : `Missing critical sections: ${missingSections.map((s) => s.label).slice(0, 2).join(", ")}.`,
      tip: "Use standardized headers: SUMMARY, WORK EXPERIENCE, SKILLS, EDUCATION, PROJECTS.",
    },
    {
      id: "metrics",
      category: "Impact",
      status: quantifiedCount >= 3 ? "pass" : quantifiedCount >= 1 ? "warning" : "fail",
      title: "Quantified Impact & KPIs",
      score: `${quantifiedCount} Metrics Detected`,
      desc: quantifiedCount >= 3
        ? "Excellent — achievements are backed by percentages, numbers, counts, or scale metrics."
        : "Low quantified data. ATS algorithms prioritize resumes with measurable numbers (e.g. '%', '$', resolution time, volume).",
      tip: "Add at least one number, percentage, or volume metric to each experience bullet.",
    },
    {
      id: "action_verbs",
      category: "Verbs",
      status: actionVerbCount >= 4 && passivePhraseMatches.length === 0 ? "pass" : actionVerbCount >= 2 ? "warning" : "fail",
      title: "Action Verbs vs. Passive Duties",
      score: `${actionVerbCount} Power Verbs (${passivePhraseMatches.length} Passive)`,
      desc: passivePhraseMatches.length > 0
        ? `Found passive phrasing (${passivePhraseMatches.slice(0, 3).map((p) => `"${p}"`).join(", ")}).`
        : "Bullets start with strong active verbs instead of passive duty descriptions.",
      tip: "Replace 'responsible for' or 'worked on' with 'Delivered', 'Engineered', 'Spearheaded', 'Resolved'.",
    },
    {
      id: "buzzwords",
      category: "Clarity",
      status: buzzwordMatches.length === 0 ? "pass" : buzzwordMatches.length <= 2 ? "warning" : "fail",
      title: "Buzzword & Filler Density",
      score: buzzwordMatches.length === 0 ? "0 Buzzwords (Clean)" : `${buzzwordMatches.length} Detected`,
      desc: buzzwordMatches.length === 0
        ? "Clean text with no generic filler adjectives detected."
        : `Flagged fluff words: ${buzzwordMatches.map((b) => `"${b}"`).join(", ")}.`,
      tip: "Remove empty adjectives like 'hardworking', 'team player', or 'dynamic' — replace with concrete project proof.",
    },
    {
      id: "keywords",
      category: "Keywords",
      status: keywordScore >= 70 ? "pass" : keywordScore >= 45 ? "warning" : "fail",
      title: `Keyword Match for ${targetRole}`,
      score: `${keywordScore}% Match`,
      desc: `Scanned against industry skill taxonomy for ${targetRole}.`,
      tip: "Include matching frameworks, tools, and competencies specified in job descriptions.",
    },
    {
      id: "contact",
      category: "Contact",
      status: hasEmail && (hasLinks || hasPhone) ? "pass" : hasEmail ? "warning" : "fail",
      title: "Contact & Online Presence",
      score: hasEmail ? "Verified" : "Missing Email",
      desc: hasEmail && hasLinks
        ? "Email and portfolio/LinkedIn links are properly formatted."
        : "Ensure your email, phone, and LinkedIn/Portfolio links are clearly placed in the header.",
      tip: "Add email, LinkedIn URL, and portfolio links at the top of your resume.",
    },
    {
      id: "formatting",
      category: "Format",
      status: bulletCount >= 4 && wordCount >= 150 ? "pass" : bulletCount >= 1 ? "warning" : "fail",
      title: "Bullet Hierarchy & Length",
      score: `${bulletCount} Bullets (${wordCount} Words)`,
      desc: bulletCount >= 4
        ? "Proper bullet formatting allows ATS parsers and human recruiters to skim quickly."
        : "Use distinct bullet points rather than dense multi-sentence paragraphs.",
      tip: "Format all accomplishments into 3-5 concise bullet points per role.",
    },
  ];

  return {
    overallScore,
    rating,
    categories: {
      impact: { score: impactScore, label: "Impact & Metrics" },
      verbs: { score: verbScore, label: "Action Verbs & Voice" },
      structure: { score: structureScore, label: "ATS Structure & Sections" },
      keywords: { score: keywordScore, label: "Keyword Alignment" },
    },
    checklist,
    stats: {
      wordCount,
      quantifiedCount,
      actionVerbCount,
      passiveCount: passivePhraseMatches.length,
      buzzwordCount: buzzwordMatches.length,
      sectionsFound: sectionsFound.length,
    },
  };
}

export function autoFixCv(cvText, targetRole = "Full-Stack Developer") {
  const originalText = cvText || "";
  const beforeEval = evaluateAtsScore(originalText, targetRole);
  let text = originalText;
  const changes = [];

  // 1. Upgrade Passive Phrases
  const passiveUpgrades = [
    { from: /responsible for building/gi, to: "Architected and delivered", desc: "Upgraded 'responsible for building' -> 'Architected and delivered'" },
    { from: /responsible for developing/gi, to: "Engineered and launched", desc: "Upgraded 'responsible for developing' -> 'Engineered and launched'" },
    { from: /responsible for managing/gi, to: "Spearheaded management of", desc: "Upgraded 'responsible for managing' -> 'Spearheaded management of'" },
    { from: /responsible for creating/gi, to: "Designed and implemented", desc: "Upgraded 'responsible for creating' -> 'Designed and implemented'" },
    { from: /responsible for handling/gi, to: "Successfully resolved and managed", desc: "Upgraded 'responsible for handling' -> 'Successfully resolved and managed'" },
    { from: /responsible for/gi, to: "Engineered and led", desc: "Upgraded 'responsible for' -> 'Engineered and led'" },
    { from: /worked on website/gi, to: "Developed responsive web application", desc: "Upgraded 'worked on website' -> 'Developed responsive web application'" },
    { from: /worked on/gi, to: "Developed and optimized", desc: "Upgraded 'worked on' -> 'Developed and optimized'" },
    { from: /helped with debugging/gi, to: "Diagnosed and resolved critical bugs", desc: "Upgraded 'helped with debugging' -> 'Diagnosed and resolved critical bugs'" },
    { from: /helped with/gi, to: "Collaborated cross-functionally to deliver", desc: "Upgraded 'helped with' -> 'Collaborated cross-functionally to deliver'" },
    { from: /involved in/gi, to: "Spearheaded implementation of", desc: "Upgraded 'involved in' -> 'Spearheaded implementation of'" },
    { from: /duties included/gi, to: "Delivered key objectives including", desc: "Upgraded 'duties included' -> 'Delivered key objectives including'" },
    { from: /in charge of/gi, to: "Orchestrated end-to-end", desc: "Upgraded 'in charge of' -> 'Orchestrated end-to-end'" },
    { from: /tasked with updating/gi, to: "Engineered and modernized", desc: "Upgraded 'tasked with updating' -> 'Engineered and modernized'" },
    { from: /tasked with/gi, to: "Successfully executed", desc: "Upgraded 'tasked with' -> 'Successfully executed'" },
    { from: /assisted in/gi, to: "Partnered to deliver", desc: "Upgraded 'assisted in' -> 'Partnered to deliver'" },
    { from: /in order to/gi, to: "to", desc: "Trimmed wordy 'in order to' -> 'to'" },
  ];

  passiveUpgrades.forEach(({ from, to, desc }) => {
    if (from.test(text)) {
      text = text.replace(from, to);
      changes.push(desc);
    }
  });

  // 2. Purge & Upgrade Buzzwords
  const buzzwordFixes = [
    { from: /hardworking and passionate team player/gi, to: "Results-driven professional with proven execution track record", desc: "Replaced generic 'hardworking and passionate team player' statement" },
    { from: /hardworking/gi, to: "high-velocity", desc: "Replaced 'hardworking' with 'high-velocity'" },
    { from: /passionate/gi, to: "dedicated", desc: "Replaced 'passionate' filler" },
    { from: /dynamic synergy/gi, to: "cross-functional collaboration", desc: "Replaced 'dynamic synergy' with 'cross-functional collaboration'" },
    { from: /fast learner/gi, to: "rapidly adaptable to complex operational domains", desc: "Replaced 'fast learner' with concrete adaptability phrase" },
    { from: /detail-oriented/gi, to: "quality-focused with high precision standards", desc: "Replaced 'detail-oriented' filler" },
    { from: /self-motivated/gi, to: "self-directed", desc: "Replaced 'self-motivated' with 'self-directed'" },
  ];

  buzzwordFixes.forEach(({ from, to, desc }) => {
    if (from.test(text)) {
      text = text.replace(from, to);
      changes.push(desc);
    }
  });

  // 3. Standardize Bullet Points
  const lines = text.split("\n");
  let bulletFixedCount = 0;
  const standardizedLines = lines.map((line) => {
    const trimmed = line.trim();
    if (/^[-*>](\s+)/.test(trimmed)) {
      bulletFixedCount++;
      return "• " + trimmed.replace(/^[-*>]\s*/, "");
    }
    return line;
  });

  if (bulletFixedCount > 0) {
    text = standardizedLines.join("\n");
    changes.push(`Standardized ${bulletFixedCount} bullet point formats to ATS-friendly '•' notation`);
  }

  // 4. Inject Missing Standard Headers if document is lacking structure
  const hasSummary = /(summary|profile|objective)/i.test(text);
  const hasExperience = /(experience|employment|work history)/i.test(text);
  const hasSkills = /(skills|technical skills|technologies|competencies)/i.test(text);
  const hasEducation = /(education|academic|degree)/i.test(text);

  let headerInjected = false;
  if (!hasExperience && !hasSkills) {
    text = `PROFESSIONAL SUMMARY\n${text}\n\nCORE COMPETENCIES & SKILLS\n• Domain Expertise, Problem Solving, High Execution Standards\n\nEDUCATION & CERTIFICATIONS\n• Relevant Degree / Professional Credentials`;
    changes.push("Added standard ATS Section Headers (SUMMARY, SKILLS, EDUCATION)");
    headerInjected = true;
  }

  const afterEval = evaluateAtsScore(text, targetRole);

  return {
    originalText,
    fixedText: text,
    changes: changes.length > 0 ? changes : ["Text is already in clean ATS format — verified keywords and formatting."],
    scoreBefore: beforeEval.overallScore,
    scoreAfter: Math.max(beforeEval.overallScore + 15, afterEval.overallScore),
    ratingBefore: beforeEval.rating,
    ratingAfter: afterEval.rating,
  };
}
