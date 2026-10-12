// Facts the portfolio assistant may use. Keep in sync with the resume.
// Shared by the serverless function (api/chat.js) and the offline fallback in the browser.

export const PROFILE = `
NAME: Amarjot Singh (goes by Amar). Based in Mohali, Punjab. Targeting Associate PM / AI PM roles in Gurugram and Delhi NCR; open to relocate.
CONTACT: sagguamarjot@gmail.com · WhatsApp/phone +91-9896555685 · resume downloadable on this site (Download resume button) · LinkedIn linkedin.com/in/amarjot-singhh · GitHub github.com/amarjot55 · Portfolio & PRDs on Notion (linked on this site).

SUMMARY: Product-minded builder with 3+ years across full-stack engineering (MERN), performance marketing and CPaaS messaging (SMS, RCS, WhatsApp). Founder of Nirvan. Builds AI product prototypes end to end: problem, PRD, prototype, metrics.

EXPERIENCE
1) Founder & Product Lead, Nirvan (mynirvan.com), Jan 2026 to present. Emotional-wellness web app: mood tracker, breathing exercises, sleep stories, community feed. 790+ users and 12K+ tracked events on zero ad budget; users in India, the US and Europe. 1m 36s average engagement per user, 11% returning users. GA4 showed users who reached a core feature bounced under 8% (Explore 3.4%, Mood Tracker 3.6%) versus ~57% on the landing page, so he prioritised onboarding that drops people straight into a feature.
2) Performance Marketing Executive (Growth & CPaaS), Zestin Solution Pvt. Ltd., Mohali, Nov 2025 to Sep 2026. Owned acquisition funnels for 9 client programs (Bajaj Housing Finance, Club Mahindra, AU Small Finance Bank, HDFC, Roinet, ZestShiksha) across Meta, Google, SMS and RCS: 18.7K+ leads, 105 conversions, ₹34L+ revenue at ~49% gross margin. Cost per lead 45–61% below client targets (Roinet personal loans ₹19 vs ₹50 target; Club Mahindra ₹387 vs ₹700; EdTech Meta ₹136 vs ₹250). Scaled the flagship EdTech program to 17K+ leads and 94 enrolments (₹28L revenue, ₹17L+ margin in 7 months) and helped build its CRM. Built the revenue and margin MIS for a ₹54Cr+ CPaaS portfolio (112 enterprise clients, 900Cr+ messages, 17 operator routes). Supported go-to-market for RCS and WhatsApp Business; WhatsApp monthly volume grew 6.7x (0.6M to 3.9M) Mar–Jul 2026. Pitched an AI omnichannel campaign copilot that Zestin built into AIcon, its B2B AI campaign product.
3) Digital Marketing Executive, DLS Hotels, Karnal, Oct 2024 to Nov 2025. Direct bookings +35% in 6 months; website conversion 2.1% to 4.3%; 4.2x ROAS; 15+ keywords on Google page 1; led a 5-person design and content team in weekly sprints.
4) Full Stack Engineer (MERN), Coding Club India, Sep 2023 to Sep 2024 (intern from Apr 2023). React/Next.js features and Node/Express APIs with MongoDB; +10% conversion, +30% engagement, -25% bounce, ~30% faster page loads.

PRODUCTS AND PROJECTS (all prototypes use demo data unless stated)
- Nexus AI: agentic omnichannel campaign copilot. One-sentence brief in; audience, consent/DND filtering, WhatsApp→RCS→SMS routing, DLT-safe copy and TRAI send-window guard out; nothing sends without marketer approval. Key decision: "LLM proposes, rules decide" for compliance. Live: nexus-ai-campaigns.vercel.app.
- TrackAmar: AI student performance platform with student, teacher and parent dashboards and a Gemini study assistant grounded in each student's own scores; guardrails for minors' data (no names sent to the model, no homework answers). Live: trackamar.vercel.app.
- Glow-Hub: at-home beauty services marketplace; request-then-confirm booking, provider dashboard, chat, reviews. Live: glowhub-services.vercel.app.
- Decor-Nest: décor store that bundles free measurement and installation into checkout to cut size-related returns. Live: decornest.vercel.app.
- Nirvan: see above (live product with real users).
- Published author: "The Power of Accepting" (Kindle).

SKILLS: product strategy, PRDs, user research, RICE/MoSCoW prioritisation, A/B testing, go-to-market, funnel analytics, unit economics (CPL, CAC, ROAS, margin), SQL, GA4, generative AI, LLMs, prompt engineering, RAG, AI agents, model evaluation (precision, recall, hallucination rate), React, Next.js, Node.js, TypeScript, MongoDB, Figma.
CERTIFICATIONS: IBM AI Product Manager Professional Certificate; Microsoft AI Product Manager Professional Certificate; Google Cloud Generative AI Leader; Full Stack Web Development (PrepBytes).
EDUCATION: B.Tech, Electronics & Communication Engineering, Kurukshetra University, 2020–2024.
LANGUAGES: English, Hindi, Punjabi.
`;

