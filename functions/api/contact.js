/** Project inquiry delivery. Secrets and recipient are server-only. No open email relay. */
const MAX_BYTES=16384;
function response(body,status=200) {
  return Response.json(body,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
}
function configured(env,request) {
  const origins=(env.CONTACT_ALLOWED_ORIGINS || '').split(',').map(value=>value.trim()).filter(Boolean);
  return Boolean(env.RESEND_API_KEY && env.CONTACT_FROM && env.CONTACT_TO && env.TURNSTILE_SECRET_KEY && origins.includes(new URL(request.url).origin));
}
export async function onRequestGet({env,request}) {
  return response({enabled:configured(env,request)});
}
async function body(request) {
  if(!request.body || Number(request.headers.get('Content-Length'))>MAX_BYTES) throw new Error('Too large');
  const reader=request.body.getReader();const chunks=[];let total=0;
  try {
    while(true) {
      const {value,done}=await reader.read();
      if(done)break;
      total+=value.byteLength;
      if(total>MAX_BYTES) {await reader.cancel();throw new Error('Too large');}
      chunks.push(value);
    }
  } finally {reader.releaseLock();}
  const bytes=new Uint8Array(total);let offset=0;
  for(const chunk of chunks) {bytes.set(chunk,offset);offset+=chunk.byteLength;}
  return JSON.parse(new TextDecoder().decode(bytes));
}
export async function onRequestPost({request,env}) {
  if(!configured(env,request))return response({ok:false,error:'not_configured'},503);
  const origin=new URL(request.url).origin;
  if(request.headers.get('Origin')!==origin)return response({ok:false,error:'origin'},403);
  if(!request.headers.get('Content-Type')?.startsWith('application/json'))return response({ok:false,error:'content_type'},415);
  let data;
  try {data=await body(request);}catch{return response({ok:false,error:'invalid_body'},400);}
  if(!data || typeof data!=='object' || Array.isArray(data))return response({ok:false,error:'invalid_body'},400);
  const fields={name:100,email:254,phone:40,location:160,service:200,timing:160,details:5000,website:200,token:2048};
  for(const [name,limit] of Object.entries(fields)) {
    if(data[name]==null)data[name]='';
    if(typeof data[name]!=='string' || data[name].length>limit)return response({ok:false,error:'invalid_fields'},400);
    data[name]=data[name].trim();
  }
  // Silently drop obvious honeypot submissions without contacting the email provider.
  if(data.website)return response({ok:true});
  if(!data.name || data.details.length<10 || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(data.email) || /[\r\n]/.test(data.email) || !data.token) return response({ok:false,error:'invalid_fields'},400);
  try {
    const verification=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({secret:env.TURNSTILE_SECRET_KEY,response:data.token,remoteip:request.headers.get('CF-Connecting-IP') || undefined}),
      signal:AbortSignal.timeout(10000),
    });
    const result=await verification.json();
    if(!verification.ok || !result.success || result.hostname!==new URL(origin).hostname || result.action!=='contact')return response({ok:false,error:'verification'},400);
    const text=[`Name: ${data.name}`,`Email: ${data.email}`,`Phone: ${data.phone}`,`Location: ${data.location}`,`Service: ${data.service}`,`Preferred timing: ${data.timing}`,'',data.details].join('\n');
    const sent=await fetch('https://api.resend.com/emails',{
      method:'POST',headers:{Authorization:`Bearer ${env.RESEND_API_KEY}`,'Content-Type':'application/json'},
      body:JSON.stringify({from:env.CONTACT_FROM,to:[env.CONTACT_TO],reply_to:data.email,subject:'BrightLink website project inquiry',text}),
      signal:AbortSignal.timeout(15000),
    });
    if(!sent.ok)return response({ok:false,error:'delivery'},502);
    const receipt=await sent.json();
    if(!receipt.id)return response({ok:false,error:'delivery'},502);
    return response({ok:true});
  } catch {return response({ok:false,error:'delivery'},502);}
}
