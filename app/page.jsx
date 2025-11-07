'use client';
import { useState } from 'react';

export default function Home() {
  const [jd, setJd] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) { setError('Please upload a PDF resume.'); return; }
    setError(null);
    setLoading(true);
    setResult(null);
    try {
      const fd = new FormData();
      fd.append('resume', file);
      fd.append('jd', jd);
      const res = await fetch('/api/score', { method: 'POST', body: fd });
      if (!res.ok) throw new Error('Server error');
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <div className="card">
        <h1>Resume Screening (Vercel)</h1>
        <p className="sub">Upload a PDF resume and paste a Job Description. We'll parse the PDF and score skill match locally—no paid APIs.</p>
        <form onSubmit={handleSubmit}>
          <label>Job Description</label>
          <textarea rows={8} placeholder="Paste JD here..." value={jd} onChange={e=>setJd(e.target.value)} />
          <label>Resume PDF</label>
          <input type="file" accept="application/pdf" onChange={e=>setFile(e.target.files?.[0] || null)} />
          <button disabled={loading}>{loading ? 'Scoring…' : 'Screen Resume'}</button>
        </form>

        {error && <div className="result"><strong>Error:</strong> {error}</div>}
        {result && (
          <div className="result">
            <div className="flex">
              <div className="col">
                <h3 style={{marginTop:0}}>Overall Score</h3>
                <p style={{fontSize:28, fontWeight:800}}>{Math.round(result.score)} / 100</p>
                <div>Tokens considered: <kbd>{result.tokens}</kbd></div>
                <div>Words in resume: <kbd>{result.resumeWords}</kbd></div>
              </div>
              <div className="col">
                <h3 style={{marginTop:0}}>Matched Skills</h3>
                <div>{result.matched.map((s, i)=>(<span key={i} className="badge">{s}</span>))}</div>
                <h3>Missing Skills</h3>
                <div>{result.missing.map((s, i)=>(<span key={i} className="badge" style={{opacity:.7}}>{s}</span>))}</div>
              </div>
            </div>
            {result.topSummary?.length ? (<>
              <hr/>
              <h3 style={{marginTop:0}}>Top Resume Highlights (auto‑extracted)</h3>
              <ul>
                {result.topSummary.map((t,i)=>(<li key={i}>{t}</li>))}
              </ul>
            </>) : null}
          </div>
        )}
      </div>
      <footer>Tip: Deploy to Vercel → Import from GitHub → Build. No env vars needed.</footer>
    </div>
  );
}
