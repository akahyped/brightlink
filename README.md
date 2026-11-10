# BrightLink Cleveland — production website

A standalone single-page version of the **BrightLink site built in this conversation**: forest green and cream, the living-room illustration, all twelve cartoon service icons, smart-home services, handyman services, process section, and Thomas’s contact card.

- Phone: **440-719-9436**
- Public email and default inquiry destination: **brightlinkcle@gmail.com**
- No restaurant content is included.
- This package is for GitHub + **Cloudflare Pages**, not a Squarespace Code Block.
- No account connections, DNS changes, live publishing, OAuth credential creation or email sending have been performed by this export.

## Start here

1. Extract the ZIP. Open the `brightlink-production` folder in VS Code.
2. Install Node.js 22 or newer and Git if needed; restart VS Code after installation.
3. Run `npm run build` from the folder containing `package.json`.
4. Push the source to a dedicated GitHub repository.
5. Create a **Cloudflare Pages** project connected to that repository. Set build command **`npm run build`**, output directory **`dist`**, production branch **`main`**, and framework preset **None**.
6. Configure GitHub authentication as described below.
7. Configure optional on-site email delivery, or disable the form in CMS until ready. Phone/text/email buttons work independently.

There are no npm runtime dependencies or install steps. Node runs validation, tests and the static generation step. Decap’s pinned browser bundle loads from unpkg.

## Project structure

| Path | Purpose |
| --- | --- |
| `templates/index.html` | Clean HTML document shell; contains no hardcoded business content |
| `public/data/site.json` | Brand, headings, navigation, hero, process, contact details, form labels and SEO |
| `public/data/services.json` | Reorderable service groups and cards |
| `public/data/*.schema.json` | Document shapes used by builds, browser and CMS validation |
| `public/assets/css/styles.css` | Preserved green-and-cream responsive styling |
| `public/assets/js/site.js` | Fetches JSON and renders the page |
| `public/assets/js/render.js` | Shared safe HTML template used by the browser and build |
| `public/assets/js/model.js` | Validates fields, URLs, IDs and anchor targets |
| `public/assets/js/icons.js` | Twelve approved SVG illustrations; selected by icon name in CMS |
| `public/assets/js/contact.js` | Form readiness checks, Turnstile widget and submission handling |
| `public/assets/images/favicon.png` | Your approved 128px favicon, under 0.1 MB |
| `public/admin/index.html` | Decap CMS entry at `/admin/` |
| `public/admin/config.yml` | GitHub backend and complete editable content collections |
| `public/admin/editor.js` | Validates documents before saving |
| `public/uploads/` | Photos uploaded through CMS |
| `functions/api/auth.js` | GitHub OAuth login initiation |
| `functions/api/callback.js` | Code exchange, editor allowlist and repository permission checks |
| `functions/api/contact.js` | Turnstile-verified project inquiry delivery through Resend |
| `lib/oauth.js` | Signed cookies, PKCE and origin-bound Decap popup messaging |
| `scripts/` | Checks and build generation |
| `tests/` | Content/rendering, OAuth and contact delivery tests |
| `.github/workflows/check.yml` | Validation on pushes and pull requests |
| `.dev.vars.example` | Server-variable names; contains no real credentials |
| `docs/OWNER-GUIDE.md` | Day-to-day editing and publishing instructions |
| `docs/CONTENT-MODEL.md` | JSON layout and editable-field explanation |
| `VALIDATION.md` | Verification performed and deployment checks still required |
| `dist/` | Generated deployment output; not source, not committed |

## How the JSON website works

All public page text is in `site.json` or `services.json`. JavaScript fetches those files using revalidation and generates the page. No CMS text is evaluated as JavaScript or arbitrary HTML. Only developer-owned SVG markup is allowed; CMS selects an icon name.

The build also uses the **same renderer and the same JSON** to write the complete page into `dist/index.html`. This lets search engines, visitors with JavaScript disabled and visitors experiencing JSON request errors see a complete website. It is generated content, not an independently maintained HTML copy. Never edit `dist/index.html` by hand.

Public navigation stays within the one page: `#home`, `#services`, `#handyman`, `#approach`, `#contact`, plus any new service-group IDs. Call, text and email buttons are device actions rather than navigation pages. `/admin/` is a separate editing application, not a public content page.

