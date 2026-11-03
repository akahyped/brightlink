# Editing BrightLink without code

## Sign in

Visit your production `/admin/` address and sign in with your authorized GitHub account. You must be both on the editor allowlist and able to write to the BrightLink repository.

## Change page details

Open **BrightLink website → Page content & contact**.

- **Brand / Navigation / Header button:** update labels; link targets are section IDs without `#`.
- **Hero:** edit each headline line and its optional emphasized text, introduction, buttons, illustration captions or optional replacement photo.
- **Service strip:** add/remove/reorder the short service labels.
- **Approach:** edit the heading and add/remove/reorder process steps.
- **Contact:** update visible phone/email, call/text buttons, project checklist and the email-app subject/outline.
- **Form:** show/hide the form, edit labels, success/error text and the public Turnstile key.
- **Footer / SEO / UI:** update footer wording, search description and accessible labels.

For a normal all-italic word at the end of a headline, put the lead-in under Text and the final word under Emphasized text. Empty emphasized text is allowed.

## Change services and handyman cards

Open **Service categories & cards**.

- Each group is a website section. The initial groups are `services` and `handyman`.
- Expand a group to edit its eyebrow, heading and description.
- Expand an item to change its title, description, icon, optional photograph and optional link.
- Add/delete list entries using Decap controls. Drag entries to reorder.
- Turn **Visible** off to hide content without deleting it.
- New IDs must be unique across all groups and items, lowercase, and hyphenated.
- Add links to a new group under the page’s Navigation list; target its exact ID.
- Before deleting or renaming a group, retarget existing navigation and buttons. Broken links stop the build.
- Photos need descriptive alt text. Leave Photo blank to keep the icon-only card style.

Headings support line breaks in their text field. Descriptions are plain text; markup is not interpreted as HTML.

## Publish

Save/publish, wait for the Cloudflare deployment to succeed, then refresh your website. Publishing is not instantaneous. If a build fails, the last successful deployment remains live; correct the validation error before publishing again.

## Contact form

Changing form wording does not require code. Actual delivery needs deployment settings; see README. The visible contact email and server delivery recipient are configured separately for security. Call/text/email-app buttons continue working if the on-site form is disabled or not configured.

## Recover a mistake

Undo the text in Decap and publish again, or ask the repository owner to revert the relevant Git commit and redeploy. Coordinate when editing the same document so you do not overwrite someone else’s work.
