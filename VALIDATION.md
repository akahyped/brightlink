# Validation

## Completed

- `npm run build`: passed.
- 18 automated tests: content/JSON validation, CRUD and ordering of service cards, hidden content, safe rendering, internal navigation, optional fields, disabled-until-configured form, OAuth/PKCE/cookie checks, mocked GitHub editor permissions, mocked Turnstile and email-provider behavior.
- All 12 service cards and all 12 SVG icons retained.
- Source HTML has no hardcoded business content; generated HTML and runtime rendering both derive from JSON.
- Browser inspection confirmed the green-and-cream BrightLink page, service/handyman content and contact details. Live GitHub login and actual email sending were not performed.
- Contact button targets verified as `tel:+14407199436`, `sms:+14407199436`, and `brightlinkcle@gmail.com`.
- Root package contains no real credentials or unrelated restaurant assets.

## Required after deployment

- Add actual repository, OAuth origins, allowed editor and secrets.
- Sign into `/admin/`, publish a reversible edit, and verify the new Cloudflare build.
- Configure Turnstile and verified-domain email delivery; send a real test and confirm Gmail receipt.
- Check on your actual phone and desktop browsers, including icon cards, contact layout and tap targets.
- Verify domain/HTTPS/canonical URLs if migrating from Squarespace.

“Production-ready” describes the implemented structure and safeguards. Live account configuration and acceptance tests still need to be completed before launch.
