/** Consolidate the public homepage; keep API and CMS routes unchanged. */
export function onRequest(context) {
  const url=new URL(context.request.url);
  if(url.hostname==='www.brightlinkcle.com') {
    url.hostname='brightlinkcle.com';url.protocol='https:';
    return Response.redirect(url.href,301);
  }
  return context.next();
}
