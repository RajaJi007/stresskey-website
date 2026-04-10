// api/shiprocket.js
// Vercel Serverless Function — handles all Shiprocket operations:
//   POST /api/shiprocket?action=create_order  → create a new shipment
//   POST /api/shiprocket?action=track         → track an existing order
//   POST /api/shiprocket?action=cancel        → cancel an order

const config = require('../config');

let shiprocketToken = null;
let tokenExpiry = 0;

// ── Authenticate with Shiprocket and get a token ──
async function getToken() {
  if (shiprocketToken && Date.now() < tokenExpiry) return shiprocketToken;

  const res = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: config.SHIPROCKET_EMAIL,
      password: config.SHIPROCKET_PASSWORD,
    }),
  });

  const data = await res.json();
  if (!data.token) throw new Error('Shiprocket authentication failed: ' + JSON.stringify(data));

  shiprocketToken = data.token;
  tokenExpiry = Date.now() + 9 * 24 * 60 * 60 * 1000; // Token valid ~10 days
  return shiprocketToken;
}

// ── Create a Shiprocket order ──
async function createOrder(orderData) {
  const token = await getToken();

  // Build line items for Shiprocket
  const orderItems = orderData.items.map(item => ({
    name: item.name,
    sku: item.id || 'SKU001',
    units: item.qty,
    selling_price: item.price,
  }));

  const payload = {
    order_id:           orderData.orderId,
    order_date:         new Date().toISOString().split('T')[0],
    pickup_location:    'Primary',   // Set up in Shiprocket dashboard
    channel_id:         '',
    comment:            'StressKey Order',
    billing_customer_name:  orderData.customerName,
    billing_last_name:      '',
    billing_address:        orderData.address,
    billing_address_2:      '',
    billing_city:           orderData.city,
    billing_pincode:        orderData.pincode,
    billing_state:          orderData.state,
    billing_country:        'India',
    billing_email:          orderData.email || 'customer@stresskey.shop',
    billing_phone:          orderData.mobile,
    shipping_is_billing:    true,
    order_items:            orderItems,
    payment_method:         orderData.paymentMethod === 'COD' ? 'COD' : 'Prepaid',
    sub_total:              orderData.total,
    length:                 10,
    breadth:                10,
    height:                 5,
    weight:                 0.3,
  };

  const res = await fetch('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  return await res.json();
}

// ── Track a Shiprocket order ──
async function trackOrder(orderId) {
  const token = await getToken();
  const res = await fetch(
    `https://apiv2.shiprocket.in/v1/external/orders/show/${orderId}`,
    { headers: { 'Authorization': `Bearer ${token}` } }
  );
  return await res.json();
}

// ── Cancel a Shiprocket order ──
async function cancelOrder(orderIds) {
  const token = await getToken();
  const res = await fetch('https://apiv2.shiprocket.in/v1/external/orders/cancel', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ ids: orderIds }),
  });
  return await res.json();
}

// ── Main handler ──
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Guard: if Shiprocket not configured yet
  if (
    config.SHIPROCKET_EMAIL === 'PASTE_YOUR_SHIPROCKET_EMAIL_HERE' ||
    !config.SHIPROCKET_EMAIL
  ) {
    return res.status(200).json({
      success: false,
      dev_mode: true,
      message: 'Shiprocket not configured yet. Order saved locally.',
    });
  }

  const { action } = req.query;

  try {
    if (action === 'create_order') {
      const result = await createOrder(req.body);
      return res.status(200).json({ success: true, data: result });
    }

    if (action === 'track') {
      const result = await trackOrder(req.body.orderId);
      return res.status(200).json({ success: true, data: result });
    }

    if (action === 'cancel') {
      const result = await cancelOrder(req.body.orderIds);
      return res.status(200).json({ success: true, data: result });
    }

    return res.status(400).json({ error: 'Unknown action.' });
  } catch (err) {
    console.error('Shiprocket error:', err);
    return res.status(500).json({ error: 'Shiprocket error: ' + err.message });
  }
};
