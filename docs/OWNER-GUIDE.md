# Editing BrightLink

1. Open https://brightlinkcle.com/admin/ and sign in with your authorized GitHub account.
2. Open **BrightLink website**.
3. Choose **Page content, branding & contact** for page text, logo, navigation, hero showcase, connected-home section, process, FAQs, phone/email, form and SEO details.
4. Choose **Services, descriptions & bullet lists** to edit service cards, descriptions, taglines, bullet lists, icons, photos or visibility. Expand Groups, then Items. Drag items or bullets to reorder them. Add or delete entries as needed. Card numbers update automatically.
5. Keep IDs stable and unique. Add navigation targets without `#`. Keep the main services section ID as `services`.
6. Publish. Decap saves a GitHub commit; Cloudflare Pages builds and publishes the new content. Wait for deployment before refreshing the public page.

The page is generated from the same JSON used in the editor. Text remains readable even if runtime content requests fail. The approved logo is a separate optimized image; the removed hero illustration is not used.

The contact form remains disabled until the existing Turnstile and email-delivery settings are configured. Call, text and email links work independently. Never put API keys, OAuth secrets or the Turnstile secret into CMS fields.

For recovery, correct the content in the editor or revert the relevant GitHub commit. Before local development after CMS publishing, pull the latest repository changes.
