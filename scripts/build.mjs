import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { check } from './check.mjs';
import { escapeHTML as e } from '../public/assets/js/model.js';
const root=new URL('../',import.meta.url);
const {site,html}=await check();
const output=new URL('dist/',root);
await rm(output,{recursive:true,force:true});await mkdir(output,{recursive:true});
await cp(new URL('public/',root),output,{recursive:true});
const canonical=site.seo.canonical_url;
const meta=(property,value)=>`<meta property="${property}" content="${e(value)}">`;
const image=site.seo.social_image.startsWith('/') && canonical?new URL(site.seo.social_image,canonical).href:site.seo.social_image;
const seo=[meta('og:type','website'),meta('og:title',site.seo.title),meta('og:description',site.seo.description),...(canonical?[`<link rel="canonical" href="${e(canonical)}">`,meta('og:url',canonical)]:[]),...(image.startsWith('https:')?[meta('og:image',image)]:[])].join('\n    ');
const businessId=canonical+'#business';
const structuredData={ '@context':'https://schema.org', '@graph':[
  {'@type':'HomeAndConstructionBusiness','@id':businessId,name:site.brand.name+' '+site.brand.subtitle,url:canonical,telephone:site.contact.phone_number,email:site.contact.email,description:site.seo.description,areaServed:{'@type':'City',name:'Cleveland',containedInPlace:{'@type':'State',name:'Ohio'}}},
  ...site.experience.categories.map(category=>({'@type':'Service',name:category.title,description:category.description,url:canonical+'#'+category.target,provider:{'@id':businessId},areaServed:'Cleveland, Ohio'}))
]};
const jsonLD=JSON.stringify(structuredData).replace(/</g,'\\u003c');
const values={LANGUAGE:e(site.seo.language),TITLE:e(site.seo.title),DESCRIPTION:e(site.seo.description),SEO:seo+`\n    <script type="application/ld+json">${jsonLD}</script>`,CONTENT:html};
const template=await readFile(new URL('templates/index.html',root),'utf8');
await writeFile(new URL('index.html',output),template.replace(/\{\{(LANGUAGE|TITLE|DESCRIPTION|SEO|CONTENT)\}\}/g,(_,key)=>values[key]));
await writeFile(new URL('robots.txt',output),`User-agent: *\nDisallow: /admin/\nDisallow: /api/\n${canonical?`Sitemap: ${new URL('sitemap.xml',canonical).href}\n`:''}`);
if(canonical)await writeFile(new URL('sitemap.xml',output),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${e(canonical)}</loc></url></urlset>\n`);
console.log('Built dist/ from BrightLink JSON. Cloudflare Pages uses the root functions/ directory automatically.');

