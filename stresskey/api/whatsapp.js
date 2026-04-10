// api/whatsapp.js
// Vercel Serverless Function — sends WhatsApp messages via Interakt
//
// Triggers:
//   action=order_placed     → "Your order #SK123 is confirmed!"
//   action=order_packed     → "Your order is packed and ready to ship"
//   action=order_shipped    → "Your order has been shipped! Tracking: XXXX"
//   action=order_delivered  → "Your order has been delivered!"
//   action=cart_reminder    → "You left something in your cart 🛒"
//   action=custom           → Send any custom message

const config = require('../config');

// ── Interakt template names (set these up in your Interakt dashboard) ──
// After signing up at interakt.ai, go to Templates and create these.
// Name them EXACTLY as shown below, or update the names here to match.
const TEMPLATES = {
  order_placed:    'order_confirmation',
  order_packed:    'order_packed',
  order_shipped:   'order_shipped',
  order_delivered: 'order_delivered',
  cart_reminder:   'cart_abandonment',
};

// ── Send a WhatsApp message via Interakt ──
async function sendWhatsApp({ mobile, templateName, bodyValues, headerValue }) {
  if (
    config.INTERAKT_API_KEY === 'PASTE_YOUR_INTERAKT_API_KEY_HERE' ||
    !config.INTERAKT_API_KEY
  ) {
    // DEV MODE — just log it
    console.log(`[WhatsApp DEV] To: ${mobile}, Template: ${templateName}`, bodyValues);
    return { dev_mode: true, message: 'Interakt not configured. Message logged only.' };
  }

  const payload = {
    countryCode:  '+91',
    phoneNumber:  mobile,
    callbackData: 'stresskey_notification',
    type:         'Template',
    template: {
      name:     templateName,
      languageCode: 'en',
      headerValues: headerValue ? [headerValue] : [],
      bodyValues:   bodyValues || [],
    },
  };

  const res = await fetch('https://api.interakt.ai/v1/public/message/', {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Basic ${Buffer.from(config.INTERAKT_API_KEY).toString('base64')}`,
    },
    body: JSON.stringify(payload),
  });

  return await res.json();
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { action, mobile, data } = req.body;

  if (!mobile) return res.status(400).json({ error: 'mobile is required' });

  try {
    let result;

    // ── Order Placed ──
    if (action === 'order_placed') {
      // Template body: "Hi {{1}}! Your order #{{2}} for ₹{{3}} has been confirmed. We'll notify you once it's shipped. 🎉"
      result = await sendWhatsApp({
        mobile,
        templateName: TEMPLATES.order_placed,
        bodyValues: [
          data.customerName,
          data.orderId,
          data.total.toString(),
        ],
      });
    }

    // ── Order Packed ──
    else if (action === 'order_packed') {
      // Template body: "Hi {{1}}! Your order #{{2}} has been packed and is ready to be picked up by our courier. 📦"
      result = await sendWhatsApp({
        mobile,
        templateName: TEMPLATES.order_packed,
        bodyValues: [data.customerName, data.orderId],
      });
    }

    // ── Order Shipped ──
    else if (action === 'order_shipped') {
      // Template body: "Hi {{1}}! Your order #{{2}} has been shipped 🚚 Tracking ID: {{3}}. Track at: {{4}}"
      result = await sendWhatsApp({
        mobile,
        templateName: TEMPLATES.order_shipped,
        bodyValues: [
          data.customerName,
          data.orderId,
          data.trackingId || 'N/A',
          data.trackingUrl || 'https://shiprocket.co/tracking',
        ],
      });
    }

    // ── Order Delivered ──
    else if (action === 'order_delivered') {
      // Template body: "Hi {{1}}! Your order #{{2}} has been delivered! ✅ We hope you love your StressKey. Please leave us a review!"
      result = await sendWhatsApp({
        mobile,
        templateName: TEMPLATES.order_delivered,
        bodyValues: [data.customerName, data.orderId],
      });
    }

    // ── Cart Abandonment Reminder ──
    else if (action === 'cart_reminder') {
      // Template body: "Hi {{1}}! 🛒 You left {{2}} item(s) in your cart on StressKey. Complete your order before they sell out! {{3}}"
      result = await sendWhatsApp({
        mobile,
        templateName: TEMPLATES.cart_reminder,
        bodyValues: [
          data.customerName,
          data.itemCount.toString(),
          data.cartUrl || 'https://stresskey.shop',
        ],
      });
    }

    // ── Custom Message ──
    else if (action === 'custom') {
      result = await sendWhatsApp({
        mobile,
        templateName: data.templateName,
        bodyValues:   data.bodyValues || [],
        headerValue:  data.headerValue || null,
      });
    }

    else {
      return res.status(400).json({ error: 'Unknown action.' });
    }

    return res.status(200).json({ success: true, result });

  } catch (err) {
    console.error('WhatsApp notification error:', err);
    return res.status(500).json({ error: 'WhatsApp error: ' + err.message });
  }
};
