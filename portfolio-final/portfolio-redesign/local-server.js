require('dotenv').config();
const express = require('express');
const rateLimit = require('express-rate-limit').rateLimit;
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const port = Number(process.env.PORT || 3000);
const publicDir = path.join(__dirname, 'public');

app.disable('x-powered-by');
// Behind a reverse proxy (most hosts)? Set TRUST_PROXY=1 so rate limiting sees real visitor IPs.
if (process.env.TRUST_PROXY) app.set('trust proxy', Number(process.env.TRUST_PROXY) || 1);
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});
app.use(express.json({ limit: '12kb' }));
app.use(express.static(publicDir, {
  extensions: ['html'],
  setHeaders: (res, filePath) => {
    if (/[\\/]assets[\\/]/.test(filePath)) res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
  }
}));

app.get('/api/health', (_req, res) => res.json({ ok: true }));

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many messages. Please try again later.' }
});

app.post('/api/contact', contactLimiter, async (req, res) => {
  const body = req.body || {};
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  const website = typeof body.website === 'string' ? body.website.trim() : '';

  // Quietly accept honeypot submissions without sending email.
  if (website) return res.status(200).json({ ok: true });
  if (!name || name.length > 80 || /[\r\n]/.test(name)) {
    return res.status(400).json({ error: 'Enter a name under 80 characters.' });
  }
  if (!email || email.length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Enter a valid email address.' });
  }
  if (!message || message.length > 3000) {
    return res.status(400).json({ error: 'Enter a message under 3000 characters.' });
  }

  const requiredSettings = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS'];
  if (requiredSettings.some((key) => !process.env[key]) || !process.env.CONTACT_TO) {
    return res.status(503).json({ error: 'Contact email is not configured yet.' });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 465),
      secure: String(process.env.SMTP_SECURE || 'true').toLowerCase() === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      connectionTimeout: 8000, greetingTimeout: 8000, socketTimeout: 12000
    });
    await transporter.sendMail({
      from: process.env.MAIL_FROM || process.env.SMTP_USER,
      to: process.env.CONTACT_TO,
      replyTo: email,
      subject: `Portfolio enquiry from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`
    });
    return res.status(201).json({ ok: true });
  } catch (error) {
    console.error('Contact email delivery failed:', error.message);
    return res.status(502).json({ error: 'Email could not be delivered. Please try the direct email link.' });
  }
});

app.get('*', (_req, res) => res.status(404).sendFile(path.join(publicDir, '404.html')));
app.listen(port, () => console.log(`Portfolio running at http://localhost:${port}`));
