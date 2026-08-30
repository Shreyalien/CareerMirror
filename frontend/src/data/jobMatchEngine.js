import { SKILL_MAP } from "./skillsDB.js";

const ROLE_ARCHETYPES = {
  "Frontend Developer": [
    {
      title: "Senior Frontend Engineer (React & TypeScript)",
      seniority: "Mid - Senior",
      salary: "$105,000 – $150,000",
      salaryInr: "₹14L – ₹28L",
      workStyle: "Remote / Hybrid",
      keySkills: ["React", "TypeScript", "Tailwind CSS", "Next.js", "Performance Optimization"],
      hiringTypes: ["High-Growth SaaS", "Tech Enterprise", "Design Systems Teams"],
    },
    {
      title: "UI / Web Applications Developer",
      seniority: "Entry - Mid",
      salary: "$75,000 – $110,000",
      salaryInr: "₹8L – ₹16L",
      workStyle: "Remote / On-site",
      keySkills: ["JavaScript", "HTML5/CSS3", "React", "Responsive UI", "REST APIs"],
      hiringTypes: ["Digital Agencies", "E-Commerce", "Product Studios"],
    },
    {
      title: "Design Systems / Frontend Specialist",
      seniority: "Mid-Level",
      salary: "$95,000 – $135,000",
      salaryInr: "₹12L – ₹22L",
      workStyle: "Remote",
      keySkills: ["Component Libraries", "Figma Handoff", "Accessibility", "State Management"],
      hiringTypes: ["Scaleups", "Fintech", "Developer Tooling"],
    },
  ],
  "Backend Developer": [
    {
      title: "Backend API & Distributed Systems Engineer",
      seniority: "Mid - Senior",
      salary: "$115,000 – $165,000",
      salaryInr: "₹16L – ₹32L",
      workStyle: "Remote / Hybrid",
      keySkills: ["Node.js", "Express", "PostgreSQL", "Redis", "Microservices", "Docker"],
      hiringTypes: ["Fintech", "Cloud Infrastructure", "B2B SaaS"],
    },
    {
      title: "Cloud & Database Software Developer",
      seniority: "Mid-Level",
      salary: "$95,000 – $135,000",
      salaryInr: "₹12L – ₹24L",
      workStyle: "Remote",
      keySkills: ["Python / Node.js", "SQL Queries", "REST / GraphQL", "AWS / GCP", "CI/CD"],
      hiringTypes: ["Data Platforms", "Healthcare Tech", "Logistics Tech"],
    },
    {
      title: "Junior / Associate Backend Engineer",
      seniority: "Entry - Mid",
      salary: "$70,000 – $100,000",
      salaryInr: "₹7L – ₹14L",
      workStyle: "Hybrid / On-site",
      keySkills: ["Node.js", "RESTful APIs", "MongoDB / SQL", "Git", "Unit Testing"],
      hiringTypes: ["Seed Startups", "IT Consultancies", "Enterprise"],
    },
  ],
  "Full-Stack Developer": [
    {
      title: "Full-Stack Software Engineer (React + Node.js)",
      seniority: "Mid - Senior",
      salary: "$110,000 – $155,000",
      salaryInr: "₹15L – ₹30L",
      workStyle: "Remote / Hybrid",
      keySkills: ["React", "Node.js", "PostgreSQL / MongoDB", "TypeScript", "REST APIs", "AWS"],
      hiringTypes: ["YC / Seed to Series B Startups", "Product Scaleups", "Modern SaaS"],
    },
    {
      title: "Product Engineer / Core Platform Developer",
      seniority: "Mid-Level",
      salary: "$100,000 – $140,000",
      salaryInr: "₹13L – ₹25L",
      workStyle: "Remote",
      keySkills: ["Full-Stack Architecture", "UI Polish", "Database Optimization", "Fast Shipping"],
      hiringTypes: ["High-Growth Tech", "Bootstrapped SaaS", "AI Tooling"],
    },
    {
      title: "Full-Stack Web & Applications Developer",
      seniority: "Entry - Mid",
      salary: "$80,000 – $115,000",
      salaryInr: "₹9L – ₹18L",
      workStyle: "Remote / On-site",
      keySkills: ["JavaScript", "React", "Express", "SQL", "Deployment", "Git"],
      hiringTypes: ["Software Agencies", "E-Commerce Startups", "Corporate IT"],
    },
  ],
  "UI/UX Designer": [
    {
      title: "Product Designer (B2B SaaS / Web App)",
      seniority: "Mid - Senior",
      salary: "$95,000 – $140,000",
      salaryInr: "₹12L – ₹25L",
      workStyle: "Remote / Hybrid",
      keySkills: ["Figma Systems", "User Research", "Wireframing", "Interactive Prototyping", "Developer Handoff"],
      hiringTypes: ["Product-Led SaaS", "Fintech", "Design Consultancies"],
    },
    {
      title: "UI & Visual Interface Designer",
      seniority: "Entry - Mid",
      salary: "$70,000 – $105,000",
      salaryInr: "₹7L – ₹15L",
      workStyle: "Remote",
      keySkills: ["Figma / Adobe XD", "Design Systems", "Typography", "Mobile UI", "Responsive Design"],
      hiringTypes: ["Creative Agencies", "Consumer Apps", "Branding Studios"],
    },
  ],
  "Data Analyst": [
    {
      title: "Product & Growth Data Analyst",
      seniority: "Mid-Level",
      salary: "$85,000 – $125,000",
      salaryInr: "₹10L – ₹20L",
      workStyle: "Remote / Hybrid",
      keySkills: ["SQL Queries", "Python (Pandas)", "Tableau / Power BI", "Cohort Analysis", "A/B Testing"],
      hiringTypes: ["E-Commerce", "SaaS Startups", "Market Research"],
    },
    {
      title: "Business Intelligence Analyst",
      seniority: "Entry - Mid",
      salary: "$75,000 – $110,000",
      salaryInr: "₹8L – ₹16L",
      workStyle: "Hybrid / On-site",
      keySkills: ["SQL", "Dashboard Reporting", "Excel Modeling", "Data Cleaning", "Stakeholder Presentation"],
      hiringTypes: ["Financial Services", "Retail Analytics", "Supply Chain Tech"],
    },
  ],
  "Cybersecurity Analyst": [
    {
      title: "Information Security & SOC Analyst",
      seniority: "Mid-Level",
      salary: "$95,000 – $140,000",
      salaryInr: "₹12L – ₹24L",
      workStyle: "Remote / Hybrid",
      keySkills: ["Network Security", "SIEM / Wireshark", "Threat Detection", "Incident Response", "Vulnerability Audits"],
      hiringTypes: ["Financial Institutions", "Managed Sec Providers", "Enterprise Cloud"],
    },
  ],
  "Mobile App Developer": [
    {
      title: "Mobile Engineer (React Native / Flutter)",
      seniority: "Mid - Senior",
      salary: "$100,000 – $145,000",
      salaryInr: "₹13L – ₹26L",
      workStyle: "Remote",
      keySkills: ["React Native / Flutter", "State Management", "REST APIs", "App Store Deployment", "Mobile UI"],
      hiringTypes: ["Consumer Mobile Apps", "Fintech", "Healthtech"],
    },
  ],
  "Graphic Designer": [
    {
      title: "Brand & Digital Graphic Designer",
      seniority: "Entry - Mid",
      salary: "$60,000 – $90,000",
      salaryInr: "₹6L – ₹12L",
      workStyle: "Remote / Hybrid",
      keySkills: ["Photoshop", "Illustrator", "Canva", "Brand Identity", "Visual Design"],
      hiringTypes: ["Advertising Agencies", "D2C Brands", "Marketing Studios"],
    },
  ],
  "Digital Marketing Executive": [
    {
      title: "Performance & Growth Marketing Specialist",
      seniority: "Mid-Level",
      salary: "$70,000 – $105,000",
      salaryInr: "₹8L – ₹16L",
      workStyle: "Remote / Hybrid",
      keySkills: ["Meta Ads", "Google Ads", "SEO", "Google Analytics", "Campaign Strategy"],
      hiringTypes: ["E-Commerce", "SaaS Scaleups", "Digital Agencies"],
    },
  ],
  "Content Writer": [
    {
      title: "Content & Copywriting Specialist",
      seniority: "Entry - Mid",
      salary: "$55,000 – $85,000",
      salaryInr: "₹5L – ₹11L",
      workStyle: "Remote",
      keySkills: ["SEO Copywriting", "Article Writing", "Content Strategy", "Editing", "WordPress"],
      hiringTypes: ["Media Publications", "B2B SaaS", "Marketing Agencies"],
    },
  ],
  "Customer Support / Customer Service": [
    {
      title: "Senior Customer Support Specialist (Omnichannel)",
      seniority: "Mid - Senior",
      salary: "$50,000 – $75,000",
      salaryInr: "₹5L – ₹10L",
      workStyle: "Remote / 24/7 Shift",
      keySkills: ["Zendesk / Intercom", "Customer Communication", "Ticket Escalation", "CSAT Optimization", "De-escalation"],
      hiringTypes: ["E-Commerce Platforms", "SaaS Companies", "Fintech Support"],
    },
    {
      title: "Customer Experience & Support Representative",
      seniority: "Entry - Mid",
      salary: "$40,000 – $60,000",
      salaryInr: "₹4L – ₹8L",
      workStyle: "Remote",
      keySkills: ["Live Chat", "Email Support", "CRM Management", "Order Tracking", "Troubleshooting"],
      hiringTypes: ["Consumer Tech", "Hospitality / Travel", "Retail Services"],
    },
  ],
  "Virtual Assistant / Data Entry": [
    {
      title: "Executive Virtual Assistant & Operations Coordinator",
      seniority: "Entry - Mid",
      salary: "$40,000 – $65,000",
      salaryInr: "₹4L – ₹8L",
      workStyle: "Remote",
      keySkills: ["Google Sheets / Excel", "Calendar Management", "Email Handling", "Data Accuracy", "CRM"],
      hiringTypes: ["Solo Founders", "Consulting Firms", "Remote Agencies"],
    },
  ],
  "Sales & Business Development": [
    {
      title: "Business Development Representative (BDR / SDR)",
      seniority: "Entry - Mid",
      salary: "$65,000 – $95,000 + Commission",
      salaryInr: "₹7L – ₹15L",
      workStyle: "Hybrid / Remote",
      keySkills: ["Outbound Prospecting", "CRM Pipeline", "Lead Qualification", "Negotiation", "Cold Outreach"],
      hiringTypes: ["B2B Tech", "Enterprise Services", "Financial Tech"],
    },
  ],
  "HR / Admin Executive": [
    {
      title: "People Operations & HR Specialist",
      seniority: "Mid-Level",
      salary: "$65,000 – $95,000",
      salaryInr: "₹7L – ₹14L",
      workStyle: "Hybrid / On-site",
      keySkills: ["Recruitment & Screening", "Employee Onboarding", "HRIS Tools", "Compliance Policies", "Office Admin"],
      hiringTypes: ["Growing Startups", "Corporate Enterprises", "Consulting Firms"],
    },
  ],
  "Teacher / Tutor": [
    {
      title: "Academic Instructor / Subject Specialist Tutor",
      seniority: "Entry - Mid",
      salary: "$45,000 – $75,000",
      salaryInr: "₹5L – ₹10L",
      workStyle: "Remote / Hybrid",
      keySkills: ["Curriculum Planning", "Student Assessment", "Instructional Design", "Communication", "Online Learning"],
      hiringTypes: ["EdTech Platforms", "Academic Institutions", "Private Tutoring"],
    },
  ],
};

