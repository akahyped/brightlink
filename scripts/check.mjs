import { readFile, stat } from 'node:fs/promises';
import { validateSite, validateServices, validateAnchors, safePhoto } from '../public/assets/js/model.js';
import { renderSite } from '../public/assets/js/render.js';
const root=new URL('../',import.meta.url);
const json=async path=>JSON.parse(await readFile(new URL(path,root),'utf8'));
export async function check() {
  const site=validateSite(await json('public/data/site.json'),await json('public/data/site.schema.json'));
  const services=validateServices(await json('public/data/services.json'),await json('public/data/services.schema.json'));
  validateAnchors(site,services);
  const html=renderSite(site,services);
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
  if(ids.length!==new Set(ids).size)throw new Error('Duplicate page IDs.');
  for(const match of html.matchAll(/href="#([^"]+)"/g))if(!ids.includes(match[1]))throw new Error(`Missing page anchor ${match[1]}`);
  const photos=[site.brand.logo,site.seo.social_image,...services.groups.flatMap(group=>group.items.map(item=>item.photo))];
  for(const path of photos.map(safePhoto).filter(path=>path.startsWith('/')))await stat(new URL(`public${path}`,root));
  for(const file of ['public/admin/config.yml','public/assets/css/styles.css','public/assets/images/favicon.png','functions/api/auth.js','functions/api/callback.js','functions/api/contact.js'])await stat(new URL(file,root));
  console.log(`Validated BrightLink page content, ${services.groups.length} categories and ${services.groups.reduce((sum,g)=>sum+g.items.length,0)} service cards.`);
  return {site,services,html};
}
if(process.argv[1] && new URL(process.argv[1],'file:').href===import.meta.url)await check();
