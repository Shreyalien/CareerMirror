export const JOB_BLUEPRINTS = {
  "Frontend Developer": {
    lead: "a live project link or GitHub repo above your education",
    emphasize: "specific frameworks and one project you can explain end-to-end",
    avoid: "generic 'familiar with HTML/CSS' claims with no demo to back it up",
  },
  "Backend Developer": {
    lead: "one system you've built end-to-end, not just 'learned Node.js'",
    emphasize: "scale/performance numbers and your database design decisions",
    avoid: "listing every language you've touched without depth in any",
  },
  "Full-Stack Developer": {
    lead: "one complete, deployed project featured prominently",
    emphasize: "the full pipeline you personally own",
    avoid: "spreading yourself across ten tools with no depth anywhere",
  },
  "UI/UX Designer": {
    lead: "your portfolio link at the very top",
    emphasize: "your process — research, wireframe, prototype — not just final screens",
    avoid: "a visually plain CV, which undermines a design candidacy",
  },
  "Data Analyst": {
    lead: "one specific insight you found in a real dataset",
    emphasize: "tools paired with an actual question you answered",
    avoid: "naming tools without describing what you analyzed with them",
  },
  "Cybersecurity Analyst": {
    lead: "hands-on proof — CTF ranks, TryHackMe rooms, a home-lab writeup",
    emphasize: "specific tools you've actually run",
    avoid: "vague 'security enthusiast' language with no proof",
  },
  "Mobile App Developer": {
    lead: "a published app or a short demo video",
    emphasize: "which platform you shipped on end-to-end",
    avoid: "listing frameworks with no working app to point to",
  },
  "Graphic Designer": {
    lead: "a portfolio link, not a paragraph",
    emphasize: "2-3 strongest pieces with the brief you solved for each",
    avoid: "a plain-text CV with no visual identity of its own",
  },
  "Digital Marketing Executive": {
    lead: "a campaign result with real numbers",
    emphasize: "which channels you've actually run",
    avoid: "'social media savvy' with no platform or metric attached",
  },
  "Content Writer": {
    lead: "a link to 2-3 published samples",
    emphasize: "range across different tones and formats",
    avoid: "describing your writing instead of linking to it",
  },
  "Customer Support / Customer Service": {
    lead: "response time, ticket volume, or CSAT numbers if you have them",
    emphasize: "specific support tools, CRM channels, and volume handled",
    avoid: "just listing duties with no scale or resolution outcome",
  },
  "Virtual Assistant / Data Entry": {
    lead: "typing speed or accuracy rate",
    emphasize: "tools you're fluent in (Excel, Sheets, CRMs)",
    avoid: "no mention of speed, accuracy, or volume at all",
  },
  "Sales & Business Development": {
    lead: "a number — deals closed, revenue generated, or quota attainment",
    emphasize: "which part of the sales cycle you owned",
    avoid: "soft skills only, with zero sales numbers",
  },
  "HR / Admin Executive": {
    lead: "the scale you managed — employees, records, recruitment pipelines",
    emphasize: "specific HR tools, processes, and policies",
    avoid: "generic 'organized and detail-oriented' with nothing concrete",
  },
  "Teacher / Tutor": {
    lead: "your subject and age group, stated clearly",
    emphasize: "a specific learning outcome if you have one",
    avoid: "'patient and passionate' with no outcome to prove it",
  },
};

export const GENERIC_BLUEPRINT = {
  lead: "your most relevant experience for this exact role, at the top",
  emphasize: "one measurable outcome per bullet point",
  avoid: "generic adjectives with nothing specific behind them",
};

export function getBlueprint(jobTarget) {
  return JOB_BLUEPRINTS[jobTarget] || GENERIC_BLUEPRINT;
}