export const HIRING_PLATFORMS = [
  {
    name: "LinkedIn Jobs",
    category: "Global & Enterprise",
    tagline: "Direct recruiter listings and 1-click applications",
    color: "#0A66C2",
    getUrl: (role) => `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(role)}&f_TPR=r2592000`,
  },
  {
    name: "Wellfound (AngelList)",
    category: "High-Growth Startups",
    tagline: "Direct access to startup founders & transparent salaries",
    color: "#FF6154",
    getUrl: (role) => `https://wellfound.com/jobs?role=${encodeURIComponent(role)}`,
  },
  {
    name: "Indeed",
    category: "Broad Market",
    tagline: "High-volume direct postings with quick apply",
    color: "#2164f3",
    getUrl: (role) => `https://www.indeed.com/jobs?q=${encodeURIComponent(role)}`,
  },
  {
    name: "RemoteOK",
    category: "100% Remote Positions",
    tagline: "Global remote-first companies hiring worldwide",
    color: "#FF4742",
    getUrl: (role) => {
      const slug = role.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      return `https://remoteok.com/remote-${encodeURIComponent(slug)}-jobs`;
    },
  },
  {
    name: "Y Combinator (Work at a Startup)",
    category: "Top Tier Funded Startups",
    tagline: "Work directly at fast-growing YC-backed companies",
    color: "#FF6600",
    getUrl: () => `https://www.workatastartup.com/jobs`,
  },
];

