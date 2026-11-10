/** Shared content validation used before publishing, during builds, and in the browser. */
export const ICONS = ['tv', 'home', 'wifi', 'camera', 'audio', 'tools', 'shelf', 'window', 'door', 'paint', 'outlet', 'faucet'];
export function escapeHTML(value = '') {
  return String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[character]);
}
export function safePhoto(value) {
  if (!value || /[\\\s\u0000-\u001f]/.test(value)) return '';
  if (value.startsWith('/') && !value.startsWith('//') && !value.includes('..') && !/%2e|%2f/i.test(value)) return value;
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password ? url.href : ''; }
  catch { return ''; }
}
export function validateDocument(input, schema) {
  function walk(value, rule, path) {
    if ('const' in rule) {
      if (value !== rule.const) throw new Error(`Unsupported ${path}.`);
      return value;
    }
    if (rule.type === 'object') {
      if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${path} must be an object.`);
      for (const key of Object.keys(value)) if (!Object.hasOwn(rule.properties, key)) throw new Error(`Unknown field ${path}.${key}.`);
      return Object.fromEntries(Object.entries(rule.properties).map(([key, child]) => {
        let next = value[key];
        if (next == null && !rule.required.includes(key)) next = child.type === 'array' ? [] : '';
        return [key, walk(next, child, `${path}.${key}`)];
      }));
    }
    if (rule.type === 'array') {
      if (!Array.isArray(value)) throw new Error(`${path} must be a list.`);
      return value.map((entry, index) => walk(entry, rule.items, `${path}[${index}]`));
    }
    if (typeof value !== rule.type) throw new Error(`${path} must be ${rule.type}.`);
    if (rule.enum && !rule.enum.includes(value)) throw new Error(`Invalid choice for ${path}.`);
    return value;
  }
  return walk(input, schema, 'Content');
}
const slug = value => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
export function validateServices(input, schema) {
  const services = validateDocument(input, schema);
  const ids = new Set(['home','approach','contact','contact-form','site-root','form-status','questions','service-options','handyman','electrical','navigation','selected-project']);
  for (const group of services.groups) {
    if (!slug(group.id) || ids.has(group.id) || !group.heading.trim()) throw new Error('Each service group needs a unique anchor ID and heading.');
    ids.add(group.id);
    for (const item of group.items) {
      if (!slug(item.id) || ids.has(item.id) || !item.title.trim()) throw new Error('Each service needs a unique ID and title.');
      ids.add(item.id);
      if (item.photo && (!safePhoto(item.photo) || !item.photo_alt.trim())) throw new Error('Service photos need a safe URL and descriptive alt text.');
    }
  }
  return services;
}
export function validateSite(input, schema) {
  const site = validateDocument(input, schema);
  if (!site.brand.name.trim() || !site.seo.title.trim() || !site.hero.heading_lines.length) throw new Error('Brand, page title and hero headline are required.');
  if (!/^\+?[0-9 ()-]{7,25}$/.test(site.contact.phone_number)) throw new Error('Invalid dialing number.');
  if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(site.contact.email)) throw new Error('Invalid contact email.');
  if (!/^[a-z]{2,3}(?:-[a-zA-Z]{2,8})?$/.test(site.seo.language)) throw new Error('Use a language code such as en.');
  if (site.seo.canonical_url) {
    const url = new URL(site.seo.canonical_url);
    if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) throw new Error('Canonical must be a public HTTPS page URL without query or fragment.');
  }
  if (site.brand.logo && (!safePhoto(site.brand.logo) || !site.brand.logo_alt.trim())) throw new Error('Brand logos need safe URLs and alt text.');
  if (site.seo.social_image && !safePhoto(site.seo.social_image)) throw new Error('Invalid social image URL.');
  if (site.form.turnstile_site_key && !/^[\w-]{10,100}$/.test(site.form.turnstile_site_key)) throw new Error('Invalid public Turnstile site key.');
  return site;
}
export function validateAnchors(site, services) {
 const anchors=new Set(['home','approach','contact','service-options','questions','handyman','electrical',...services.groups.map(g=>g.id),...services.groups.flatMap(g=>g.items.map(i=>i.id))]);
 for(const target of [...site.navigation.map(i=>i.target),site.hero_showcase.link_target,site.header_button.target,site.hero.primary_target,site.hero.secondary_target,...services.groups.flatMap(g=>g.items.filter(i=>i.link_label).map(i=>i.link_target))]) {
  if(!anchors.has(target)) throw new Error(`Unknown navigation anchor: ${target}`);
 }
}