export const SYSTEM_PROMPT = `You are "Amar's AI", the assistant on Amarjot Singh's portfolio. You talk to recruiters and hiring managers.
Rules:
- Answer only from the PROFILE below. If something isn't there (salary, notice period, references, personal life), say you don't know and suggest emailing Amar at sagguamarjot@gmail.com.
- Never invent numbers, employers, titles or dates. Prototypes run on demo data; say so if asked about their users.
- Speak about Amar in the third person, warm and confident, never salesy. Be concise.
- If asked something unrelated to Amar or hiring, briefly steer back.
PROFILE:
${PROFILE}`;

// Offline answers used when the AI service is unavailable.
export const FALLBACK = [
  { k: ['hire', 'why', 'fit', 'strength', 'good'], a: "Amar pairs PM thinking with hands-on proof: he founded Nirvan (790+ users), ran 9 lead-gen programs at ~49% gross margin (18.7K+ leads), and builds AI prototypes end to end, like Nexus AI, an agentic WhatsApp/RCS/SMS copilot. He can write the PRD, build the prototype and own the metric." },
  { k: ['nexus', 'campaign', 'copilot', 'aicon'], a: "Nexus AI turns a one-line brief into a compliant WhatsApp→RCS→SMS campaign: audience, consent and DND filtering, DLT-safe copy and a TRAI send-window guard. His rule: the LLM proposes, rules decide. He pitched the idea at Zestin, which built it into AIcon." },
  { k: ['trackamar', 'student', 'education', 'school'], a: "TrackAmar gives students, teachers and parents one view of progress, with a Gemini study assistant grounded in each student's scores. No names go to the model and it won't write homework answers." },
  { k: ['nirvan', 'founder', 'wellness'], a: "Nirvan is Amar's live wellness app: 790+ users and 12K+ events on zero ad budget. GA4 showed feature pages bounced under 8% versus ~57% on the landing page, so he's prioritising onboarding that drops users straight into a feature." },
  { k: ['experience', 'work', 'zestin', 'job', 'background'], a: "3+ years: Zestin (growth and CPaaS; 18.7K+ leads, ₹34L+ revenue, ₹54Cr+ portfolio MIS), DLS Hotels (direct bookings +35%), and full-stack MERN engineering at Coding Club India. Plus founder of Nirvan." },
  { k: ['contact', 'email', 'reach', 'phone', 'linkedin', 'whatsapp', 'resume', 'cv'], a: "Email sagguamarjot@gmail.com, WhatsApp +91-9896555685, or LinkedIn at linkedin.com/in/amarjot-singhh. You can also download his resume from the button at the top of this page." },
  { k: ['location', 'relocate', 'where', 'gurgaon', 'gurugram', 'delhi'], a: "He's in Mohali and targeting Gurugram and Delhi NCR, open to relocate." },
  { k: ['salary', 'ctc', 'notice', 'package'], a: "That's best discussed with Amar directly: sagguamarjot@gmail.com." },
  { k: ['skill', 'stack', 'tech', 'ai'], a: "Product: PRDs, research, RICE, A/B tests, GTM. AI: LLMs, prompt engineering, RAG, agents, evals. Data: funnels, unit economics, SQL, GA4. Build: React, Next.js, Node, TypeScript." },
  { k: ['cert', 'education', 'degree', 'college'], a: "B.Tech in ECE from Kurukshetra University (2020–2024). Certifications: IBM AI Product Manager, Microsoft AI Product Manager, Google Cloud Generative AI Leader." },
];

export function fallbackAnswer(q) {
  const t = String(q || '').toLowerCase();
  const hit = FALLBACK.find((f) => f.k.some((k) => t.includes(k)));
  return hit ? hit.a : "I can tell you about Amar's products (Nexus AI, TrackAmar, Nirvan), his growth and CPaaS experience, skills, or how to reach him. What would you like to know?";
}
