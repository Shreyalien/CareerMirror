export const DREAM_JOB_PRESETS = [
  {
    id: "ai_fullstack",
    title: "AI & Full-Stack Application Engineer",
    company: "OpenAI / Anthropic / Vercel",
    category: "AI & Modern Web",
    requiredSkills: [
      { skill: "LLM Orchestration / LangChain", keywords: ["langchain", "llamaindex", "openai", "claude", "rag", "embeddings", "vector"] },
      { skill: "React 18 / Next.js App Router", keywords: ["next.js", "nextjs", "react", "typescript", "tailwind"] },
      { skill: "Vector Databases & Caching", keywords: ["pinecone", "weaviate", "redis", "qdrant", "chroma"] },
      { skill: "Streaming & WebSockets", keywords: ["sse", "streaming", "websocket", "real-time", "realtime"] },
      { skill: "Python / Node.js Microservices", keywords: ["fastapi", "python", "node", "express", "docker"] },
    ],
    projectBlueprint: "Build an end-to-end RAG application with vector search, streaming responses, and latency monitoring.",
    recruiterInsight: "Hiring managers look for hands-on experience handling LLM token latency, evaluation frameworks, and clean streaming UX.",
  },
  {
    id: "frontend_architect",
    title: "Frontend Architect & Design Systems Lead",
    company: "Stripe / Airbnb / Figma",
    category: "UI Architecture",
    requiredSkills: [
      { skill: "Design Systems & Token Architecture", keywords: ["design system", "component library", "storybook", "tokens", "figma"] },
      { skill: "Advanced TypeScript & State Management", keywords: ["typescript", "zustand", "redux", "jotai", "state machine"] },
      { skill: "Web Performance & Core Web Vitals", keywords: ["lighthouse", "web vitals", "bundle size", "tree shaking", "lazy load", "optimization"] },
      { skill: "Automated E2E & Component Testing", keywords: ["cypress", "playwright", "vitest", "jest", "testing library"] },
      { skill: "Accessibility (a11y) & WCAG Compliance", keywords: ["a11y", "accessibility", "wcag", "aria", "keyboard navigation"] },
    ],
    projectBlueprint: "Create an accessible, multi-theme component system with automated token generation, Storybook documentation, and 95+ Lighthouse score.",
    recruiterInsight: "Expect rigorous system design interviews on layout reflows, micro-frontends, state synchronization, and render optimizations.",
  },
  {
    id: "backend_distributed",
    title: "Staff Distributed Systems & Backend Engineer",
    company: "Netflix / Uber / AWS",
    category: "High-Scale Backend",
    requiredSkills: [
      { skill: "Distributed Caching & Message Queues", keywords: ["kafka", "rabbitmq", "redis", "event-driven", "pubsub", "sqs"] },
      { skill: "High-Throughput Databases & Sharding", keywords: ["postgresql", "cassandra", "dynamodb", "mongodb", "indexing", "sharding", "replication"] },
      { skill: "Cloud Architecture & Kubernetes", keywords: ["kubernetes", "k8s", "docker", "aws", "terraform", "grpc"] },
      { skill: "System Observability & Monitoring", keywords: ["prometheus", "grafana", "opentelemetry", "datadog", "distributed tracing"] },
      { skill: "High Availability & Concurrency", keywords: ["concurrency", "load balancing", "fault tolerance", "rate limiting", "circuit breaker"] },
    ],
    projectBlueprint: "Architect an event-driven payment/notification microservice handling 10,000 requests/second with circuit breaking and tracing.",
    recruiterInsight: "Hiring teams prioritize candidates who understand CAP theorem trade-offs, p99 latency degradation, and database deadlock resolution.",
  },
  {
    id: "product_designer",
    title: "Principal Product & UX Systems Designer",
    company: "Apple / Linear / Ramp",
    category: "Product & UX Design",
    requiredSkills: [
      { skill: "Complex Interactive Prototyping", keywords: ["figma", "protopie", "framer", "interactive prototype", "micro-interactions"] },
      { skill: "User Research & Usability Testing", keywords: ["user research", "usability testing", "interviews", "personas", "journey map"] },
      { skill: "B2B SaaS / Fintech Workflows", keywords: ["b2b", "saas", "dashboard", "fintech", "complex workflows", "information architecture"] },
      { skill: "Design Tokens & Developer Handoff", keywords: ["design tokens", "component handoff", "html/css", "developer handoff"] },
      { skill: "Product Strategy & Metrics", keywords: ["retention", "conversion", "activation", "a/b test", "kpis"] },
    ],
    projectBlueprint: "Design a desktop-grade fintech or developer tool dashboard with complete interaction specs, design tokens, and usability test findings.",
    recruiterInsight: "Design directors look for candidates who can articulate the 'why' behind design choices and demonstrate measurable business impact.",
  },
  {
    id: "data_ml_engineer",
    title: "Senior Data & Machine Learning Engineer",
    company: "Snowflake / Databricks / Meta",
    category: "Data & ML Infrastructure",
    requiredSkills: [
      { skill: "Distributed Data Pipelines & Spark", keywords: ["spark", "pyspark", "airflow", "dbt", "etl", "data pipeline"] },
      { skill: "Data Warehousing & SQL Optimization", keywords: ["snowflake", "bigquery", "redshift", "sql", "window functions", "partitioning"] },
      { skill: "Model Training & Feature Stores", keywords: ["scikit-learn", "pytorch", "tensorflow", "feature store", "mlflow"] },
      { skill: "Python Data Ecosystem", keywords: ["python", "pandas", "numpy", "polars"] },
      { skill: "Data Quality & Governance", keywords: ["data quality", "lineage", "great expectations", "schema validation"] },
    ],
    projectBlueprint: "Build an automated real-time feature extraction pipeline with Apache Airflow and dbt feeding an ML recommendation model.",
    recruiterInsight: "Companies value engineers who can build reliable data ingestion pipelines that don't break on schema drift or missing records.",
  },
];

