import test from 'node:test';
import assert from 'node:assert/strict';
import { onRequestGet, onRequestPost } from '../functions/api/contact.js';
const env={CONTACT_ALLOWED_ORIGINS:'https://brightlink.example',RESEND_API_KEY:'test-only',CONTACT_FROM:'BrightLink <website@brightlink.example>',CONTACT_TO:'brightlinkcle@gmail.com',TURNSTILE_SECRET_KEY:'test-only'};
const data={name:'Example Customer',email:'customer@example.com',phone:'',location:'Cleveland',service:'TV mounting',timing:'Next week',details:'Please mount a 65-inch television.',website:'',token:'test-token'};
const request=(input=data,origin='https://brightlink.example')=>new Request('https://brightlink.example/api/contact',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify(input)});
test('form stays unavailable without required server configuration',async()=>{
  assert.deepEqual(await (await onRequestGet({request:new Request('https://brightlink.example/api/contact'),env:{}})).json(),{enabled:false});
  assert.equal((await onRequestPost({request:request(),env:{}})).status,503);
});
test('cross-origin, oversized and invalid submissions are rejected before delivery',async()=>{
  assert.equal((await onRequestPost({request:request(data,'https://evil.example'),env})).status,403);
  assert.equal((await onRequestPost({request:request({...data,details:'x'.repeat(20000)}),env})).status,400);
  assert.equal((await onRequestPost({request:request({...data,email:'bad\r\nemail'}),env})).status,400);
});
test('valid inquiries verify Turnstile hostname/action and send only to the server recipient',async()=>{
  const original=globalThis.fetch;let success=true;let emailBody;
  globalThis.fetch=async(url,options)=>{
    if(url.includes('siteverify'))return Response.json({success,hostname:'brightlink.example',action:'contact'});
    if(url==='https://api.resend.com/emails'){emailBody=JSON.parse(options.body);return Response.json({id:'mock-receipt'});}
    throw new Error('Unexpected network');
  };
  try{
    let result=await onRequestPost({request:request({...data,to:'attacker@example.com'}),env});
    assert.equal(result.status,200);assert.deepEqual(emailBody.to,['brightlinkcle@gmail.com']);assert.equal(emailBody.reply_to,data.email);assert.ok(emailBody.text.includes(data.details));
    success=false;emailBody=null;
    result=await onRequestPost({request:request(),env});assert.equal(result.status,400);assert.equal(emailBody,null);
  }finally{globalThis.fetch=original;}
});
test('email-provider rejection never reports a successful submission',async()=>{
  const original=globalThis.fetch;
  globalThis.fetch=async url=>url.includes('siteverify')?Response.json({success:true,hostname:'brightlink.example',action:'contact'}):Response.json({error:'failed'},{status:500});
  try{const result=await onRequestPost({request:request(),env});assert.equal(result.status,502);assert.equal((await result.json()).ok,false);}
  finally{globalThis.fetch=original;}
});
