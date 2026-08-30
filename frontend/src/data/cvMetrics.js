import { wordMatch } from "./textMatch.js";

const ACTION_VERBS = [
  "built", "led", "designed", "developed", "created", "launched", "shipped",
  "optimized", "automated", "reduced", "increased", "improved", "implemented",
  "architected", "migrated", "deployed", "mentored", "solved", "managed", "spearheaded",
];

const WEAK_PHRASES = [
  "responsible for", "worked on", "helped with", "involved in",
  "duties included", "in charge of", "tasked with", "assisted with",
  "participated in",
];

const BUZZWORDS = [
  "hardworking", "team player", "passionate", "detail-oriented",
  "self-motivated", "go-getter", "hard-working", "dynamic", "synergy",
  "fast learner", "results-driven", "think outside the box",
];

function countMatches(text, list) {
  const lower = text.toLowerCase();
  return list.filter((w) => wordMatch(lower, w)).length;
}

export function parseCvSignals(cvText) {
  const text = cvText || "";
  const words = text.trim().split(/\s+/).filter(Boolean);
  const quantified = (text.match(/\d+(\.\d+)?\s?(%|percent|x|users|hours|days|projects|k\b|\$|tickets|queries)/gi) || []).length;
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
      hint: s.quantified >= 3 ? "Strong — numbers and metrics back up your claims" : "Weak — add %, counts, resolution time, or output volume",
    },
    {
      key: "verbs",
      label: "Action Verb Strength",
      score: Math.min(100, s.actionVerbCount * 15),
      hint: s.actionVerbCount >= 5 ? "Great — bullets start with real action verbs" : "Swap passive duties for verbs like 'built', 'led', 'spearheaded'",
    },
    {
      key: "clarity",
      label: "Buzzword Density",
      score: Math.max(0, 100 - s.buzzwordCount * 25),
      hint: s.buzzwordCount === 0 ? "Clean — zero generic filler adjectives detected" : "Cut vague adjectives; provide factual outcomes instead",
    },
    {
      key: "structure",
      label: "Structure & Scannability",
      score: Math.min(100, s.bulletCount * 12 + (s.wordCount > 80 ? 20 : 0)),
      hint: s.bulletCount >= 4 ? "Readable — bullet points allow recruiters to scan fast" : "Use distinct bullet points rather than dense paragraphs",
    },
  ];
}

