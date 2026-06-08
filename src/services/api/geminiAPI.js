/**
 * CareerOS GCC — AI Service
 * Primary: Google Gemini (free tier)
 * Fallback: Groq (free tier, very fast)
 * Model names updated for 2026 API versions
 */

const CACHE_PREFIX = 'careeros_ai_';
const CACHE_TTL    = 24 * 60 * 60 * 1000; // 24 hours

function getGeminiKey() { return localStorage.getItem('careeros_gemini_key') || ''; }
function getGroqKey()   { return localStorage.getItem('careeros_groq_key')   || ''; }
function getAIProvider(){ return localStorage.getItem('careeros_ai_provider') || 'gemini'; }

function cacheGet(hash) {
  try {
    var raw = localStorage.getItem(CACHE_PREFIX + hash);
    if (!raw) return null;
    var obj = JSON.parse(raw);
    if (Date.now() - obj.ts > CACHE_TTL) return null;
    return obj.text;
  } catch { return null; }
}

function cacheSet(hash, text) {
  try { localStorage.setItem(CACHE_PREFIX + hash, JSON.stringify({ text, ts: Date.now() })); } catch {}
}

function hashStr(str) {
  var h = 0;
  for (var i = 0; i < str.length; i++) {
    h = Math.imul(31, h) + str.charCodeAt(i) | 0;
  }
  return Math.abs(h).toString(36);
}

/* ── Gemini ─────────────────────────────────────── */
async function callGemini(prompt) {
  const key = getGeminiKey();
  if (!key) return null; // Fall through to next provider

  // Try models in order — 2.0-flash is the current free model as of 2026
  const MODELS = [
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-1.5-flash-latest',
    'gemini-1.5-flash',
  ];

  for (const model of MODELS) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 1024, temperature: 0.7 },
          }),
        }
      );
      const data = await res.json();
      if (data.error) {
        if (data.error.code === 404) continue; // Try next model
        return `AI error: ${data.error.message}`;
      }
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      if (text) return text;
    } catch { continue; }
  }
  return null; // All models failed, try fallback
}

/* ── Groq (free, very fast, no card needed) ──────── */
async function callGroq(prompt) {
  const key = getGroqKey();
  if (!key) return null;

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });
    const data = await res.json();
    return data.choices?.[0]?.message?.content || null;
  } catch { return null; }
}

/* ── Master call function ────────────────────────── */
async function callAI(prompt) {
  const hash   = hashStr(prompt.slice(0, 300));
  const cached = cacheGet(hash);
  if (cached) return cached;

  const provider = getAIProvider();
  let result = null;

  if (provider === 'groq') {
    result = await callGroq(prompt);
    if (!result) result = await callGemini(prompt);
  } else {
    result = await callGemini(prompt);
    if (!result) result = await callGroq(prompt);
  }

  if (!result) {
    return 'No AI key configured. Go to ⚙️ Settings and add your free Gemini or Groq API key.';
  }

  cacheSet(hash, result);
  return result;
}

/* ── Named functions ─────────────────────────────── */

export async function generateCoverLetter({ jobTitle, company, cvKeywords, tone = 'professional' }) {
  return callAI(`Write a compelling cover letter for a ${jobTitle} position at ${company} in UAE/GCC.
Key skills: ${(cvKeywords || []).join(', ')}.
Tone: ${tone}. 3 short paragraphs. No "Dear Hiring Manager". Start with a strong hook. End with confidence.`);
}

export async function analyseGap({ jobDescription, cvKeywords }) {
  return callAI(`Analyse CV vs job description for a GCC role.
CV keywords: ${(cvKeywords || []).join(', ')}
Job description: ${(jobDescription || '').slice(0, 800)}

Reply in this exact format:
MATCH_SCORE: [0-100]
STRENGTHS: [comma list]
GAPS: [comma list]
ADVICE: [2 sentences]`);
}

export async function reviewCV(cvText) {
  return callAI(`You are a senior GCC recruitment expert. Review this CV and give actionable feedback.

CV:
${cvText.slice(0, 2000)}

Provide:
1. Overall score (0-100) and why
2. Top 3 strengths
3. Top 3 improvements needed
4. ATS optimisation tips for UAE/GCC job boards
5. Rewrite the professional summary section
Format clearly with headings.`);
}

export async function generateInterviewQuestions({ jobTitle, company, industry }) {
  return callAI(`Generate 8 likely interview questions for a ${jobTitle} role at ${company || 'a company'} in ${industry || 'GCC'}.
Mix: behavioural, situational, technical, and one GCC/UAE-specific question.
Number each question. Be specific and realistic.`);
}

export async function generateFollowUp({ jobTitle, company, daysSince, stage }) {
  return callAI(`Write a professional follow-up message for a ${jobTitle} application at ${company}.
Status: ${stage || 'applied'} ${daysSince} days ago, no response.
GCC professional norms. Polite, confident. 3 sentences max. Ready to send.`);
}

export async function answerCareerQuestion(question, userContext) {
  return callAI(`You are CareerOS, a career advisor specialising in UAE/GCC job market.
${userContext ? 'User: ' + userContext : ''}

Question: ${question}

Give practical, specific, GCC-aware advice. 2-4 sentences. Bullet points if listing items.`);
}

export async function buildCVFromAnswers(answers) {
  return callAI(`Transform these answers into a professional UAE/GCC CV.
Answers: ${JSON.stringify(answers)}

Return ONLY valid JSON (no markdown):
{"summary":"...","experience":[{"role":"...","company":"...","period":"...","bullets":["..."]}],"skills":["..."]}`);
}

export { callAI };
