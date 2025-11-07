function normalize(str) {
  return (str || '')
    .toLowerCase()
    .replace(/[^a-z0-9+.#\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Extract candidate "skills" from text via a curated token list pulled from JD
function extractSkillsFromJD(jd) {
  const base = [
    'python','java','javascript','typescript','node','react','angular','vue','spring','django','flask','fastapi',
    'aws','azure','gcp','docker','kubernetes','terraform','linux','git','github','gitlab','ci','cd',
    'ml','machine learning','deep learning','nlp','pandas','numpy','scikit','pytorch','tensorflow',
    'sql','mysql','postgres','mongodb','redis','graphql','rest','api',
    'html','css','tailwind','nextjs','vercel',
    'leadership','communication','team','agile','scrum','jira','kanban',
    'excel','power bi','tableau',
  ];

  const all = new Set(base);
  const tokens = normalize(jd).split(' ');
  // Add n-grams of up to 3 for multi-word skills found in JD
  for (let i=0;i<tokens.length;i++){
    const one = tokens[i];
    if (one.length>2) all.add(one);
    const two = (tokens[i] + ' ' + (tokens[i+1]||'')).trim();
    const three = (tokens[i] + ' ' + (tokens[i+1]||'') + ' ' + (tokens[i+2]||'')).trim();
    if (two.split(' ').length===2) all.add(two);
    if (three.split(' ').length===3) all.add(three);
  }
  // Keep tokens that look like skills (contain letters/digits or symbols like +/# and are not common stopwords)
  const stop = new Set(['the','and','or','a','an','to','of','in','on','for','with','as','by','is','are','be','this','that','will','you','we','our']);
  const skills = Array.from(all).filter(s => /[a-z0-9]/.test(s) && !stop.has(s) && s.length>=3);
  // Deduplicate close variants by trimming extra spaces
  return Array.from(new Set(skills.map(s=>s.trim()))).slice(0,120);
}

function tokenize(text) {
  return normalize(text).split(' ').filter(Boolean);
}

function frequency(tokens) {
  const map = new Map();
  for (const t of tokens) map.set(t, (map.get(t)||0)+1);
  return map;
}

function topSentences(text, skills, k=5) {
  const sentences = text.split(/[\.!?\n]+/).map(s=>s.trim()).filter(Boolean);
  const sk = new Set(skills.map(s=>s.toLowerCase()));
  const scored = sentences.map(s=>{
    const toks = tokenize(s);
    const hits = toks.filter(t=>sk.has(t)).length;
    return { s, hits, len: toks.length };
  }).filter(x=>x.len>3);
  scored.sort((a,b)=> (b.hits/(b.len**0.5)) - (a.hits/(a.len**0.5)));
  return scored.slice(0,k).map(x=>x.s);
}

export function scoreResume(resumeText, jdText) {
  const skills = extractSkillsFromJD(jdText).map(s=>s.toLowerCase());
  const rTokens = tokenize(resumeText);
  const rFreq = frequency(rTokens);
  const matched = [];
  const missing = [];
  for (const s of skills) {
    // consider a match if the token or its simplified variant appears
    const key = s.replace(/\s+/g,' ');
    if (rFreq.has(key)) matched.push(s);
    else missing.push(s);
  }
  const uniqMatched = Array.from(new Set(matched));
  // Score: weighted by coverage and frequency
  const coverage = uniqMatched.length / Math.max(skills.length, 1);
  let freqBoost = 0;
  for (const m of uniqMatched) freqBoost += Math.min(2, rFreq.get(m) || 0);
  const freqNorm = Math.min(1, freqBoost / (skills.length || 1));
  const raw = (0.85*coverage + 0.15*freqNorm) * 100;

  return {
    score: Math.max(0, Math.min(100, raw)),
    matched: uniqMatched.slice(0, 40),
    missing: missing.filter(s=>!uniqMatched.includes(s)).slice(0, 40),
    tokens: skills.length,
    resumeWords: rTokens.length,
    topSummary: topSentences(resumeText, uniqMatched, 5),
  };
}
