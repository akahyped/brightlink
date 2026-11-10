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
  finally { setupInteractions(); }
}
start();

function setupInteractions() {
 const menu=document.querySelector('.menu'),nav=document.querySelector('.navlinks');
 const close=()=>{menu?.setAttribute('aria-expanded','false');nav?.classList.remove('open');};
 menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav.classList.toggle('open',open);});
 nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',close));
 document.addEventListener('keydown',event=>{if(event.key==='Escape')close();});
 const selected=document.querySelector('#selected-project'),sms=document.querySelector('#text-project');
 const base=sms?.getAttribute('href');
 document.querySelectorAll('[data-service]').forEach(a=>a.addEventListener('click',()=>{
  const service=a.dataset.service;
  if(selected)selected.textContent=selected.dataset.label+' '+service;
  if(sms)sms.href=base+'?body='+encodeURIComponent(service);
  const field=document.querySelector('#inquiry-service');if(field)field.value=service;
 }));
}
