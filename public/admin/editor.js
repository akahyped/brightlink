import { validateSite, validateServices } from '/assets/js/model.js';
async function start() {
  if(!window.isSecureContext)throw new Error('Open this editor over HTTPS on the configured production hostname.');
  for(let attempt=0;!window.CMS && attempt<300;attempt++)await new Promise(resolve=>setTimeout(resolve,100));
  if(!window.CMS)throw new Error('The editor could not load. Check your connection and reload.');
  const schemas=await Promise.all(['site','services'].map(async name=>{
    const response=await fetch(`/data/${name}.schema.json`,{cache:'no-cache'});
    if(!response.ok)throw new Error('The editor validation rules could not load.');
    return response.json();
  }));
  window.CMS.registerEventListener({name:'preSave',handler:({entry})=>{
    const data=entry.get('data').toJS();
    if(Object.hasOwn(data,'groups'))validateServices(data,schemas[1]);
    else validateSite(data,schemas[0]);
  }});
  window.CMS.init();
}
start().catch(error=>{document.body.textContent=error.message;});
