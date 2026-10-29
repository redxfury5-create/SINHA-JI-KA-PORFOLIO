# Portfolio launch checklist

The portfolio is not approved for launch until every item below is complete.

- [ ] Choose and connect the custom domain to the production host.
- [ ] Confirm the domain resolves and HTTPS works.
- [ ] Confirm the favicon and touch icon load on the production domain.
- [ ] Configure SMTP using private host environment variables and confirm a real contact message arrives.
- [ ] Review the Privacy Policy against the deployed hosting, email, analytics, cookie, and message-retention behavior.
- [ ] Review the Terms and Conditions for the intended use and applicable requirements.
- [ ] Confirm there is no unwanted builder badge or attribution on the deployed site.
- [ ] Review the deployed pages and links on desktop and mobile before sharing the domain.

- [ ] Replace the relative /assets/og-image.png URLs in the og:image and twitter:image tags of public/index.html with the full https:// address on the final domain, so link previews work.
- [ ] The site loads fonts from Google Fonts and the privacy page says so. If you self-host the fonts later, remove that line from public/privacy.html.
- [ ] Add a live demo or repository link to a project card only when it is actually running.

- [ ] Confirm unknown URLs show the new 404 page (local-server.js now serves public/404.html with a 404 status).
