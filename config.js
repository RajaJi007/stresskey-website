// ============================================================
//  STRESSKEY CONFIG FILE
//  Fill in your API keys below. This is the ONLY file you
//  need to edit to connect all services.
//  DO NOT share this file publicly or commit to GitHub.
// ============================================================

module.exports = {

  // ----------------------------------------------------------
  // 1. MSG91 — for sending OTP SMS to customers
  //    Sign up free at: https://msg91.com
  //    Dashboard → API → Copy your Auth Key
  //    Also create a "Flow" for OTP and copy the Template ID
  // ----------------------------------------------------------
  MSG91_AUTH_KEY:   "507688As0J6zlkK69d94776P1",
  MSG91_TEMPLATE_ID:"6914173165084885304",
  MSG91_SENDER_ID:  "STRKEY",   // 6-char sender name shown on SMS

  // ----------------------------------------------------------
  // 2. SHIPROCKET — for creating shipments automatically
  //    Sign up free at: https://app.shiprocket.in/register
  //    Use your login email and password below
  // ----------------------------------------------------------
  SHIPROCKET_EMAIL:    "rajaharsh485@gmail.com",
  SHIPROCKET_PASSWORD: "Stresskey@2026",

  // ----------------------------------------------------------
  // 3. INTERAKT — for WhatsApp order notifications to customers
  //    Sign up free at: https://app.interakt.ai
  //    Dashboard → Developer → API Key
  // ----------------------------------------------------------
  INTERAKT_API_KEY: "PASTE_YOUR_INTERAKT_API_KEY_HERE",

  // ----------------------------------------------------------
  // 4. YOUR WHATSAPP NUMBER — to receive orders
  //    Format: country code + number, no + or spaces
  //    Example for +91 98765 43210 → "919876543210"
  // ----------------------------------------------------------
  OWNER_WHATSAPP: "919654989929",

  // ----------------------------------------------------------
  // 5. ADMIN PASSWORD — to access your store dashboard
  //    Change this to something only you know!
  // ----------------------------------------------------------
  ADMIN_PASSWORD: "stresskey2024",

  // ----------------------------------------------------------
  // 6. YOUR STORE DETAILS (used in Shiprocket shipments)
  // ----------------------------------------------------------
  STORE_NAME:    "StressKey",
  STORE_EMAIL:   "rajaharsh485@gmail.com",
  STORE_PHONE:   "9654989929",
  STORE_ADDRESS: "Gate No 2, Rishihood University, Bhalgarh",
  STORE_CITY:    "Sonipat",
  STORE_STATE:   "Haryana",
  STORE_PINCODE: "131021",

};
