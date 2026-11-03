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

test('all BrightLink content validates, with twelve approved service cards',()=>{
  validateSite(site,siteSchema);validateServices(services,servicesSchema);validateAnchors(site,services);
  assert.equal(services.groups.reduce((sum,g)=>sum+g.items.length,0),12);
  assert.equal(site.contact.phone_display,'440-719-9436');
  assert.equal(site.contact.email,'brightlinkcle@gmail.com');
});
test('add, edit, reorder and delete service cards without changing templates',()=>{
  const copy=structuredClone(services);
  copy.groups[0].items.push({...copy.groups[0].items[0],id:'extra-service',title:'New service'});
  copy.groups[0].items.reverse();
  copy.groups[1].items.splice(0,1);
  const valid=validateServices(copy,servicesSchema);
  const html=renderSite(site,valid);
  assert.ok(html.indexOf('id="extra-service"')<html.indexOf('id="services-tv"'));
  assert.ok(!html.includes('id="handyman-shelf"'));
});
test('hidden groups/cards disappear while anchor targets remain valid',()=>{
  const copy=structuredClone(services);copy.groups[0].visible=false;copy.groups[1].items[0].visible=false;
  const html=renderSite(site,validateServices(copy,servicesSchema));
  assert.ok(html.includes('id="services" hidden'));
  assert.ok(!html.includes('id="services-tv"'));
  assert.ok(!html.includes('id="handyman-shelf"'));
});
test('malformed content, duplicate IDs, unsafe photos and unknown anchors fail validation',()=>{
  const duplicate=structuredClone(services);duplicate.groups[1].items[0].id=duplicate.groups[0].items[0].id;
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
  assert.equal((html.match(/class="service-icon"/g)||[]).length,12);
  assert.equal((html.match(/<svg /g)||[]).length,12);
});
test('cleared optional fields normalize without modifying the submitted document',()=>{
  const copy=structuredClone(site);delete copy.hero.photo;delete copy.hero.heading_lines[0].emphasized_text;delete copy.service_strip;
  const valid=validateSite(copy,siteSchema);assert.equal(valid.hero.photo,'');assert.deepEqual(valid.service_strip,[]);assert.equal(copy.hero.photo,undefined);
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