export function analyzeDreamJobGap(cvText = "", dreamRoleTitle = "", targetCompany = "") {
  const lower = cvText.toLowerCase();

  // Find best matching preset or build dynamic analysis
  const matchedPreset = DREAM_JOB_PRESETS.find((p) =>
    dreamRoleTitle.toLowerCase().includes(p.category.toLowerCase()) ||
    p.title.toLowerCase().includes(dreamRoleTitle.toLowerCase()) ||
    p.company.toLowerCase().includes(targetCompany.toLowerCase())
  ) || DREAM_JOB_PRESETS[0];

  const requiredSkills = matchedPreset.requiredSkills;
  const verifiedSkills = [];
  const missingSkills = [];

  requiredSkills.forEach((req) => {
    const hits = req.keywords.filter((k) => lower.includes(k)).length;
    if (hits > 0) {
      verifiedSkills.push({
        skill: req.skill,
        status: "verified",
        matchedKeyword: req.keywords.find((k) => lower.includes(k)),
      });
    } else {
      missingSkills.push({
        skill: req.skill,
        status: "missing",
        priority: missingSkills.length === 0 ? "Critical Requirement" : "High Priority",
        keywordsToInclude: req.keywords.slice(0, 3),
        recommendation: `Add experience or a project covering ${req.keywords.slice(0, 2).join(", ")}.`,
      });
    }
  });

  const total = requiredSkills.length;
  const readyCount = verifiedSkills.length;
  const matchPercentage = Math.min(96, Math.max(35, Math.round((readyCount / total) * 100) + (readyCount > 0 ? 10 : 0)));

  // ATS Score Booster Suggestions
  const atsBoosterSuggestions = [
    {
      id: "keywords_boost",
      title: `Inject Top ${dreamRoleTitle || matchedPreset.title} Keywords`,
      points: "+14 pts ATS Boost",
      type: "Keyword Density",
      desc: `Add keywords: ${missingSkills.flatMap((m) => m.keywordsToInclude).slice(0, 4).join(", ")} in your Technical Skills section.`,
    },
    {
      id: "metrics_boost",
      title: "Add 2+ Quantified Production Metrics",
      points: "+12 pts ATS Boost",
      type: "Impact Signal",
      desc: "ATS algorithms favor bullets with quantifiable outcomes (e.g. 'reduced latency by 35%', 'handled 50k+ daily users').",
    },
    {
      id: "verbs_boost",
      title: "Replace Passive Phrasing with Power Verbs",
      points: "+8 pts ATS Boost",
      type: "Action Verbs",
      desc: "Swap 'helped with' or 'worked on' for 'Architected', 'Spearheaded', 'Optimized'.",
    },
    {
      id: "headers_boost",
      title: "Standardize ATS Section Headings",
      points: "+6 pts ATS Boost",
      type: "Structure",
      desc: "Ensure headings are uppercase: PROFESSIONAL SUMMARY, WORK EXPERIENCE, TECHNICAL SKILLS, EDUCATION.",
    },
  ];

  // 1-Click CV Injection snippet
  const snippetToInject = `\n\nTECHNICAL SKILLS & ADVANCED COMPETENCIES\n• Core Stack & Frameworks: ${missingSkills.flatMap((m) => m.keywordsToInclude).slice(0, 4).join(", ")}, Clean Architecture, Production Deployment\n\nFEATURED PROJECT HIGHLIGHT\n• ${dreamRoleTitle || matchedPreset.title} Milestone: Built production-ready ${matchedPreset.category} solution demonstrating ${missingSkills[0]?.skill || "high scalability"} and 99.9% uptime.`;

  return {
    dreamRoleTitle: dreamRoleTitle || matchedPreset.title,
    targetCompany: targetCompany || matchedPreset.company,
    matchPercentage,
    verifiedSkills,
    missingSkills,
    projectBlueprint: matchedPreset.projectBlueprint,
    recruiterInsight: matchedPreset.recruiterInsight,
    atsBoosterSuggestions,
    snippetToInject,
  };
}
