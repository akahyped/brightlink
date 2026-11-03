/** Enable real on-site delivery only after both the public widget and server are configured. */
export async function setupContactForm(site) {
  const form=document.querySelector('#contact-form');
  if(!form) return;
  const status=form.querySelector('#form-status');
  const button=form.querySelector('#inquiry-submit');
  let ready=false;
  let widget;
  // Never permit a plain browser POST to show a misleading JSON success screen.
  form.addEventListener('submit',async event=>{
    event.preventDefault();
    if(!ready) { status.textContent=site.form.not_configured_message;return; }
    if(!form.reportValidity()) return;
    const token=window.turnstile?.getResponse(widget);
    if(!token) { status.textContent=site.form.error_message;return; }
    button.disabled=true;
    button.textContent=site.form.sending_label;
    status.textContent='';
    const data=Object.fromEntries(new FormData(form));
    data.token=token;
    try {
      const response=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
      const payload=await response.json();
      if(!response.ok || !payload.ok) throw new Error('Delivery failed');
      status.textContent=site.form.success_message;
      form.reset();
    } catch { status.textContent=site.form.error_message; }
    finally {
      button.textContent=site.form.submit_label;
      button.disabled=false;
      window.turnstile?.reset(widget);
    }
  });
  if(!site.form.turnstile_site_key) return;
  try {
    const config=await fetch('/api/contact',{cache:'no-store'}).then(response=>response.json());
    if(!config.enabled) return;
    await new Promise((resolve,reject)=>{
      const script=document.createElement('script');
      script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async=true;script.onload=resolve;script.onerror=reject;
      document.head.append(script);
    });
    widget=window.turnstile.render('#turnstile-widget',{sitekey:site.form.turnstile_site_key,action:'contact'});
    ready=true;button.disabled=false;status.textContent='';
  } catch { status.textContent=site.form.not_configured_message; }
}
