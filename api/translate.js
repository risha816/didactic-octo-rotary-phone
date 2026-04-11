export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { overview } = req.body || {};
  if (!overview) return res.status(400).json({ error: 'No overview provided' });

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        max_tokens: 80,
        messages: [{
          role: 'user',
          content: `Translate this movie overview into Bengali in exactly 1 short sentence (max 15 words). Only return the Bengali sentence, nothing else:\n\n"${overview}"`
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
