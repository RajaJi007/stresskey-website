# StressKey Store — Setup Guide
### No tech knowledge needed. Follow these steps one by one.

---

## 📁 Your Files

```
stresskey/
├── public/
│   └── index.html        ← Your entire website
├── api/
│   ├── send-otp.js       ← Sends OTP SMS to customers
│   ├── verify-otp.js     ← Checks the OTP customers enter
│   ├── shiprocket.js     ← Creates shipments automatically
│   └── whatsapp.js       ← Sends WhatsApp notifications
├── config.js             ← ⭐ THE ONLY FILE YOU NEED TO EDIT
├── vercel.json           ← Tells Vercel how to run everything
└── SETUP.md              ← This guide
```

---

## STEP 1 — Deploy to Vercel (5 minutes)

1. Go to **github.com** and create a free account if you don't have one
2. Click **New Repository** → name it `stresskey` → click **Create**
3. Click **Upload files** → drag your entire `stresskey` folder in → click **Commit**
4. Go to **vercel.com** → sign in with GitHub
5. Click **Add New Project** → select your `stresskey` repo → click **Deploy**
6. Your site is now live! You'll get a URL like `stresskey.vercel.app`

---

## STEP 2 — Connect Your Custom Domain

1. In Vercel, go to your project → **Settings** → **Domains**
2. Type your domain and click **Add**
3. Vercel shows you 2 DNS records to add
4. Log into wherever you bought your domain → find **DNS Settings**
5. Add the records Vercel shows you
6. Wait 10–30 minutes — your domain is live!

---

## STEP 3 — Set Your WhatsApp Number (Do this first!)

1. Open your website at `yoursite.com/?admin`
2. Enter your admin password: **stresskey2024** (change it in Settings!)
3. On the Dashboard, enter your WhatsApp number in the box
4. Format: `91` + your 10 digits. Example: `919876543210`
5. Click Save

---

## STEP 4 — Set Up MSG91 for Real OTP SMS (Optional — free tier available)

> Until you do this, OTP works in "DEV MODE" — the code shows on screen.
> Fine for testing, but set this up before going live.

1. Go to **msg91.com** → Sign up free
2. Top menu → **API** → copy your **Auth Key**
3. Left menu → **OTP** → **Create Template**
   - Template body: `Your StressKey OTP is {{VAR1}}. Valid for 10 minutes.`
   - Copy the **Template ID**
4. Open `config.js` in your project
5. Replace:
   - `PASTE_YOUR_MSG91_AUTH_KEY_HERE` → your Auth Key
   - `PASTE_YOUR_MSG91_OTP_TEMPLATE_ID_HERE` → your Template ID
6. Push to GitHub → Vercel auto-redeploys in 30 seconds

---

## STEP 5 — Set Up Shiprocket for Auto-Shipping

> Shiprocket handles pickup, packaging, and delivery for you.

1. Go to **app.shiprocket.in/register** → create free account
2. Complete your profile (store name, address, GSTIN if you have it)
3. Go to **Settings** → **Manage Pickup Addresses** → add your address as "Primary"
4. Open `config.js` and fill in:
   - `SHIPROCKET_EMAIL` → your Shiprocket login email
   - `SHIPROCKET_PASSWORD` → your Shiprocket password
   - Fill in your store address details at the bottom of config.js
5. Push to GitHub → done!

> Every time a customer orders, Shiprocket automatically gets the order.
> You just need to go to Shiprocket dashboard and click "Schedule Pickup".

---

## STEP 6 — Set Up Interakt for WhatsApp Notifications

> Interakt sends automatic WhatsApp messages to customers
> (order confirmed, packed, shipped, delivered).

1. Go to **app.interakt.ai** → Sign up (free trial, no card needed)
2. Connect your WhatsApp Business number
3. Go to **Templates** → Create these 4 templates (name them EXACTLY):

   **Template 1** — Name: `order_confirmation`
   ```
   Hi {{1}}! Your order #{{2}} for ₹{{3}} has been confirmed. We'll notify you once it's shipped. 🎉
   ```

   **Template 2** — Name: `order_packed`
   ```
   Hi {{1}}! Your order #{{2}} has been packed and is ready for pickup by our courier. 📦
   ```

   **Template 3** — Name: `order_shipped`
   ```
   Hi {{1}}! Your order #{{2}} has been shipped 🚚 Tracking ID: {{3}}. Track at: {{4}}
   ```

   **Template 4** — Name: `order_delivered`
   ```
   Hi {{1}}! Your order #{{2}} has been delivered! ✅ Hope you love your StressKey. Please leave us a review!
   ```

4. Go to **Developer** → copy your **API Key**
5. Open `config.js` → paste into `INTERAKT_API_KEY`
6. Push to GitHub → done!

> Now when you update an order status in your admin dashboard,
> the customer gets a WhatsApp message automatically!

---

## 🔐 How to Access Your Admin Dashboard

- Go to: `yoursite.com/?admin`
- Default password: `stresskey2024`
- **Change this in Settings immediately!**
- Or: click the footer copyright area **5 times fast**

---

## 📦 Daily Workflow (After Setup)

1. Customer places order → you get a WhatsApp message
2. Go to your admin at `yoursite.com/?admin`
3. Click **Orders** tab
4. Change order status → "Confirmed", "Packed", "Shipped", "Delivered"
5. Customer automatically gets a WhatsApp notification at each step!
6. For shipping: go to Shiprocket dashboard → schedule courier pickup

---

## ❓ Common Questions

**Q: Can I add products without coding?**
A: Yes! Admin → Add Product. Just fill in the form. No coding needed.

**Q: What if OTP isn't working?**
A: In DEV MODE, the OTP shows on screen as a green notification. Deploy the `/api` folder to Vercel and set up MSG91 for real SMS.

**Q: What if Shiprocket isn't working?**
A: Orders still come to you via WhatsApp. Shiprocket just automates the shipping. You can create shipments manually in Shiprocket dashboard too.

**Q: How do I change my admin password?**
A: Admin Dashboard → Settings → Change Admin Password.

**Q: Can customers track their orders?**
A: Yes — they receive WhatsApp messages at every step. You can also share the Shiprocket tracking link when you update the "Shipped" status.

---

## 📞 Service Sign-Up Links

| Service | Link | Cost |
|---------|------|------|
| MSG91 (OTP SMS) | msg91.com | ~₹0.15/SMS |
| Shiprocket | app.shiprocket.in/register | Free to start |
| Interakt (WhatsApp) | app.interakt.ai | Free trial |
| Vercel (hosting) | vercel.com | Free |
| GitHub | github.com | Free |
