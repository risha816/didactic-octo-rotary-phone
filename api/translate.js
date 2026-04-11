export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { overview, type } = req.body || {};
  if (!overview) return res.status(400).json({ error: 'No overview provided' });

  const typePrompts = {
    movie: `You are a movie editor. Shorten the following movie overview into exactly 2 complete, engaging English sentences that capture the core story. Do not add anything new — only summarize what's given. Each sentence must be fully complete. Return only the 2 sentences:`,
    tv: `You are a TV editor. Shorten the following series overview into exactly 2 complete, engaging English sentences that capture the main plot. Do not add anything new — only summarize what's given. Each sentence must be fully complete. Return only the 2 sentences:`,
    kdrama: `You are a drama editor. Shorten the following K-Drama overview into exactly 2 complete, engaging English sentences capturing the romance and emotion. Do not add anything new — only summarize what's given. Return only the 2 sentences:`,
    anime: `You are an anime editor. Shorten the following anime overview into exactly 2 complete, engaging English sentences capturing the story and action. Do not add anything new — only summarize what's given. Return only the 2 sentences:`
  };

  const prompt = typePrompts[type] || typePrompts.movie;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 250,
        temperature: 0.5,
        messages: [{
          role: 'user',
          content: `${prompt}\n\n"${overview}"`
        }]
      })
    });

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content?.trim() || '';
    if (text) return res.status(200).json({ result: text });
    return res.status(500).json({ error: 'Empty response' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
