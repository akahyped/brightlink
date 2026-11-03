import { validateSite, validateServices, validateAnchors } from './model.js';
import { renderSite } from './render.js';
import { setupContactForm } from './contact.js';

async function json(path) {
  const response=await fetch(path,{cache:'no-cache'});
  if (!response.ok) throw new Error(`Could not load ${path}.`);
  return response.json();
}
async function start() {
  try {
    const [rawSite,rawServices,siteSchema,servicesSchema]=await Promise.all([
      json('/data/site.json'),json('/data/services.json'),json('/data/site.schema.json'),json('/data/services.schema.json'),
    ]);
    const site=validateSite(rawSite,siteSchema);
    const services=validateServices(rawServices,servicesSchema);
    validateAnchors(site,services);
    // All text is escaped by the shared template, and every URL is validated.
    document.querySelector('#site-root').innerHTML=renderSite(site,services);
    document.title=site.seo.title;
    document.documentElement.lang=site.seo.language;
    document.querySelector('meta[name="description"]').content=site.seo.description;
    setupContactForm(site);
    try { if(location.hash) document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView(); } catch { /* Ignore malformed anchors. */ }
  } catch(error) {
    // The complete build-generated page remains usable if runtime JSON requests fail.
    console.warn('Showing the published content snapshot.',error);
  }
}
start();
