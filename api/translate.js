export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { overview, type } = req.body || {};
  if (!overview) return res.status(400).json({ error: 'No overview provided' });

  const typePrompts = {
    movie: `You are a movie editor. Read the movie overview and do the following:
1. Write exactly 1 complete English sentence (max 20 words) summarizing the core story. Must be fully complete.
2. Write exactly 1 complete Bengali sentence summarizing the same thing naturally. Must be fully complete.
Return in this exact format (nothing else):
EN: [english sentence]
BN: [bengali sentence]`,
    tv: `You are a TV editor. Read the series overview and do the following:
1. Write exactly 1 complete English sentence (max 20 words) summarizing the main plot. Must be fully complete.
2. Write exactly 1 complete Bengali sentence summarizing the same thing naturally. Must be fully complete.
Return in this exact format (nothing else):
EN: [english sentence]
BN: [bengali sentence]`,
    kdrama: `You are a drama editor. Read the K-Drama overview and do the following:
1. Write exactly 1 complete English sentence (max 20 words) capturing the romance. Must be fully complete.
2. Write exactly 1 complete Bengali sentence summarizing the same thing naturally. Must be fully complete.
Return in this exact format (nothing else):
EN: [english sentence]
BN: [bengali sentence]`,
    anime: `You are an anime editor. Read the anime overview and do the following:
1. Write exactly 1 complete English sentence (max 20 words) capturing the story. Must be fully complete.
2. Write exactly 1 complete Bengali sentence summarizing the same thing naturally. Must be fully complete.
Return in this exact format (nothing else):
EN: [english sentence]
BN: [bengali sentence]`
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
    const raw = data.choices?.[0]?.message?.content?.trim() || '';
    
    // Parse EN and BN lines
    const enMatch = raw.match(/EN:\s*(.+)/);
    const bnMatch = raw.match(/BN:\s*(.+)/);
    const en = enMatch ? enMatch[1].trim() : '';
    const bn = bnMatch ? bnMatch[1].trim() : '';
    
    if (en || bn) {
      return res.status(200).json({ result: `📖 ${en}\n🔤 ${bn}` });
    }
    return res.status(500).json({ error: 'Empty response' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
