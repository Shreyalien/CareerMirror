export const JOB_BLUEPRINTS = {
  "Frontend Developer": {
    lead: "A live project link or GitHub repo, placed above your education.",
    emphasize: "Specific frameworks (React, Vue, Next.js) and one project you can explain end-to-end.",
    avoid: "Generic 'familiar with HTML/CSS' — show a live demo instead of claiming it.",
  },
  "Backend Developer": {
    lead: "One system you've built end-to-end (API + database), not just 'learned Node.js'.",
    emphasize: "Scale or performance numbers if you have them, and your database design decisions.",
    avoid: "Listing every language you've touched without real depth in any single one.",
  },
  "Full-Stack Developer": {
    lead: "One complete project (frontend + backend + deployed) featured prominently.",
    emphasize: "The full pipeline you personally own, not just isolated pieces.",
    avoid: "Spreading yourself across ten tools with no depth anywhere.",
  },
  "UI/UX Designer": {
    lead: "Your portfolio link at the very top — this role is judged visually first.",
    emphasize: "Your process (research → wireframe → prototype), not just the final screens.",
    avoid: "A visually plain CV — it undermines a design candidacy immediately.",
  },
  "Data Analyst": {
    lead: "One specific insight you found in a real dataset, with the business impact.",
    emphasize: "Tools (SQL/Python/Excel) paired with an actual question you answered.",
    avoid: "Naming tools without ever describing what you actually analyzed with them.",
  },
  "Cybersecurity Analyst": {
    lead: "Hands-on proof — CTF ranks, TryHackMe/HackTheBox rooms, or a home-lab writeup.",
    emphasize: "Specific tools you've actually run — Wireshark, Nmap, Burp Suite.",
    avoid: "Vague 'security enthusiast' language with no tool names or proof attached.",
  },
  "Mobile App Developer": {
    lead: "A published app (even a TestFlight/APK link) or a short demo video/GIF.",
    emphasize: "Which platform you shipped on and what you built end-to-end.",
    avoid: "Listing 'Flutter/React Native' with no working app to actually point to.",
  },
  "Graphic Designer": {
    lead: "A portfolio link, not a paragraph — this role is judged almost entirely visually.",
    emphasize: "2-3 strongest pieces, each with the brief or problem you solved.",
    avoid: "A plain-text CV with no visual identity of its own — it contradicts the pitch.",
  },
  "Digital Marketing Executive": {
    lead: "A campaign result with real numbers — reach, CTR, or conversions.",
    emphasize: "Which channels you've actually run — Meta Ads, Google Ads, SEO, email.",
    avoid: "'Social media savvy' with no platform, budget, or metric attached.",
  },
  "Content Writer": {
    lead: "A link to 2-3 published samples — a blog, portfolio, or even a personal blog.",
    emphasize: "Range — show you can write in different tones and formats, not just one.",
    avoid: "Describing your writing in the CV instead of linking to actual samples.",
  },
  "Customer Support / Customer Service": {
    lead: "Response time, ticket volume, or customer satisfaction (CSAT) numbers if you have any.",
    emphasize: "Specific communication channels, helpdesk tools, CRM systems, and inquiry volume handled.",
    avoid: "Just listing passive duties — 'handled customer queries' says nothing without scale or resolution rate attached.",
  },
  "Virtual Assistant / Data Entry": {
    lead: "Typing speed, accuracy rate, or volume handled — e.g. '200 records/day, 98% accuracy'.",
    emphasize: "Tools you're fluent in — Excel, Google Sheets, specific CRMs, calendar management.",
    avoid: "No mention of speed or accuracy — these are exactly what this role is judged on.",
  },
  "Sales & Business Development": {
    lead: "A number — deals closed, revenue generated, client accounts retained, or quota attainment.",
    emphasize: "Which part of the sales cycle you owned — prospecting, closing, or retention.",
    avoid: "Soft skills only ('great communicator') with zero sales numbers behind them.",
  },
  "HR / Admin Executive": {
    lead: "Scale — how many employees, records, recruitment pipelines, or office processes you managed.",
    emphasize: "Specific HR tools or processes — recruitment, onboarding, HRIS systems, policy documentation.",
    avoid: "Generic 'organized and detail-oriented' with nothing concrete underneath it.",
  },
  "Teacher / Tutor": {
    lead: "Your subject and age group / grade level, stated clearly right at the top.",
    emphasize: "A specific outcome — student grade improvement, exam results, or syllabus completion.",
    avoid: "'Patient and passionate' with no teaching outcome to actually prove it.",
  },
};

export const GENERIC_BLUEPRINT = {
  lead: "Your most relevant experience for this exact role, positioned prominently near the top.",
  emphasize: "One measurable outcome per bullet point — a metric, percentage, scale, or concrete result.",
  avoid: "Generic adjectives ('hardworking', 'passionate') with nothing specific behind them.",
};

export function getBlueprint(jobTarget) {
  return JOB_BLUEPRINTS[jobTarget] || GENERIC_BLUEPRINT;
}
