export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is missing in Vercel environment' });
  }

  const { topic } = req.body;
  const promptTopic = topic ? `ವಿಷಯ: ${topic}` : `ಕರ್ನಾಟಕ ಹಾಗೂ ಭಾರತದ ಇಂದಿನ ಪ್ರಮುಖ ರಾಜಕೀಯ ಮತ್ತು ಸಾಮಾಜಿಕ ವಿದ್ಯಮಾನಗಳು`;

  const systemPrompt = `
ನೀವು ಕನ್ನಡದ ರಾಜಕೀಯ ಮತ್ತು ಸಾಮಾಜಿಕ ವಿಷಯಗಳ ತಜ್ಞ ಕ್ರಿಯೇಟರ್.
ಈ ಕೆಳಗಿನ ವಿಷಯದ ಮೇಲೆ ನಿಖರವಾದ ಕನ್ನಡದಲ್ಲಿ ಕಂಟೆಂಟ್ ರಚಿಸಿ:
"${promptTopic}"

ದಯವಿಟ್ಟು ಕೆಳಗಿನ JSON ಮಾದರಿಯಲ್ಲೇ ಮಾತ್ರ ಉತ್ತರ ನೀಡಿ. ಯಾವುದೇ ಹೆಚ್ಚುವರಿ ವಿವರಣೆ, Markdown ಅಥವಾ Backticks (\`\`\`json) ಹಾಕಬೇಡಿ:
{
  "topNews": [
    { "title": "ಶೀರ್ಷಿಕೆ 1", "summary": "ಸಾರಾಂಶ 1" },
    { "title": "ಶೀರ್ಷಿಕೆ 2", "summary": "ಸಾರಾಂಶ 2" }
  ],
  "trending": [
    { "text": "ಟ್ರೆಂಡಿಂಗ್ ಸಾಲು 1" },
    { "text": "ಟ್ರೆಂಡಿಂಗ್ ಸಾಲು 2" }
  ],
  "catchyLines": [
    { "text": "ಕ್ಯಾಚಿ ಸಾಲು 1" },
    { "text": "ಕ್ಯಾಚಿ ಸಾಲು 2" }
  ],
  "majorPosts": [
    { "text": "ಪೊಲಿಟಿಕಲ್ ಪೋಸ್ಟ್ ವಿಷಯ 1" },
    { "text": "ಪೊಲಿಟಿಕಲ್ ಪೋಸ್ಟ್ ವಿಷಯ 2" }
  ]
}
`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt }] }]
      })
    });

    const data = await response.json();
    if (!response.ok || !data.candidates || !data.candidates[0]) {
      console.error('Gemini API Error:', data);
      return res.status(500).json({ error: 'Gemini API call failed', details: data });
    }

    let rawText = data.candidates[0].content.parts[0].text.trim();
    
    // Clean markdown code blocks if Gemini returns them
    rawText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();

    const parsedJson = JSON.parse(rawText);
    return res.status(200).json(parsedJson);

  } catch (err) {
    console.error('Generation Error:', err);
    return res.status(500).json({ error: 'Failed to parse AI content', message: err.message });
  }
}
