# BrightLink JSON content model

## `public/data/site.json`

Top-level objects:

- `schema_version`: internal format version, fixed at 1.
- `seo`: title, description, language, optional canonical URL and social image.
- `brand`: name, punctuation and subtitle.
- `navigation`: ordered list of `{label, target}` anchor links.
- `header_button`: anchor label and target.
- `hero`: ordered headline lines with optional emphasized fragments, description, buttons and image/illustration content.
- `service_strip`: ordered text entries.
- `approach`: eyebrow, heading and ordered process-step headings/descriptions.
- `contact`: content, phone, email, checklist and email-app outline.
- `form`: enable switch, all visible labels/messages and public Turnstile site key.
- `footer`: wordmark, description and back-to-top wording.
- `ui`: interface/accessibility labels.

## `public/data/services.json`

```json
{
  "schema_version": 1,
  "groups": [
    {
      "id": "services",
      "eyebrow": "What we can help with",
      "heading": "Small upgrades.\nA better everyday.",
      "description": "Practical help for your home.",
      "visible": true,
      "items": [
        {
          "id": "services-tv",
          "title": "TV mounting",
          "description": "Secure TV installation and cable management.",
          "icon": "tv",
          "visible": true,
          "photo": "",
          "photo_alt": "",
          "link_label": "",
          "link_target": "contact"
        }
      ]
    }
  ]
}
```

Array order controls display order. Group IDs become section anchors. Item IDs become card anchors and must also be unique. No markup or scripts are permitted as executable content.

Icon choices: `tv`, `home`, `wifi`, `camera`, `audio`, `tools`, `shelf`, `window`, `door`, `paint`, `outlet`, `faucet`.

CMS files are the source of truth. The build and browser share validators and renderer. Public JSON schemas describe structure; semantic validation also checks duplicate IDs, anchor references, dialing/email fields and photo alt text. Editable content is not stored in HTML.
