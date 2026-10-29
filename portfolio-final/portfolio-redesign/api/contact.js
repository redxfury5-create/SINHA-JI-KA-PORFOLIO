const nodemailer = require('nodemailer');

// Best-effort rate limit per warm instance (5 messages / 15 min / IP).
const hits = new Map();
function limited(ip) {
  const now = Date.now(), win = 15 * 60 * 1000;
  for (const [k, v] of hits) if (!v.some((t) => now - t < win)) hits.delete(k); // keep the map from growing forever
  const list = (hits.get(ip) || []).filter((t) => now - t < win);
  list.push(now); hits.set(ip, list);
  return list.length > 5;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });
  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (limited(ip)) return res.status(429).json({ error: 'Too many messages. Please try again later.' });

  const body = typeof req.body === 'string' ? (() => { try { return JSON.parse(req.body); } catch { return {}; } })() : (req.body || {});
  const str = (v) => (typeof v === 'string' ? v.trim() : '');
  const name = str(body.name), email = str(body.email), message = str(body.message), website = str(body.website);

  if (website) return res.status(200).json({ ok: true }); // honeypot
  if (!name || name.length > 80 || /[\r\n]/.test(name)) return res.status(400).json({ error: 'Enter a name under 80 characters.' });
  if (!email || email.length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Enter a valid email address.' });
  if (!message || message.length > 3000) return res.status(400).json({ error: 'Enter a message under 3000 characters.' });

  const env = process.env;
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS || !env.CONTACT_TO) {
    return res.status(503).json({ error: 'Contact email is not configured yet.' });
  }
  try {
    const transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: Number(env.SMTP_PORT || 465),
      secure: String(env.SMTP_SECURE || 'true').toLowerCase() === 'true',
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
      connectionTimeout: 8000, greetingTimeout: 8000, socketTimeout: 12000 // fail fast instead of hanging the form
    });
    await transporter.sendMail({
      from: env.MAIL_FROM || env.SMTP_USER,
      to: env.CONTACT_TO,
      replyTo: email,
      subject: `Portfolio enquiry from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`
    });
    return res.status(201).json({ ok: true });
  } catch (error) {
    console.error('Contact email delivery failed:', error.message);
    return res.status(502).json({ error: 'Email could not be delivered. Please try the direct email link.' });
  }
};
