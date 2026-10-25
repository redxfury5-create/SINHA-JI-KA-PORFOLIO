# Divyajyot Sinha portfolio

A responsive portfolio website with a Node.js and Express backend for the contact form. The website and its image assets are in `public/`.

## Run it locally

1. Install Node.js 20 or later.
2. In this folder, run `npm install`.
3. Copy `.env.example` to `.env` and add SMTP credentials from an email provider you control. For Gmail, use an app password rather than your regular account password.
4. Run `npm start`.
5. Open `http://localhost:3000`.

The contact form sends messages to `CONTACT_TO` and uses the visitor's address as the reply-to address. The backend limits submissions and checks form input. Without SMTP settings, the rest of the portfolio still runs and the contact form shows the direct email fallback.

## Before launch

Do not publish the site until the custom domain is connected and HTTPS is working, SMTP delivery has been configured, the favicon displays on the deployed domain, and the Privacy Policy and Terms and Conditions have been reviewed and published. The supplied policy pages are editable drafts. Confirm that every statement matches the final hosting, email, analytics, and data-retention setup. There is no third-party builder badge in this package.

## Deploy

Deploy this folder to a Node.js host, set the environment variables from `.env.example` in the host settings, and use `npm start` as the start command. Set `PORT` only if the host requires it. Connect the custom domain and enable HTTPS before sharing the site.

## Main files

- `local-server.js`: website server and contact endpoint
- `public/index.html`: portfolio page
- `public/assets/`: project and game images
- `public/favicon.svg`, `public/favicon.ico`, and `public/apple-touch-icon.png`: site icons
- `public/privacy.html` and `public/terms.html`: policy pages
- `.env.example`: SMTP configuration template with no secrets

## Deploying on Vercel

`vercel.json` serves `public/` as the site and `api/contact.js` as the contact form function. `local-server.js` is only for running the site on your own computer (`npm start`). In Vercel, open Project Settings, Environment Variables, and add `CONTACT_TO`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` and `MAIL_FROM` (same values as `.env.example`), then redeploy. The contact form shows its email fallback until these are set.
