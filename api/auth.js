module.exports = (req, res) => {
  // ಕೇವಲ POST ರಿಕ್ವೆಸ್ಟ್‌ಗೆ ಮಾತ್ರ ಅವಕಾಶ
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (e) {
      body = {};
    }
  }

  const enteredPassword = body && body.password ? String(body.password).trim() : '';
  const serverPassword = process.env.ADMIN_PASSWORD ? String(process.env.ADMIN_PASSWORD).trim() : '';

  // ಪಾಸ್‌ವರ್ಡ್ ಮ್ಯಾಚ್ ಆದರೆ ಯಶಸ್ವಿ ಲಾಗಿನ್
  if (serverPassword && enteredPassword === serverPassword) {
    return res.status(200).json({ success: true });
  } else {
    return res.status(401).json({ success: false, message: 'Invalid Password' });
  }
};
