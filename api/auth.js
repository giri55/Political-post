export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // ಬಾಡಿ ಡೇಟಾವನ್ನು JSON ಅಥವಾ String ಎರಡೂ ರೀತಿಯಲ್ಲೂ ಸರಿಯಾಗಿ ಓದಲು
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (e) {
      // parse error
    }
  }

  const enteredPassword = body && body.password ? String(body.password).trim() : '';
  const secretPassword = process.env.ADMIN_PASSWORD ? String(process.env.ADMIN_PASSWORD).trim() : '';

  if (secretPassword && enteredPassword === secretPassword) {
    return res.status(200).json({ success: true });
  } else {
    return res.status(401).json({ success: false, message: 'Invalid Password' });
  }
}
