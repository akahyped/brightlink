import { escapeHTML as e, safePhoto } from './model.js';
import { icon } from './icons.js';
const lines = value => e(value).replace(/\r?\n/g, '<br>');
const link = (label,target,className='') => `<a class="${className}" href="#${e(target)}">${e(label)}</a>`;
const number = site => site.contact.phone_number.replace(/[^+0-9]/g,'');
function contactForm(site, services) {
  const f=site.form;
  if (!f.enabled) return '';
  const options=services.groups.filter(group=>group.visible).flatMap(group=>group.items.filter(item=>item.visible));
  return `<div class="form-area">
    <h3>${e(f.heading)}</h3><p>${e(f.description)}</p><p class="note">${e(site.ui.required_note)}</p>
    <form id="contact-form" action="/api/contact" method="post">
      <div class="form-grid">
        <div><label for="inquiry-name">${e(f.name_label)} *</label><input id="inquiry-name" name="name" autocomplete="name" maxlength="100" required></div>
        <div><label for="inquiry-email">${e(f.email_label)} *</label><input id="inquiry-email" name="email" type="email" autocomplete="email" maxlength="254" required></div>
        <div><label for="inquiry-phone">${e(f.phone_label)}</label><input id="inquiry-phone" name="phone" type="tel" autocomplete="tel" maxlength="40"></div>
        <div><label for="inquiry-location">${e(f.location_label)}</label><input id="inquiry-location" name="location" autocomplete="address-level2" maxlength="160"></div>
      </div>
      <label for="inquiry-service">${e(f.service_label)}</label>
      <select id="inquiry-service" name="service"><option value="">${e(f.service_placeholder)}</option>${options.map(item=>`<option value="${e(item.title)}">${e(item.title)}</option>`).join('')}</select>
      <label for="inquiry-timing">${e(f.timing_label)}</label><input id="inquiry-timing" name="timing" maxlength="160">
      <label for="inquiry-details">${e(f.details_label)} *</label><textarea id="inquiry-details" name="details" required minlength="10" maxlength="5000" placeholder="${e(f.details_placeholder)}"></textarea>
      <div class="honeypot" aria-hidden="true"><label for="inquiry-website">Website</label><input id="inquiry-website" name="website" tabindex="-1" autocomplete="off"></div>
      <div id="turnstile-widget"></div>
      <button class="button" id="inquiry-submit" type="submit" disabled>${e(f.submit_label)}</button>
      <p class="note" id="form-status" role="status" aria-live="polite">${e(f.not_configured_message)}</p>
      <p class="note">${e(f.privacy_note)}</p>
    </form>
  </div>`;
}

