// Lightweight rule-based "CV signal" reader. Used whenever no ANTHROPIC_API_KEY
// is set, so the app still feels alive and gives varied, CV-specific answers
// instead of one static paragraph.

const ACTION_VERBS = [
  "built", "built", "led", "designed", "developed", "created", "launched",
  "shipped", "optimized", "automated", "reduced", "increased", "improved",
  "implemented", "architected", "migrated", "deployed", "mentored", "solved",
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

function findMatches(text, list) {
  const lower = text.toLowerCase();
  return list.filter((w) => lower.includes(w));
}

export function parseCvSignals(cvText) {
  const text = cvText || "";
  const words = text.trim().split(/\s+/).filter(Boolean);
  const quantified = (text.match(/\d+(\.\d+)?\s?(%|percent|x|users|hours|days|projects|k\b)/gi) || []).length;
  const actionVerbCount = countMatches(text, ACTION_VERBS);
  const weakPhrases = findMatches(text, WEAK_PHRASES);
  const buzzwords = findMatches(text, BUZZWORDS);
  const hasEducation = /education|university|bsc|college|degree/i.test(text);
  const hasProjects = /project/i.test(text);
  const hasContact = /@|linkedin|github/i.test(text);
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
    bulletCount,
  };
}

const PERSONA_FLAVOR = {
  startup: {
    coachOpeners: [
      "Alright, let's cut to what actually matters here.",
      "Here's my honest read as someone hiring fast.",
    ],
    roastOpeners: [
      "Okay real talk, let's speed-run your weaknesses.",
      "I've got 90 seconds between meetings, so buckle up.",
    ],
  },
  faang: {
    coachOpeners: [
      "Running this through my mental rubric — here's where you land.",
      "Let's look at signal strength across your CV.",
    ],
    roastOpeners: [
      "I review 40 CVs a day. Yours gave me exactly one thing to remember.",
      "Let's talk about what's missing before we talk about what's there.",
    ],
  },
  mnc: {
    coachOpeners: [
      "Thank you for submitting your profile. Here is my structured assessment.",
      "Reviewing against our standard competency framework.",
    ],
    roastOpeners: [
      "I'll keep this professional, but I will not sugarcoat it.",
      "Per our internal rubric, there are some gaps to flag.",
    ],
  },
  agency: {
    coachOpeners: [
      "Okay, as a visual person, here's my gut reaction first.",
      "Let's talk craft, because that's what I care about.",
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
      "Honestly? A little confusing for a non-tech person like me.",
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
      "In banking, vague is a red flag. Let's fix that.",
    ],
  },
  cyber: {
    coachOpeners: [
      "Running a quick threat model on your CV. Here's what I found.",
      "I trust evidence, not adjectives. Let's see what you've got.",
    ],
    roastOpeners: [
      "I'm suspicious by profession. Your CV isn't helping its case.",
      "Zero proof of hands-on work is basically an open port.",
    ],
  },
  ngo: {
    coachOpeners: [
      "I care about impact stories — let's find yours.",
      "Here's what stood out to me, human to human.",
    ],
    roastOpeners: [
      "Gently, but honestly — this reads a bit corporate for our world.",
      "Where's the story? I need to feel something here.",
    ],
  },
  consultancy: {
    coachOpeners: [
      "Structuring my feedback the way I'd structure a client deck.",
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
  if (signals.hasProjects) lines.push("there's project work here, not just job duties");
  if (signals.bulletCount >= 4) lines.push("the formatting is scannable, which recruiters silently reward");
  return lines.length ? lines : ["there's a foundation here worth building on"];
}

function buildWeaknessLine(signals) {
  const lines = [];
  if (signals.quantified < 2) lines.push("almost nothing is quantified — no percentages, no scale, no outcomes");
  if (signals.weakPhrases.length) {
    lines.push(
      `phrases like "${signals.weakPhrases[0]}" describe duties, not achievements`
    );
  }
  if (signals.buzzwords.length) {
    lines.push(`words like "${signals.buzzwords[0]}" are filler — anyone can claim them`);
  }
  if (signals.wordCount < 80) lines.push("this is quite thin — there's not enough evidence to judge you fairly");
  if (!signals.hasProjects) lines.push("no clear projects mentioned, which makes it hard to see what you can actually do");
  return lines.length ? lines : ["it's solid but forgettable — nothing here makes you memorable"];
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
    return `${opener}\n\n🔥 1. ${burns[0]}\n🔥 2. ${burns[1]}\n🔥 3. ${burns[2]}\n\n💀 Verdict: closer to ${
      strongestField ? strongestField.field : "somewhere"
    } than to ${jobTarget}. Fix the numbers problem first — it's the cheapest win you're not taking.`;
  }

  return `${opener}\n\n✅ 1. Keep doing this: ${strengths[0]}.\n✅ 2. Fix this next: ${weaknesses[0]}.\n✅ 3. Then this: ${
    weaknesses[1] || "trim anything generic that doesn't say something specific about you"
  }.\n\n🎯 For ${jobTarget}, you're tracking well toward ${
    strongestField ? strongestField.field : "a few directions"
  }${weakestField ? `, but ${weakestField.field.toLowerCase()} needs the most attention right now.` : "."} Start with one measurable outcome per bullet — that alone changes how this reads.`;
}

const INTENT_KEYWORDS = {
  reject: [
    "why not", "reject", "not hire", "wouldn't hire", "would not hire",
    "won't hire", "why should", "why wouldn't", "unsuitable", "not fit",
    "not suitable", "hire me", "not qualified", "turn me down", "pass on me",
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
  const flavor = PERSONA_FLAVOR[persona] || PERSONA_FLAVOR.startup;
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
