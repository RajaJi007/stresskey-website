// api/send-otp.js
// Vercel Serverless Function — sends OTP SMS via MSG91
// Called when user enters their mobile number on the login screen

const config = require('../config');

// In-memory OTP store (resets on cold start — fine for short-lived OTPs)
// For production, replace with Redis or a DB
const otpStore = {};

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

module.exports = async (req, res) => {
  // Allow cross-origin requests from your frontend
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { mobile } = req.body;

  // Validate Indian mobile number
  if (!mobile || !/^[6-9]\d{9}$/.test(mobile)) {
    return res.status(400).json({ error: 'Please enter a valid 10-digit Indian mobile number.' });
  }

  const otp = generateOTP();
  const expiry = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes

  // Store OTP (keyed by mobile number)
  otpStore[mobile] = { otp, expiry, attempts: 0 };

  // ── If MSG91 key is not set yet, return OTP in response (DEV MODE) ──
  if (
    config.MSG91_AUTH_KEY === 'PASTE_YOUR_MSG91_AUTH_KEY_HERE' ||
    !config.MSG91_AUTH_KEY
  ) {
    console.log(`[DEV MODE] OTP for ${mobile}: ${otp}`);
    return res.status(200).json({
      success: true,
      dev_mode: true,
      dev_otp: otp, // Remove this line in production!
      message: 'OTP generated (DEV MODE — MSG91 not configured yet)',
    });
  }

  // ── Production: send real SMS via MSG91 ──
  try {
    const response = await fetch('https://control.msg91.com/api/v5/flow/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'authkey': config.MSG91_AUTH_KEY,
      },
      body: JSON.stringify({
        template_id: config.MSG91_TEMPLATE_ID,
        short_url: '0',
        mobiles: `91${mobile}`,
        VAR1: otp, // {{VAR1}} in your MSG91 OTP template = the OTP
      }),
    });

    const data = await response.json();

    if (data.type === 'success') {
      return res.status(200).json({ success: true, message: 'OTP sent successfully.' });
    } else {
      console.error('MSG91 error:', data);
      return res.status(500).json({ error: 'Failed to send OTP. Please try again.' });
    }
  } catch (err) {
    console.error('MSG91 fetch error:', err);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
};

// Export OTP store so verify-otp.js can access it
module.exports.otpStore = otpStore;
