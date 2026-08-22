module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { topic } = req.body || {};
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Gemini API Key missing in Environment Variables" });
  }

  const promptText = topic 
    ? `ನೀವು ರಾಜಕೀಯ ವಿಶ್ಲೇಷಕ ಮತ್ತು ಕಂಟೆಂಟ್ ಕ್ರಿಯೇಟರ್. ವಿಷಯ: "${topic}". ಇದಕ್ಕೆ ಸಂಬಂಧಿಸಿದಂತೆ ಕರ್ನಾಟಕ ಮತ್ತು ರಾಷ್ಟ್ರಮಟ್ಟದ ಪ್ರಮುಖ ವಿಷಯಗಳು, ಟ್ರೆಂಡಿಂಗ್ ಮುಖ್ಯಾಂಶಗಳು, ಸೋಷಿಯಲ್ ಮೀಡಿಯಾ ಕ್ಯಾಚಿ ಲೈನ್ಸ್ (Catchy Lines) ಮತ್ತು ಮೇಜರ್ ಪೊಲಿಟಿಕಲ್ ಪೋಸ್ಟ್ ಸ್ಕ್ರಿಪ್ಟ್‌ಗಳನ್ನು JSON ಫಾರ್ಮ್ಯಾಟ್‌ನಲ್ಲಿ ನೀಡಿ.`
    : `ನೀವು ಕರ್ನಾಟಕ ಮತ್ತು ಭಾರತದ ಪ್ರಮುಖ ರಾಜಕೀಯ ವಿಶ್ಲೇಷಕ. ಇಂದಿನ ತಾಜಾ ಕರ್ನಾಟಕ ಮತ್ತು ರಾಷ್ಟ್ರಮಟ್ಟದ ಮಹತ್ವದ ರಾಜಕೀಯ ಬೆಳವಣಿಗೆಗಳು, ಟ್ರೆಂಡಿಂಗ್ ವಿಷಯಗಳು, ಸೋಷಿಯಲ್ ಮೀಡಿಯಾ ಕ್ಯಾಚಿ ಲೈನ್ಸ್‌ಗಳು (Catchy Lines) ಮತ್ತು ಮೇಜರ್ ಪೊಲಿಟಿಕಲ್ ಪೋಸ್ಟ್ ಸ್ಕ್ರಿಪ್ಟ್‌ಗಳನ್ನು ಕನ್ನಡದಲ್ಲಿ ನೀಡಿ.`;

  const requestBody = {
    contents: [{
      parts: [{
        text: `${promptText}
ದಯವಿಟ್ಟು ಉತ್ತರವನ್ನು ಕಟ್ಟುನಿಟ್ಟಾಗಿ ಕೆಳಗಿನ ಮಾದರಿಯ JSON ರೂಪದಲ್ಲಿ ಮಾತ್ರ ನೀಡಿ (ಯಾವುದೇ extra markdown/backticks ಇಲ್ಲದೆ ಕೇವಲ valid JSON):
{
  "topNews": [
    {"title": "ಶೀರ್ಷಿಕೆ 1", "summary": "ಸಾರಾಂಶ 1"},
    {"title": "ಶೀರ್ಷಿಕೆ 2", "summary": "ಸಾರಾಂಶ 2"},
    {"title": "ಶೀರ್ಷಿಕೆ 3", "summary": "ಸಾರಾಂಶ 3"}
  ],
  "trending": [
    {"text": "ಟ್ರೆಂಡಿಂಗ್ ವಿಷಯ 1"},
    {"text": "ಟ್ರೆಂಡಿಂಗ್ ವಿಷಯ 2"},
    {"text": "ಟ್ರೆಂಡಿಂಗ್ ವಿಷಯ 3"}
  ],
  "catchyLines": [
    {"text": "ಕ್ಯಾಚಿ ಲೈನ್ 1"},
    {"text": "ಕ್ಯಾಚಿ ಲೈನ್ 2"},
    {"text": "ಕ್ಯಾಚಿ ಲೈನ್ 3"}
  ],
  "majorPosts": [
    {"text": "ಮೇಜರ್ ಪೊಲಿಟಿಕಲ್ ಪೋಸ್ಟ್ ವಿವರ 1"},
    {"text": "ಮೇಜರ್ ಪೊಲಿಟಿಕಲ್ ಪೋಸ್ಟ್ ವಿವರ 2"}
  ]
}`
      }]
    }]
  };

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    let textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    
    // Clean JSON markdown if present
    textResponse = textResponse.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsedData = JSON.parse(textResponse);
    return res.status(200).json(parsedData);
  } catch (error) {
    console.error("AI Generation Error:", error);
    return res.status(500).json({ error: "Failed to generate AI content" });
  }
};