## Local checks and preview

```sh
npm run check
npm test
npm run build
```

Serve the built static site:

```sh
python -m http.server 8080 --directory dist
```

Then visit `http://localhost:8080`. Do not double-click the HTML file: JSON fetches need a web server. A plain Python server previews public content only; it does not execute Cloudflare Functions or provide working CMS authentication/email delivery.

For an optional full Cloudflare development runtime, install/use the official Wrangler CLI, copy `.dev.vars.example` to ignored `.dev.vars`, supply your development values, and run `npx wrangler pages dev dist`. Use a separately configured HTTPS OAuth origin if testing CMS authentication. This package intentionally rejects insecure and unconfigured OAuth origins. Production secrets never belong in browser code.

## GitHub setup

Use a dedicated repository for BrightLink. Do not reuse another website’s repository, OAuth client or hosting settings.

If this is a new local folder and an empty GitHub repository:

```sh
git init -b main
git config user.name "YOUR NAME"
git config user.email "YOUR GIT COMMIT EMAIL"
git add .
git commit -m "Build BrightLink Cleveland website"
git remote add origin https://github.com/OWNER/BRIGHTLINK-REPOSITORY.git
git push -u origin main
```

Replace placeholders. The Git author email can be your GitHub noreply address. Git commit identity and GitHub authentication are separate.

For an existing checkout, inspect `git status` and `git remote -v` first. Do not initialize over another project or force-push. Pull the latest edits before making changes, especially after CMS publishing.

`.gitignore` excludes secrets and generated output. Commit the source folders, including root `functions/` and `lib/`. Never put secrets in `public/`, `config.yml`, screenshots or Git history.

## Cloudflare Pages deployment

Create an application using **Pages → Connect to Git**. If you see a Worker deploy command such as `npx wrangler deploy`, return to the Pages flow.

| Setting | Value |
| --- | --- |
| Repository | Your dedicated BrightLink repository |
| Production branch | `main` |
| Framework | None |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | Blank, when `package.json` is at repository root |
| Node version | 22 or newer; set `NODE_VERSION=22` if needed |

The root `functions/` directory is deployed by Pages alongside `dist`. Dragging only HTML/assets into a static upload will not install the OAuth/email endpoints. Leave automatic production deployments enabled.

After the first build, record the exact `https://YOUR-BRIGHTLINK-PROJECT.pages.dev` production origin. A purchased domain is not needed for this step.

## Configure secure `/admin/` GitHub authentication

### 1. Create a GitHub OAuth App

In GitHub, open **Settings → Developer settings → OAuth Apps → New OAuth App**. This backend uses an OAuth App; do not substitute a GitHub App configuration.

- Application name: a BrightLink-specific name.
- Homepage URL: your exact production Pages origin.
- Authorization callback / Redirect URI: that origin followed by **`/api/callback`**.
- Example shape: `https://YOUR-BRIGHTLINK-PROJECT.pages.dev/api/callback`.
- Record the matching Client ID and generate a Client Secret.

The callback must match exactly, including HTTPS and hostname. This handler uses state validation, PKCE and an HttpOnly signed cookie. Do not disable those checks to work around a configuration mismatch. It does not implement refresh tokens; do not enable forced expiring OAuth tokens without extending and testing that support.

### 2. Edit `public/admin/config.yml`

Replace only the initial backend/site values; keep the collections below them.

```yaml
backend:
  name: github
  repo: OWNER/BRIGHTLINK-REPOSITORY
  branch: main
  base_url: https://YOUR-BRIGHTLINK-PROJECT.pages.dev
  auth_endpoint: api/auth
  auth_scope: public_repo

site_url: https://YOUR-BRIGHTLINK-PROJECT.pages.dev
display_url: https://YOUR-BRIGHTLINK-PROJECT.pages.dev
```

For a private GitHub repository, change `auth_scope` and the server `GITHUB_SCOPE` to `repo`. GitHub OAuth scopes are broader than one repository; `public_repo` is not a repository-specific token. Use a dedicated setup and restrict collaborators appropriately.