export function renderSite(site, services) {
 const c=site.contact, h=site.hero_showcase, f=site.feature, ex=site.experience;
 const visibleItems=services.groups.filter(g=>g.visible).flatMap(g=>g.items.filter(i=>i.visible));
 const target = value => visibleItems.some(i=>i.id===value) || services.groups.some(g=>g.visible && g.id===value) ? value : 'services';
 const emailURL=`mailto:${c.email}?${new URLSearchParams({subject:c.email_subject,body:c.email_outline})}`;
 let cardNumber=0;
 return `<a class="skip" href="#services">${e(site.ui.skip_label)}</a>
 <header><nav class="wrap" aria-label="${e(site.ui.navigation_label)}">
 <a href="#home" class="brand" aria-label="${e(site.brand.name+' '+site.brand.subtitle)}">${site.brand.logo?`<img class="logo" src="${e(safePhoto(site.brand.logo))}" alt="${e(site.brand.logo_alt)}" width="650" height="217">`:`<strong>${e(site.brand.name)}</strong><small>${e(site.brand.subtitle)}</small>`}</a>
 <button class="menu" type="button" aria-expanded="false" aria-controls="navigation">${e(site.ui.menu_label)}</button>
 <div class="navlinks" id="navigation">${site.navigation.map(i=>link(i.label,i.target)).join('')}${link(site.header_button.label,site.header_button.target,'button')}</div></nav></header>
 <main><div class="hero" id="home"><div class="wrap hero-grid"><div>
 <p class="eyebrow">${e(site.hero.eyebrow)}</p><h1>${site.hero.heading_lines.map(l=>e(l.text)+(l.emphasized_text?`<em>${e(l.emphasized_text)}</em>`:'')).join('<br>')}</h1>
 <p class="hero-service-summary">${e(site.hero.service_summary)}</p><p class="lead">${e(site.hero.description)}</p>
 <div class="actions">${link(site.hero.primary_label,site.hero.primary_target,'button')}${link(site.hero.secondary_label,site.hero.secondary_target,'button secondary')}</div><p class="smallnote">${e(site.hero.note)}</p></div>
 <div class="visual service-composition"><div class="composition-heading"><span>${e(h.eyebrow)}</span><span>${e(h.location)}</span></div><div class="composition-title">${e(h.heading)}<br><em>${e(h.accent)}</em></div>
 <div class="hero-service-list">${h.items.map(i=>`<a href="#${e(target(i.target))}"><span class="hero-symbol">${icon(i.icon)}</span><span><strong>${e(i.heading)}</strong><small>${e(i.description)}</small></span><b aria-hidden="true">↗</b></a>`).join('')}</div>
 <div class="composition-footer"><span>${e(h.footer)}</span>${link(h.link_label,h.link_target)}</div></div></div></div>
 <div class="ribbon"><div class="wrap">${site.service_strip.map(i=>`<span>${e(i.text)}</span>`).join('')}</div></div>
 <div id="service-options" class="anchor-alias"></div><div id="handyman" class="anchor-alias"></div><div id="electrical" class="anchor-alias"></div>
 ${services.groups.map(g=>g.visible?`<section class="services" id="${e(g.id)}"><div class="wrap"><div class="sectiontop"><div><p class="eyebrow">${e(g.eyebrow)}</p><h2>${lines(g.heading)}</h2></div><p>${e(g.description)}</p></div><div class="grid">${g.items.filter(i=>i.visible).map(i=>`<article class="service" id="${e(i.id)}"><div class="cardtop"><span class="icon">${icon(i.icon)}</span><span class="number">${String(++cardNumber).padStart(2,'0')}</span></div><h3>${e(i.title)}</h3><strong>${e(i.tagline)}</strong>${i.photo?`<img class="service-photo" src="${e(safePhoto(i.photo))}" alt="${e(i.photo_alt)}" loading="lazy" width="600" height="400">`:''}<p>${lines(i.description)}</p><ul>${i.bullets.map(b=>`<li>${e(b.text)}</li>`).join('')}</ul>${i.link_label?`<a class="textlink" href="#${e(i.link_target)}" data-service="${e(i.title)}">${e(i.link_label)}<span aria-hidden="true">↗</span></a>`:''}</article>`).join('')}</div></div></section>`:`<div id="${e(g.id)}" hidden></div>`).join('')}
 <section><div class="wrap feature"><div class="connect" role="img" aria-label="${e(f.illustration_label)}"><div class="hub">${icon(f.hub_icon)}</div><div class="nodes">${f.nodes.map(i=>`<div class="node">${icon(i.icon)}<span>${e(i.label)}</span></div>`).join('')}</div></div><div><p class="eyebrow">${e(f.eyebrow)}</p><h2>${lines(f.heading)}</h2>${f.paragraphs.map(i=>`<p>${e(i.text)}</p>`).join('')}<div class="pills">${f.tags.map(i=>`<span>${e(i.text)}</span>`).join('')}</div></div></div></section>
 <section class="process" id="approach"><div class="wrap"><p class="eyebrow">${e(site.approach.eyebrow)}</p><h2>${lines(site.approach.heading)}</h2><div class="steps">${site.approach.steps.map((i,n)=>`<div class="step"><b>${String(n+1).padStart(2,'0')} / ${e(i.label)}</b><h3>${e(i.heading)}</h3><p>${e(i.description)}</p></div>`).join('')}</div></div></section>
 <section class="local-area"><div class="wrap"><p class="eyebrow">${e(ex.area_eyebrow)}</p><h2>${e(ex.area_heading)}</h2><p>${e(ex.area_description)}</p></div></section>
 <section id="questions"><div class="wrap faqgrid"><div><p class="eyebrow">${e(ex.faq_eyebrow)}</p><h2>${lines(ex.faq_heading)}</h2><p>${e(ex.faq_description)}</p></div><div>${ex.faqs.map(i=>`<details><summary>${e(i.question)}</summary><p>${e(i.answer)}</p></details>`).join('')}</div></div></section>
 <section class="contact" id="contact"><div class="wrap contactgrid"><div><p class="eyebrow">${e(c.eyebrow)}</p><h2>${lines(c.heading)}</h2><p>${e(c.description)}</p><p id="selected-project" data-label="${e(site.ui.selected_project_label)}" aria-live="polite"></p></div><div class="contactbox"><span class="eyebrow">${e(c.card_eyebrow)}</span><a class="phone" href="tel:${e(number(site))}">${e(c.phone_display)}</a><div class="actions"><a class="button" id="text-project" href="sms:${e(number(site))}">${e(c.text_label)}</a><a class="button" href="tel:${e(number(site))}">${e(c.call_label)}</a></div><a class="email" href="${e(emailURL)}">${e(c.email)} ↗</a><p>${e(c.card_description)}</p>${contactForm(site,services)}</div></div></section></main>
 <footer><div class="wrap foot"><strong>${e(site.footer.brand)}</strong><span>${e(site.footer.description)}</span>${link(site.footer.top_label,'home')}</div></footer>`;
}
