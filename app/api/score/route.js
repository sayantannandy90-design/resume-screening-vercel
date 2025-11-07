import pdf from 'pdf-parse';
import { scoreResume } from '@/lib/score';

export const runtime = 'nodejs'; // needed for pdf-parse
export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const form = await req.formData();
    const file = form.get('resume');
    const jd = String(form.get('jd') || '');

    if (!file || file.type !== 'application/pdf') {
      return new Response(JSON.stringify({ error: 'Please upload a PDF file.' }), { status: 400 });
    }

    const buf = Buffer.from(await file.arrayBuffer());
    const data = await pdf(buf);
    const text = data.text || '';

    const scored = scoreResume(text, jd);
    return Response.json(scored);
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: 'Failed to process PDF. Ensure it is a valid resume PDF.' }), { status: 500 });
  }
}