### 3. Add Cloudflare Pages variables and secrets

In the correct Pages project, open **Settings → Variables and Secrets**, and add production values:

| Name | Value | Storage type |
| --- | --- | --- |
| `SITE_ORIGIN` | Exact CMS HTTPS origin, no trailing slash | Variable |
| `GITHUB_REPO` | `OWNER/BRIGHTLINK-REPOSITORY` | Variable |
| `GITHUB_SCOPE` | `public_repo` for public, `repo` for private | Variable |
| `GITHUB_CLIENT_ID` | Your OAuth App Client ID | Variable |
| `GITHUB_CLIENT_SECRET` | Matching OAuth App secret | Secret |
| `OAUTH_COOKIE_SECRET` | New random secret, at least 32 characters | Secret |
| `ALLOWED_GITHUB_USERS` | Comma-separated allowed GitHub usernames | Variable |

Generate a cookie secret locally with Node:

```sh
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Or PowerShell:

```powershell
$bytes = New-Object byte[] 32
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($bytes)
$rng.Dispose()
[BitConverter]::ToString($bytes).Replace("-", "").ToLowerInvariant()
```

An allowed editor must also have write access to the selected GitHub repository. Public visitors can view the editor’s login page, but cannot save changes without authorization. The custom backend rejects unlisted users and users without repository push permission. `/admin/` itself is not hidden behind a password; GitHub protects the editing operations.

### 4. Publish settings and test

Commit/push the CMS configuration after saving Cloudflare variables; wait for deployment. Open the production **`/admin/`** URL, authorize your GitHub account and confirm both documents appear under **BrightLink website**.

Make a reversible description edit, publish, wait for a successful Pages build and refresh the public site. Restore the test value afterward. This real hosted login/publish test remains necessary; automated mocks do not substitute for your account setup.

If authentication fails, compare the OAuth Redirect URI, `SITE_ORIGIN`, backend `base_url`, repository, scope and editor username. They must belong to this BrightLink deployment. The admin-only CSP includes the compatibility permission required by the pinned Decap bundle; the public site keeps a stricter policy.

## On-site contact form: send to brightlinkcle@gmail.com

The call, text and email-app buttons work without an email API. The **on-site form** needs these settings before it can send. It is disabled until both the public Turnstile key and server configuration are present, so it never pretends an unsent inquiry succeeded.

### 1. Configure Resend

1. Create/use a Resend account and verify a domain you control, such as your BrightLink domain.
2. Add Resend’s required sending-domain DNS records without removing existing email records.
3. Create a sending API key, scoped to your verified domain where supported.
4. Choose a verified sender, for example `BrightLink <website@YOUR-VERIFIED-DOMAIN>`.
5. Keep **`brightlinkcle@gmail.com` as the recipient**. Gmail is the destination, not a verified sender address.

### 2. Configure Cloudflare Turnstile

1. Create a Turnstile widget in your Cloudflare account.
2. Allow the exact production Pages hostname and any custom public hostname you will use.
3. Put the **public site key** in CMS under **Page content & contact → Form → Turnstile site key**, or edit `site.json`.
4. Put the **secret key** only in Cloudflare’s server secrets.

The backend validates the widget’s token, hostname and `contact` action. The widget and server-side verification must both be configured.

### 3. Set contact variables

| Name | Value | Type |
| --- | --- | --- |
| `RESEND_API_KEY` | Sending API key | Secret |
| `CONTACT_FROM` | Verified sender, e.g. `BrightLink <website@YOUR-VERIFIED-DOMAIN>` | Variable |
| `CONTACT_TO` | `brightlinkcle@gmail.com` | Variable |
| `TURNSTILE_SECRET_KEY` | Matching Turnstile secret | Secret |
| `CONTACT_ALLOWED_ORIGINS` | Exact public HTTPS origins, comma-separated, no trailing slashes | Variable |

Set allowed origins to the actual Pages and/or custom-domain origins where the public form will run. They are separate from the CMS-only `SITE_ORIGIN`, so your public domain and editor domain can differ.

Redeploy, send a **real test from your own browser**, and verify receipt in Gmail. A successful form response means the email provider accepted the message, not that final inbox delivery is guaranteed. Check spam/provider delivery logs if needed. No real email was sent while producing this package.

The server fixes the destination from `CONTACT_TO`, validates lengths and email fields, bounds request size, checks the exact Origin, uses a honeypot and validates Turnstile. It sends a plain-text breakdown with the customer’s email as Reply-To. The form does not upload attachments; visitors can attach photos using the email button. Provider/Cloudflare quotas still apply; add appropriate hosting-level rate limiting if traffic requires it.

Changing the email displayed in CMS changes the visible email buttons. Changing the actual form-delivery recipient requires updating server variable `CONTACT_TO` as well. Secrets and recipient routing intentionally remain outside public JSON.

## Owner publishing workflow

1. Open your exact `/admin/` bookmark over HTTPS.
2. Sign in with an allowed GitHub account.
3. Open **Page content & contact** or **Service categories & cards**.
4. Make changes, save and publish.
5. Decap commits the JSON/media update to GitHub `main`.
6. Cloudflare runs `npm run build`, validates the content and deploys `dist`.
7. Wait for a successful deployment, then refresh the public page.

The service-group list controls section order. Each group’s item list controls card order. Add, delete or drag entries to reorder; turn visibility off to hide without losing content. New groups need stable unique lowercase IDs. Add navigation links separately in Page content using the group ID as the target. Renaming/deleting a group requires updating all links to it; the build rejects broken anchors.

Concurrent editing: coordinate when editing the same document. CMS saves can conflict; reload the latest content rather than overwriting another editor’s changes. Git history provides rollback. Reverting a commit and redeploying is a content rollback; a hosting rollback alone does not rewrite Git’s current JSON.

## Custom domain / leaving Squarespace

This is an independent hosting package. It does not change your existing Squarespace website or domain. Preview and test on Pages before any DNS cutover.

When ready, add your domain under Pages **Custom domains**, follow Cloudflare’s DNS instructions, preserve existing email records, and set `seo.canonical_url` to the final homepage. Do not add a Squarespace header-hiding CSS rule here: there is no Squarespace shell.

You can keep CMS on the production `.pages.dev/admin/` origin while the public site uses your domain. Keep `backend.base_url`, `SITE_ORIGIN` and GitHub’s Redirect URI on that editor origin. Do not blanket-redirect that hostname away from `/admin/` or `/api/callback`. Add public form hostnames to Turnstile and `CONTACT_ALLOWED_ORIGINS`.

## What the CMS edits

All business/page copy, service groups and cards, service order, headings, descriptions, icon selections, optional photos/alt text, navigation labels/targets, contact labels, visible phone/email, email-app outline, form labels/messages, process steps, hero content, footer, SEO title and description are editable.

The layout, responsive rules and SVG drawing definitions remain developer-owned CSS/JavaScript. This preserves the design. Authentication secrets, repository ownership and delivery routing are deployment settings, not public content fields.

## Official references

- Cloudflare Pages Git integration: https://developers.cloudflare.com/pages/get-started/git-integration/
- Pages Functions: https://developers.cloudflare.com/pages/functions/get-started/
- Pages variables/secrets: https://developers.cloudflare.com/pages/functions/bindings/#secrets
- Decap GitHub backend: https://decapcms.org/docs/github-backend/
- Decap file collections: https://decapcms.org/docs/collection-file/
- Decap list widgets: https://decapcms.org/docs/widgets/list/
- GitHub OAuth: https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps
- Turnstile: https://developers.cloudflare.com/turnstile/get-started/
- Resend email API: https://resend.com/docs/api-reference/emails/send-email

## Approved navy/cyan redesign

This version implements the approved BrightLink preview, including its service-based hero (no imported hero illustration), optimized brand logo, six expanded service cards, connected-home feature, process, FAQs and contact area. Everything visitor-facing that contains business content is sourced from the CMS JSON. See `docs/CONTENT-MODEL.md` and `docs/OWNER-GUIDE.md` for the updated fields.

Deployment settings remain: framework None, production branch `main`, build `npm run build`, output `dist`, root blank. The root `functions/` directory supplies the existing Pages OAuth/contact handlers. Keep the working production environment variables and GitHub OAuth App unchanged.
