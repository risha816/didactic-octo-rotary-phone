export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { overview, type } = req.body || {};
  if (!overview) return res.status(400).json({ error: 'No overview provided' });

  const typePrompts = {
    movie: `তুমি একজন অভিজ্ঞ বাংলা চলচ্চিত্র সমালোচক। নিচের movie টির ইংরেজি বিবরণ পড়ে বাংলায় ২টি পূর্ণ বাক্যে গল্পের মূল বিষয়টি সুন্দরভাবে তুলে ধরো। বাক্যগুলো যেন স্বাভাবিক, আকর্ষণীয় এবং দর্শকের মনে কৌতূহল জাগায়। শুধু ২টি বাংলা বাক্য দাও:`,
    tv: `তুমি একজন অভিজ্ঞ বাংলা বিনোদন লেখক। নিচের web series টির ইংরেজি বিবরণ পড়ে বাংলায় ২টি পূর্ণ বাক্যে series টির মূল গল্প ও আকর্ষণ তুলে ধরো। বাক্যগুলো যেন দর্শককে দেখতে আগ্রহী করে। শুধু ২টি বাংলা বাক্য দাও:`,
    kdrama: `তুমি একজন অভিজ্ঞ বাংলা বিনোদন লেখক। নিচের K-Drama টির ইংরেজি বিবরণ পড়ে বাংলায় ২টি পূর্ণ বাক্যে নাটকের মূল গল্প ও আবেগ তুলে ধরো। বাক্যগুলো যেন romantic ও আকর্ষণীয় হয়। শুধু ২টি বাংলা বাক্য দাও:`,
    anime: `তুমি একজন অভিজ্ঞ বাংলা anime বিশেষজ্ঞ। নিচের anime টির ইংরেজি বিবরণ পড়ে বাংলায় ২টি পূর্ণ বাক্যে anime টির মূল গল্প ও রোমাঞ্চ তুলে ধরো। বাক্যগুলো যেন exciting ও আগ্রহ জাগানো হয়। শুধু ২টি বাংলা বাক্য দাও:`
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
        max_tokens: 200,
        temperature: 0.7,
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
