# Redesign verification

The approved navy/cyan preview is implemented in the existing Cloudflare Pages project. Six expanded service cards replace the previous twelve short cards. The imported hero illustration is removed; the hero uses editable service links instead.

Run `npm run build` to validate content and anchors, run the automated suite, and generate `dist/`. Tests cover content operations, visibility, escaping, invalid values, safe images, hero fallbacks after card removal, editable bullet lists, contact failure states and the established secure OAuth flow.

CMS fields were checked against both content schemas, including nested lists. The generated homepage contains full service content, canonical metadata, business/service JSON-LD, robots.txt and sitemap.xml. The existing www redirect and old service-path redirects remain. Google Ads initialization and security policy remain.

OAuth handlers, contact backend and Cloudflare environment requirements are retained. Local preview does not verify a fresh GitHub login or real inquiry delivery. End-to-end CMS publication requires the deployed custom domain and an authorized editor session. Contact delivery remains unavailable until the existing server and public Turnstile settings are configured.
