export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured in Vercel' });
  }

  const { topic } = req.body || {};
  const promptTopic = topic ? `ವಿಷಯ: ${topic}` : `ಕರ್ನಾಟಕ ಹಾಗೂ ಭಾರತದ ಇಂದಿನ ಪ್ರಮುಖ ರಾಜಕೀಯ ಮತ್ತು ಸಾಮಾಜಿಕ ವಿದ್ಯಮಾನಗಳು`;

  const promptText = `
ನೀವು ಕನ್ನಡದ ರಾಜಕೀಯ ಮತ್ತು ಸಾಮಾಜಿಕ ವಿಷಯಗಳ ತಜ್ಞ ಕ್ರಿಯೇಟರ್.
ಈ ವಿಷಯಕ್ಕೆ ಸಂಬಂಧಿಸಿದಂತೆ ಅತ್ಯುತ್ತಮ ಕನ್ನಡದಲ್ಲಿ ಕಂಟೆಂಟ್ ನೀಡಿ: "${promptTopic}"

ಕಡ್ಡಾಯವಾಗಿ ಈ ಕೆಳಗಿನ JSON ರಚನೆಯಲ್ಲಿ ಮಾತ್ರ ಉತ್ತರ ನೀಡಿ (ಯಾವುದೇ extra text ಅಥವಾ markdown \`\`\`json ಹಾಕಬೇಡಿ):
{
  "topNews": [
    { "title": "ಮುಖ್ಯಾಂಶ ಶೀರ್ಷಿಕೆ 1", "summary": "ವಿವರವಾದ ಸಾರಾಂಶ 1" },
    { "title": "ಮುಖ್ಯಾಂಶ ಶೀರ್ಷಿಕೆ 2", "summary": "ವಿವರವಾದ ಸಾರಾಂಶ 2" }
  ],
  "trending": [
    { "text": "ಟ್ರೆಂಡಿಂಗ್ ವಿಷಯ 1" },
    { "text": "ಟ್ರೆಂಡಿಂಗ್ ವಿಷಯ 2" }
  ],
  "catchyLines": [
    { "text": "ಕ್ಯಾಚಿ ಸಾಲು 1" },
    { "text": "ಕ್ಯಾಚಿ ಸಾಲು 2" }
  ],
  "majorPosts": [
    { "text": "ಪೊಲಿಟಿಕಲ್ ಪೋಸ್ಟ್ ವಿವರ 1" },
    { "text": "ಪೊಲಿಟಿಕಲ್ ಪೋಸ್ಟ್ ವಿವರ 2" }
  ]
}
`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }],
        generationConfig: {
          response_mime_type: "application/json"
        }
      })
    });

    const data = await response.json();

    if (!response.ok || !data.candidates || !data.candidates[0]) {
      console.error('Gemini API Error details:', data);
      return res.status(500).json({ error: 'Gemini API Error', details: data });
    }

    const rawOutput = data.candidates[0].content.parts[0].text;
    const jsonOutput = JSON.parse(rawOutput);

    return res.status(200).json(jsonOutput);

  } catch (err) {
    console.error('Backend Catch Error:', err);
    return res.status(500).json({ error: 'Failed to process AI request', message: err.message });
  }
}