export function matchJobsForCv(cvText = "", targetRole = "Full-Stack Developer") {
  const lower = cvText.toLowerCase();
  const archetypes = ROLE_ARCHETYPES[targetRole] || ROLE_ARCHETYPES["Full-Stack Developer"];

  // Determine detected skills
  const roleSkillMap = SKILL_MAP[targetRole] || SKILL_MAP["Full-Stack Developer"];
  const detectedSkills = [];
  Object.entries(roleSkillMap).forEach(([skill, keywords]) => {
    if (keywords.some((k) => lower.includes(k.toLowerCase()))) {
      detectedSkills.push(skill);
    }
  });

  const matchedRoles = archetypes.map((arch, idx) => {
    const hits = arch.keySkills.filter((s) => lower.includes(s.toLowerCase())).length;
    const baseMatch = Math.min(96, Math.round((hits / arch.keySkills.length) * 100) + (hits > 0 ? 30 : 15));
    const finalScore = Math.max(50, Math.min(98, baseMatch - (idx * 6)));

    return {
      id: `role-${idx}`,
      title: arch.title,
      seniority: arch.seniority,
      salary: arch.salary,
      salaryInr: arch.salaryInr,
      workStyle: arch.workStyle,
      matchScore: finalScore,
      matchedSkills: arch.keySkills.filter((s) => lower.includes(s.toLowerCase())),
      missingSkills: arch.keySkills.filter((s) => !lower.includes(s.toLowerCase())),
      hiringTypes: arch.hiringTypes,
      searchQueries: {
        linkedin: `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(arch.title)}`,
        wellfound: `https://wellfound.com/jobs?role=${encodeURIComponent(arch.title)}`,
        indeed: `https://www.indeed.com/jobs?q=${encodeURIComponent(arch.title)}`,
      },
    };
  });

  // Generate Personalized Recruiter Cold Outreach Pitch
  const topSkillStr = detectedSkills.slice(0, 3).join(", ") || targetRole;
  const outreachTemplate = `Hi [Hiring Manager / Recruiter Name],

I came across your open ${targetRole} opening at [Company Name] and wanted to reach out directly. 

With a background in ${topSkillStr || "this domain"}, I specialize in delivering reliable, high-impact results and driving measurable outcomes. I've spent significant time demonstrating hands-on competencies and optimizing execution quality.

Given your team's focus on [Specific Project or Initiative], I'd love to share my background and explore if my experience aligns with your team's goals.

Resume / Portfolio: [Your Link / Attachment]
LinkedIn: [Your Profile URL]

Thank you for your time,
[Your Name]`;

  const applicationSteps = [
    {
      step: "1. Tailor Your Resume for ATS",
      desc: "Ensure your top matched skills appear in your SUMMARY and WORK EXPERIENCE before uploading to portal ATS systems.",
    },
    {
      step: "2. Submit via Official Portal",
      desc: "Apply on LinkedIn or company career pages using the clean PDF exported from CareerMirror.",
    },
    {
      step: "3. Direct Recruiter DM (2-Point Outreach)",
      desc: "Find the recruiter or Hiring Manager on LinkedIn and send the 1-click cold outreach message above within 24 hours of applying.",
    },
    {
      step: "4. Optimal Follow-Up Timeline",
      desc: "If no response after 5 business days, send a polite 2-sentence follow-up sharing a relevant recent achievement.",
    },
  ];

  return {
    matchedRoles,
    outreachTemplate,
    applicationSteps,
    detectedSkills,
  };
}
