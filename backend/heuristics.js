import { getBlueprint } from "./blueprints.js";
import { wordMatch } from "./textMatch.js";

// Lightweight rule-based "CV signal" reader. Used whenever no AI API key
// is set, so the app still feels alive and gives varied, CV-specific answers
// instead of one static paragraph.

const ACTION_VERBS = [
  "built", "led", "designed", "developed", "created", "launched",
  "shipped", "optimized", "automated", "reduced", "increased", "improved",
  "implemented", "architected", "migrated", "deployed", "mentored", "solved",
  "managed", "spearheaded", "resolved", "coordinated",
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

function findMatches(text, list) {
  const lower = text.toLowerCase();
  return list.filter((w) => wordMatch(lower, w));
}

export function parseCvSignals(cvText) {
  const text = cvText || "";
  const words = text.trim().split(/\s+/).filter(Boolean);
  const quantified = (text.match(/\d+(\.\d+)?\s?(%|percent|x|users|hours|days|projects|k\b|\$|tickets|queries)/gi) || []).length;
  const actionVerbCount = countMatches(text, ACTION_VERBS);
  const weakPhrases = findMatches(text, WEAK_PHRASES);
  const buzzwords = findMatches(text, BUZZWORDS);
  const hasEducation = /education|university|bsc|college|degree|academic/i.test(text);
  const hasProjects = /project|portfolio|achievements/i.test(text);
  const hasContact = /@|linkedin|github|portfolio|behance/i.test(text);
  const hasDates = /(20\d{2})|(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*20\d{2}/i.test(text);
  const bulletCount = (text.match(/\n\s*[-•*]/g) || []).length;

  return {
    wordCount: words.length,
    quantified,
    actionVerbCount,
    weakPhrases,
    buzzwords,
    hasEducation,
    hasProjects,
    hasContact,
    hasDates,
    bulletCount,
  };
}

const PERSONA_FLAVOR = {
  startup: {
    coachOpeners: [
      "Alright, let's cut to what actually matters here.",
      "Here's my honest read as someone hiring fast.",
      "No fluff, let's get into it.",
      "Here's what jumps out at me first.",
    ],
    roastOpeners: [
      "Okay real talk, let's speed-run your weaknesses.",
      "I've got 90 seconds between meetings, so buckle up.",
      "Let's do this fast, like everything else around here.",
      "No time for gentle, so here's the sharp version.",
    ],
  },
  faang: {
    coachOpeners: [
      "Running this through my mental rubric — here's where you land.",
      "Let's look at signal strength across your CV.",
      "Treating this like a structured technical screen — here's the read.",
    ],
    roastOpeners: [
      "I review 40 CVs a day. Yours gave me exactly one thing to remember.",
      "Let's talk about what's missing before we talk about what's there.",
      "Applying the same high bar I'd apply to any candidate at scale.",
    ],
  },
  mnc: {
    coachOpeners: [
      "Thank you for submitting your profile. Here is my structured assessment.",
      "Reviewing against our standard competency framework.",
      "Per our evaluation criteria, here's where things stand.",
    ],
    roastOpeners: [
      "I'll keep this professional, but I will not sugarcoat it.",
      "Per our internal rubric, there are some gaps to flag.",
      "This wouldn't clear our initial screening filter, and here's why.",
    ],
  },
  agency: {
    coachOpeners: [
      "Okay, as a visual person, here's my gut reaction first.",
      "Let's talk craft and storytelling, because that's what I care about.",
    ],
    roastOpeners: [
      "I judge portfolios for a living, so brace yourself.",
      "This needs more personality, darling. Let me explain.",
    ],
  },
  freelance: {
    coachOpeners: [
      "As someone who isn't technical, here's what I actually noticed.",
      "I just need to trust you fast — here's how close you are.",
    ],
    roastOpeners: [
      "Honestly? A little confusing for a client like me.",
      "I almost closed the tab. Let me tell you why.",
    ],
  },
  bank: {
    coachOpeners: [
      "From a compliance and stability standpoint, here's my view.",
      "Reviewing for risk, accuracy, and consistency.",
    ],
    roastOpeners: [
      "I need precision. This has... vibes instead of numbers.",
      "In banking, vague claims are a red flag. Let's fix that.",
    ],
  },
  cyber: {
    coachOpeners: [
      "Running a quick threat model on your CV. Here's what I found.",
      "I trust evidence, not adjectives. Let's see what you've got.",
    ],
    roastOpeners: [
      "I'm suspicious by profession. Your CV isn't helping its case.",
      "Zero proof of hands-on work is basically an open vulnerability.",
    ],
  },
  ngo: {
    coachOpeners: [
      "I care about impact stories — let's find yours.",
      "Here's what stood out to me, human to human.",
    ],
    roastOpeners: [
      "Gently, but honestly — this reads a bit corporate for our mission.",
      "Where's the human impact story? I need to see it here.",
    ],
  },
  consultancy: {
    coachOpeners: [
      "Structuring my feedback the way I'd structure an executive deck.",
      "Let's MECE this CV real quick.",
    ],
    roastOpeners: [
      "I have three minutes and your CV used two of them badly.",
      "So what's the 'so what' here? I'm not seeing it yet.",
    ],
  },
};

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function buildStrengthLine(signals) {
  const lines = [];
  if (signals.quantified >= 2) lines.push("you actually back things up with numbers, which is rare");
  if (signals.actionVerbCount >= 4) lines.push("your bullets start with real action verbs instead of fluff");
  if (signals.hasProjects) lines.push("there's concrete project work here, not just listed duties");
  if (signals.bulletCount >= 4) lines.push("the formatting is scannable, which recruiters silently reward");
  if (signals.hasDates) lines.push("your career timeline is clear and easy to follow");
  if (signals.hasContact) lines.push("you've made your contact info clear and accessible");
  return lines.length ? lines : ["there's a foundation here worth building on"];
}

function buildWeaknessLine(signals) {
  const lines = [];
  if (signals.quantified < 2) lines.push("almost nothing is quantified — no percentages, scale, or metrics");
  if (signals.weakPhrases.length) {
    lines.push(`phrases like "${signals.weakPhrases[0]}" describe passive duties, not achievements`);
  }
  if (signals.buzzwords.length) {
    lines.push(`words like "${signals.buzzwords[0]}" are filler — anyone can claim them`);
  }
  if (signals.wordCount < 80) lines.push("this is quite thin — provide more substance and evidence");
  if (!signals.hasProjects) lines.push("no clear projects or outcomes mentioned to prove your capability");
  return lines.length ? lines : ["it's solid but forgettable — nothing here makes you stand out yet"];
}

export function buildDemoAnalysis({ persona, mode, cvText, jobTarget, skillFit }) {
  const signals = parseCvSignals(cvText);
  const flavor = PERSONA_FLAVOR[persona] || PERSONA_FLAVOR.startup;
  const opener = mode === "roast" ? pick(flavor.roastOpeners) : pick(flavor.coachOpeners);
  const strengths = buildStrengthLine(signals);
  const weaknesses = buildWeaknessLine(signals);

  const weakestField = skillFit && skillFit.length ? skillFit[skillFit.length - 1] : null;
  const strongestField = skillFit && skillFit.length ? skillFit[0] : null;

  if (mode === "roast") {
    const burns = [
      `${weaknesses[0]}.`,
      weaknesses[1] ? `${weaknesses[1]}.` : `Even your strongest line — "${strengths[0]}" — needed a search party to find.`,
      weakestField
        ? `Your ${weakestField.field.toLowerCase()} signal is basically a ghost town.`
        : `There's real work left before this is interview-ready.`,
    ];
    return `${opener}\n\n1. ${burns[0]}\n2. ${burns[1]}\n3. ${burns[2]}\n\nVerdict: closer to ${
      strongestField ? strongestField.field : "somewhere"
    } than to ${jobTarget}. Fix the numbers problem first — it's the highest-leverage win you're leaving on the table.`;
  }

  return `${opener}\n\n1. Strength: ${strengths[0]}.\n2. Priority Fix: ${weaknesses[0]}.\n3. Next Step: ${
    weaknesses[1] || "trim anything generic that doesn't say something specific about you"
  }.\n\nTarget Guidance for ${jobTarget}: You're tracking well toward ${
    strongestField ? strongestField.field : "a few directions"
  }${weakestField ? `, but ${weakestField.field.toLowerCase()} needs the most attention right now.` : "."} Start with one measurable outcome per bullet — that alone changes how this reads.`;
}

const INTENT_KEYWORDS = {
  reject: [
    "why not", "reject", "not hire", "wouldn't hire", "would not hire",
    "won't hire", "why should", "why wouldn't", "unsuitable", "not fit",
    "not suitable", "hire me", "not qualified", "turn me down", "pass on me",
  ],
  blueprint: [
    "how should i build", "how to build", "how do i build", "structure my cv",
    "improve my cv for", "build my cv", "how should my cv look", "how do i write",
  ],
  strength: ["strong", "good", "best", "well", "positive", "impressive"],
  weakness: ["weak", "bad", "improve", "wrong", "fix", "lack", "missing", "gap"],
  field: ["field", "role", "better suited", "career", "path", "suit", "sector"],
  score: ["score", "graph", "chart", "number", "rating", "rank"],
};

function matchIntent(question) {
  const q = question.toLowerCase();
  for (const [intent, words] of Object.entries(INTENT_KEYWORDS)) {
    if (words.some((w) => q.includes(w))) return intent;
  }
  return "general";
}

export function buildDemoFollowUp({ persona, mode, cvText, jobTarget, question, skillFit }) {
  const signals = parseCvSignals(cvText);
  const intent = matchIntent(question);
  const funny = mode === "roast";
  const weakestField = skillFit && skillFit.length ? skillFit[skillFit.length - 1] : null;
  const strongestField = skillFit && skillFit.length ? skillFit[0] : null;

  let answer;
  if (intent === "strength") {
    const s = buildStrengthLine(signals);
    answer = funny
      ? `Honestly? ${s[0]}. Don't get used to compliments though.`
      : `Your clearest strength right now: ${s[0]}. Lean into that in your summary.`;
  } else if (intent === "weakness") {
    const w = buildWeaknessLine(signals);
    answer = funny
      ? `Where do I start — ${w[0]}. It's giving "wrote this at 2am" energy.`
      : `The biggest gap: ${w[0]}. That's the highest-leverage fix you can make today.`;
  } else if (intent === "reject") {
    answer = funny
      ? `If I'm being ridiculous about it: your CV reads like a template cosplaying as a person. For ${jobTarget}, ${
          weakestField ? `your ${weakestField.field.toLowerCase()} is basically decorative` : "the evidence just isn't there yet"
        }.`
      : `For ${jobTarget} specifically, the main risk is ${
          weakestField ? `weak signal in ${weakestField.field.toLowerCase()}` : "not enough demonstrated evidence"
        }. That's usually the deciding factor, more than tone or formatting.`;
  } else if (intent === "blueprint") {
    const bp = getBlueprint(jobTarget);
    answer = funny
      ? `Fine, cheat sheet time: lead with ${bp.lead}, flex ${bp.emphasize}, and for the love of god stop doing this — ${bp.avoid}.`
      : `For ${jobTarget}: lead with ${bp.lead}. Emphasize ${bp.emphasize}. Avoid ${bp.avoid}.`;
  } else if (intent === "field") {
    answer = `Based on what's in your CV, you're currently strongest for ${
      strongestField ? strongestField.field : jobTarget
    } and weakest for ${weakestField ? weakestField.field : "a few areas"}. If you're deciding where to focus next, that's the honest ranking.`;
  } else if (intent === "score") {
    answer = funny
      ? `The graph doesn't care about my jokes — it's counting keywords in your actual CV, same number whether I'm roasting or coaching you. Only my mouth changes, not the math.`
      : `The score and radar chart are calculated straight from your CV text, independent of Coach/Roast mode — that stays consistent so the underlying measurement is always trustworthy. Only the tone of what I say about it changes.`;
  } else {
    answer = funny
      ? `Ask me something sharper — "what's weak", "why wouldn't you hire me", or "what field fits me better" all get you a real answer instead of small talk.`
      : `Happy to go deeper — try asking what's weak, what's strong, or which field fits you best, and I'll answer using what's actually in your CV.`;
  }

  return answer;
}
