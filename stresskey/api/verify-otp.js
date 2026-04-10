// api/verify-otp.js
// Vercel Serverless Function — verifies OTP entered by user

// NOTE: Because Vercel functions are stateless, we use a simple
// shared module pattern. For high traffic, replace otpStore
// with an external store like Upstash Redis (free tier available).

const sendOtpModule = require('./send-otp');
const otpStore = sendOtpModule.otpStore;

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { mobile, otp } = req.body;

  if (!mobile || !otp) {
    return res.status(400).json({ error: 'Mobile and OTP are required.' });
  }

  const record = otpStore[mobile];

  if (!record) {
    return res.status(400).json({ error: 'OTP not found. Please request a new one.' });
  }

  // Check expiry
  if (Date.now() > record.expiry) {
    delete otpStore[mobile];
    return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
  }

  // Limit attempts (max 5)
  record.attempts += 1;
  if (record.attempts > 5) {
    delete otpStore[mobile];
    return res.status(429).json({ error: 'Too many attempts. Please request a new OTP.' });
  }

  // Check OTP
  if (record.otp !== otp.toString()) {
    return res.status(400).json({
      error: `Incorrect OTP. ${5 - record.attempts} attempts remaining.`,
    });
  }

  // ✅ OTP verified — clean up and return success
  delete otpStore[mobile];

  return res.status(200).json({
    success: true,
    message: 'Mobile number verified successfully.',
    mobile,
  });
};
