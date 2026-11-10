# BrightLink content model

`public/data/site.json` controls branding, logo, SEO, navigation, both hero columns, service ribbon, connected-home feature, process, local-area copy, FAQs, contact details, form messages and footer.

`public/data/services.json` controls service sections and cards. The approved launch has one `services` section with six detailed cards. Each has a stable ID, title, tagline, description, editable bullet list, icon, visibility switch, optional photo/alt text and inquiry link. Add, remove or reorder cards and bullets in Decap; numbering is automatic. Sections can also be added and reordered.

Matching `*.schema.json` files power shared validation in the build, browser and CMS. `/admin/config.yml` exposes matching nested fields. Keep schema, validation and editor fields in sync when changing the model.

Use anchor IDs without `#` in navigation targets. Supported built-ins are `home`, `services`, `approach`, `questions`, `contact`, plus existing section and card IDs. Keep the `services` section ID stable because the page uses it as the service overview and as a fallback when a featured card is removed. `service-options`, `handyman` and `electrical` remain as legacy anchors.

Hero service tiles point to individual card IDs. If that card is hidden or removed, its tile links to the overall services section. Update the tile wording or target when replacing a featured service.

Business content is escaped before rendering. Image values must be safe local paths or HTTPS URLs. Uploaded service photos require descriptive alt text. Icon names are selected from developer-owned SVG artwork, rather than accepting arbitrary markup.

`public/assets/js/render.js` is the shared renderer for browser refreshes and build-generated HTML. Never edit business text directly in `templates/index.html` or `dist/index.html`. CSS, SVG artwork, security policies and OAuth handlers are developer-maintained source, separate from CMS content.
