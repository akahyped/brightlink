import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validateSite, validateServices, validateAnchors, safePhoto } from '../public/assets/js/model.js';
import { renderSite } from '../public/assets/js/render.js';
const json=async path=>JSON.parse(await readFile(new URL(path,import.meta.url),'utf8'));
const site=await json('../public/data/site.json');
const services=await json('../public/data/services.json');
const siteSchema=await json('../public/data/site.schema.json');
const servicesSchema=await json('../public/data/services.schema.json');

test('all BrightLink content validates, with six expanded service cards',()=>{
  validateSite(site,siteSchema);validateServices(services,servicesSchema);validateAnchors(site,services);
  assert.equal(services.groups.reduce((sum,g)=>sum+g.items.length,0),6);
  assert.equal(site.contact.phone_display,'440-719-9436');
  assert.equal(site.contact.email,'brightlinkcle@gmail.com');
});
test('add, edit, reorder and delete service cards without changing templates',()=>{
  const copy=structuredClone(services);
  copy.groups[0].items.push({...copy.groups[0].items[0],id:'extra-service',title:'New service'});
  copy.groups[0].items.reverse();
  copy.groups[0].items = copy.groups[0].items.filter(i=>i.id!=='handyman-shelf');
  const valid=validateServices(copy,servicesSchema);
  const html=renderSite(site,valid);
  assert.ok(html.indexOf('id="extra-service"')<html.indexOf('id="services-tv"'));
  assert.ok(!html.includes('id="handyman-shelf"'));
});
test('hidden groups/cards disappear while anchor targets remain valid',()=>{
  const copy=structuredClone(services);copy.groups[0].visible=false;
  const html=renderSite(site,validateServices(copy,servicesSchema));
  assert.ok(html.includes('id="services" hidden'));
  assert.ok(!html.includes('id="services-tv"'));
  assert.ok(!html.includes('id="handyman-shelf"'));
});
test('malformed content, duplicate IDs, unsafe photos and unknown anchors fail validation',()=>{
  const duplicate=structuredClone(services);duplicate.groups[0].items[1].id=duplicate.groups[0].items[0].id;
  assert.throws(()=>validateServices(duplicate,servicesSchema));
  const badIcon=structuredClone(services);badIcon.groups[0].items[0].icon='<script>';
  assert.throws(()=>validateServices(badIcon,servicesSchema));
  const badLink=structuredClone(site);badLink.header_button.target='https://evil.example';
  assert.throws(()=>validateAnchors(badLink,services));
  const badEmail=structuredClone(site);badEmail.contact.email='a@example.com\r\nBcc: other@example.com';
  assert.throws(()=>validateSite(badEmail,siteSchema));
  for(const value of ['javascript:alert(1)','//evil.example/image','/../private','/photo\\image','data:image/svg+xml,bad'])assert.equal(safePhoto(value),'');
});
test('all CMS content is escaped, including names and image attributes',()=>{
  const copy=structuredClone(site);copy.hero.description='<script>alert(1)</script>';copy.brand.name='"><img src=x>';
  const html=renderSite(validateSite(copy,siteSchema),services);
  assert.ok(html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
  assert.ok(!html.includes('<img src=x>'));
});
test('every navigation link targets the same page; each service has a decorative SVG',()=>{
  const html=renderSite(site,services);
  for(const nav of html.matchAll(/<nav\b[^>]*>([\s\S]*?)<\/nav>/g))for(const href of nav[1].matchAll(/href="([^"]+)"/g))assert.ok(href[1].startsWith('#'));
  assert.equal((html.match(/<article class="service"/g)||[]).length,6);
  for(const card of html.matchAll(/<article class="service"[\s\S]*?<\/article>/g)) assert.ok(card[0].includes('<svg '));
});
test('cleared optional fields normalize without modifying the submitted document',()=>{
  const copy=structuredClone(site);delete copy.brand.logo;delete copy.hero.heading_lines[0].emphasized_text;delete copy.service_strip;
  const valid=validateSite(copy,siteSchema);assert.equal(valid.brand.logo,'');assert.deepEqual(valid.service_strip,[]);assert.equal(copy.brand.logo,undefined);
});
test('contact form is honest about missing delivery configuration and can be disabled in CMS',()=>{
  assert.ok(renderSite(site,services).includes('type="submit" disabled'));
  const copy=structuredClone(site);copy.form.enabled=false;
  assert.ok(!renderSite(copy,services).includes('id="contact-form"'));
});
test('source HTML contains no hardcoded business or service content',async()=>{
  const html=await readFile(new URL('../templates/index.html',import.meta.url),'utf8');
  assert.ok(html.includes('{{CONTENT}}'));assert.ok(!html.includes('440-719'));assert.ok(!html.includes('TV mounting'));
});

test('deleting or hiding a featured service leaves hero links pointing to a valid section',()=>{
  for(const mode of ['delete','hide']) {
    const copy=structuredClone(services);
    if(mode==='delete')copy.groups[0].items=copy.groups[0].items.filter(i=>i.id!=='services-tv');
    else copy.groups[0].items.find(i=>i.id==='services-tv').visible=false;
    validateAnchors(site,copy);
    const html=renderSite(site,validateServices(copy,servicesSchema));
    const hero=html.slice(0,html.indexOf('class="ribbon"'));
    assert.ok(!hero.includes('href="#services-tv"'));
    assert.ok(hero.includes('href="#services"'));
  }
});

test('service bullet lists are editable, reorderable and escaped',()=>{
 const copy=structuredClone(services);
 copy.groups[0].items[0].bullets=[{text:'Second detail'},{text:'<img src=x onerror=alert(1)>'}];
 const html=renderSite(site,validateServices(copy,servicesSchema));
 assert.ok(html.includes('<li>Second detail</li>'));
 assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt;'));
 assert.ok(!html.includes('TV and Samsung Frame mounting'));
});