export const SKILL_ROADMAP = {
  "HTML/CSS": "Rebuild 2-3 layouts from scratch using Flexbox, Grid, and responsive queries — no tutorials, just code.",
  JavaScript: "Do 20 small DOM-manipulation exercises, then build one project without any framework.",
  React: "Build a CRUD app with React + a real API — todo lists don't count anymore.",
  "Responsive Design": "Take one project and make it fully usable on a 375px screen before touching anything else.",
  Git: "Practice branching and resolving a merge conflict on purpose — then document it in your README.",
  Testing: "Add Jest / Vitest tests to one existing project; aim for testing 3 core business functions.",
  "Server Languages": "Build a small REST API from scratch with at least 4 endpoints and proper error handling.",
  Databases: "Design a relational schema for a real product idea, then write 5 non-trivial queries with indexes.",
  APIs: "Consume a public API and build a tool around it — handle loading, empty, and error states gracefully.",
  Auth: "Implement JWT or OAuth2 login/signup in a toy project — this is standard interview material.",
  "Cloud/Deploy": "Deploy one project fully (frontend + backend) using a modern cloud provider (Vercel, Render, AWS).",
  "Design Tools": "Recreate one polished landing page or mobile interface pixel-for-pixel in Figma to build muscle memory.",
  "User Research": "Run 3 quick usability tests on a project you've already built and document user pain points.",
  Prototyping: "Turn one static wireframe into a clickable Figma prototype with realistic micro-interactions.",
  "Visual Design": "Study 5 brand style guides and rebuild one cohesive typography and color token system from scratch.",
  "Design Systems": "Construct a reusable component library with documented variants, states, and accessibility standards.",
  Handoff: "Annotate design tokens, spacings, and responsive breakpoints for seamless developer handoff.",
  SQL: "Practice window functions, CTEs, and multi-table joins on a real Kaggle or public dataset.",
  Python: "Automate one repetitive real-world task with a Python script and schedule it via cron.",
  Visualization: "Take one raw dataset and build an interactive dashboard telling a clear commercial story.",
  Statistics: "Run A/B test hypothesis testing and cohort retention analysis on real sample data.",
  "Excel/Sheets": "Master pivot tables, VLOOKUP/XLOOKUP, and nested IF/SUMIFS for data reporting.",
  Networking: "Get comfortable with subnetting, DNS, and TCP/IP basics — this comes up constantly in technical screens.",
  "Security Tools": "Install Wireshark and Nmap, run diagnostic scans on your own home lab, and write an audit report.",
  "Threat Analysis": "Work through hands-on rooms on TryHackMe or HackTheBox and write vulnerability remediation notes.",
  Cryptography: "Implement symmetric vs asymmetric encryption examples and explain hashing differences in your portfolio.",
  Compliance: "Summarize how GDPR, SOC2, or ISO 27001 policies apply to application data flow and access control.",
  "Incident Response": "Draft an incident response runbook detailing triage, containment, and post-mortem review steps.",
  "Native/Cross-platform": "Ship one complete mobile app to a physical device or simulator using Flutter or React Native.",
  "State Management": "Manage complex asynchronous state using Redux Toolkit, Zustand, or Provider with offline caching.",
  "App Store": "Configure signing keys, app permissions, and build bundles ready for Google Play or Apple App Store.",
  Creativity: "Complete a design sprint challenge (one distinct visual concept daily) and post your process.",
  "Print/Digital": "Design matching assets for both high-res print and digital social dimensions.",
  "Client Work": "Complete a mock rebranding brief for a real local business with measurable goals.",
  "Social Media Marketing": "Plan and execute a targeted paid/organic campaign, documenting reach, CTR, and conversion metrics.",
  "SEO/SEM": "Optimize on-page SEO (meta tags, headings, schema markup) and track search rankings over 30 days.",
  Analytics: "Set up Google Analytics 4 (GA4) custom events and extract 3 actionable user drop-off insights.",
  "Content Creation": "Produce a 5-part content series with platform-native copywriting and visual assets.",
  "Writing Skills": "Write 3 long-form articles in distinct tones (authoritative, conversational, promotional).",
  "SEO Basics": "Structure high-ranking articles with keyword clustering, internal linking, and scannable H2/H3 headers.",
  Research: "Fact-check and cite verified industry research to support every key argument in your writing.",
  Tools: "Demonstrate collaborative editing, version history, and grammar linting tools in your workflow.",
  "Customer Communication": "Practice crafting calm, empathetic, and solution-oriented responses to difficult customer escalations.",
  "Support Channels & Tools": "Get hands-on experience setting up ticket routing, macros, and SLA rules in Zendesk, Intercom, or Freshdesk.",
  "Issue Resolution & Handling": "Document a step-by-step troubleshooting guide for handling recurring customer order/account issues.",
  "Digital Literacy": "Increase your typing accuracy and speed while mastering spreadsheet data entry shortcuts.",
  "Service Reliability & Empathy": "Highlight measurable customer satisfaction (CSAT) achievements and de-escalation success stories.",
  "Data Entry": "Perform timed data entry exercises, maintaining 99%+ accuracy and logging entries per hour.",
  Scheduling: "Configure automated scheduling workflows using tools like Calendly or Google Calendar.",
  "Office Tools": "Build formula-driven operational spreadsheets to track workflow tasks and inventory.",
  "Attention to Detail": "Perform rigorous proofreading audits on sample invoices or contracts to catch discrepancies.",
  "Sales Skills": "Structure standard B2B sales conversations following the Prospect → Discovery → Objection → Close framework.",
  "CRM Tools": "Set up deal pipelines, contact stages, and automated follow-ups in HubSpot CRM or Salesforce.",
  "Market Research": "Conduct a competitive matrix analysis comparing 5 industry competitors on pricing and features.",
  "Relationship Building": "Build a systematic outreach tracking cadency for maintaining client relationships.",
  Recruitment: "Draft an end-to-end job specification, screening rubric, and behavioral interview scorecard.",
  Administration: "Design an organized digital filing structure and team operating procedure manual.",
  "MS Office": "Create an executive PowerPoint deck and advanced Excel financial model.",
  Compliance: "Summarize statutory employment policies and workplace compliance guidelines.",
  "Subject Knowledge": "Structure a comprehensive 12-week curriculum syllabus for your core subject area.",
  "Teaching & Communication": "Break down complex concepts into bite-sized analogies and active recall exercises.",
  "Lesson Planning": "Write structured lesson plans with clear learning objectives, activities, and checkpoints.",
  "Student Engagement": "Incorporate interactive quizzes, peer reviews, and discussion prompts into lessons.",
  Assessment: "Design formative and summative quizzes with detailed rubrics and feedback benchmarks.",
  Communication: "Draft professional, concise business emails for status updates, escalations, and summaries.",
  "Digital Tool Familiarity": "List all business and communication tools you actively utilize across daily operations.",
  "Reliability & Initiative": "Document an instance where you proactively resolved an operational bottleneck.",
  "Relevant Experience": "Emphasize transferable project milestones and responsibilities even from informal roles.",
  "Measurable Impact": "Ensure every single bullet point answers: 'What was the result and how was it measured?'.",
};

export const MAINTAIN_TIPS = [
  "This is already a standout strength — keep it prominently featured in your summary and top experience bullet.",
  "Solid signal here. Continue demonstrating this competency with recent project milestones.",
  "A genuine competitive advantage — lead with it during recruiter screenings and interviews.",
  "Maintain this level of precision and detail; it distinguishes your profile from generic candidates.",
  "Keep your examples specific and outcome-focused to preserve this high evaluation rating.",
];
