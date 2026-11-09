import { escapeHTML as e, safePhoto } from './model.js';
import { icon } from './icons.js';
const lines = value => e(value).replace(/\r?\n/g, '<br>');
const link = (label, target, className = '') => `<a class="${className}" href="#${e(target)}">${e(label)}</a>`;
const number = site => site.contact.phone_number.replace(/[^+0-9]/g, '');
const brand = site => `${e(site.brand.name)}<span class="brand-dot">${e(site.brand.dot)}</span><small>${e(site.brand.subtitle)}</small>`;

function serviceGroups(content) {
  // Empty anchor placeholders preserve links when an owner temporarily hides a group.
  return content.groups.map(group => group.visible ? `
    <section class="section service-section ${group.items.length===1?'single-service':''}" id="${e(group.id)}">
      <div class="section-head">
        <div><div class="eyebrow">${e(group.eyebrow)}</div><h2>${lines(group.heading)}</h2></div>
        <p>${e(group.description)}</p>
      </div>
      <div class="services">${group.items.filter(item => item.visible).map((item,index)=>`
        <article class="service" id="${e(item.id)}">
          ${icon(item.icon)}

          <h3>${e(item.title)}</h3>
          ${item.photo ? `<img class="service-photo" src="${e(safePhoto(item.photo))}" alt="${e(item.photo_alt)}" loading="lazy" decoding="async" width="400" height="240">` : ''}
          <p>${lines(item.description)}</p>
          ${item.link_label ? link(item.link_label,item.link_target,'text-link service-link') : ''}
        </article>`).join('')}
      </div>
    </section>` : `<div id="${e(group.id)}" hidden></div>`).join('');
}

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
  const c=site.contact;
  const emailURL=`mailto:${c.email}?${new URLSearchParams({subject:c.email_subject,body:c.email_outline}).toString()}`;
  return `
    <a class="skip-link" href="#${e(services.groups.find(group=>group.visible)?.id || 'contact')}">${e(site.ui.skip_label)}</a>
    <header id="home">
      <a class="brand" href="#home" aria-label="${e(site.brand.name+' '+site.brand.subtitle)}">${brand(site)}</a>
      <nav aria-label="${e(site.ui.navigation_label)}">
        ${site.navigation.map(item=>link(item.label,item.target)).join('')}
        ${link(site.header_button.label,site.header_button.target,'button')}
      </nav>
    </header>
    <main>
      <section class="hero">
        <div>
          <div class="eyebrow">${e(site.hero.eyebrow)}</div>
          <h1>${site.hero.heading_lines.map(line=>e(line.text)+(line.emphasized_text?`<em>${e(line.emphasized_text)}</em>`:'')).join('<br>')}</h1>
          <p class="hero-service-summary">${e(site.hero.service_summary)}</p>
          <p>${e(site.hero.description)}</p>
          <div class="actions">${link(site.hero.primary_label,site.hero.primary_target,'button')}${link(site.hero.secondary_label,site.hero.secondary_target,'text-link')}</div>
        </div>
        ${site.hero.photo ? `<figure class="hero-image"><img src="${e(safePhoto(site.hero.photo))}" alt="${e(site.hero.photo_alt)}" width="700" height="700" fetchpriority="high"><figcaption>${e(site.hero.image_caption)}</figcaption></figure>` : `
        <div class="room" role="img" aria-label="${e(site.hero.illustration_label)}">
          <span class="room-tag">${e(site.hero.image_tag)}</span><div class="tv"></div><div class="console"></div><div class="plant"></div><div class="caption">${e(site.hero.image_caption)}</div>
        </div>`}
      </section>
      <section class="section service-options" id="service-options">
        <div class="eyebrow">${e(site.experience.overview_eyebrow)}</div><h2>${lines(site.experience.overview_heading)}</h2>
        <div class="category-grid">${site.experience.categories.map(category=>`<a class="category-card" href="#${e(category.target)}"><span class="category-kicker">${e(category.kicker)}</span><h3>${e(category.title)}</h3><p>${e(category.description)}</p><span class="category-arrow" aria-hidden="true">↗</span></a>`).join('')}</div>
      </section>
      <div class="strip">${site.service_strip.map(item=>`<span>${e(item.text)}</span>`).join('')}</div>
      ${serviceGroups(services)}
      <section class="process" id="approach"><div class="section">
        <div class="eyebrow">${e(site.approach.eyebrow)}</div><h2>${lines(site.approach.heading)}</h2>
        <div class="steps">${site.approach.steps.map(step=>`<article><h3>${e(step.heading)}</h3><p>${e(step.description)}</p></article>`).join('')}</div>
      </div></section>
      <section class="section local-area"><div class="eyebrow">${e(site.experience.area_eyebrow)}</div><h2>${e(site.experience.area_heading)}</h2><p>${e(site.experience.area_description)}</p></section>
      <section class="section faq-section" id="questions"><div><div class="eyebrow">${e(site.experience.faq_eyebrow)}</div><h2>${e(site.experience.faq_heading)}</h2></div><div class="faq-list">${site.experience.faqs.map(faq=>`<details><summary>${e(faq.question)}</summary><p>${e(faq.answer)}</p></details>`).join('')}</div></section>
      <section class="contact-section" id="contact"><div class="section project">
        <div>
          <div class="eyebrow">${e(c.eyebrow)}</div><h2>${lines(c.heading)}</h2>
          <p>${e(c.description)}</p><p>${e(c.details_intro)}</p>
          <ul>${c.checklist.map(item=>`<li>${e(item.text)}</li>`).join('')}</ul><p class="note">${e(c.service_area_note)}</p>
        </div>
        <div class="contact-card">
          <div class="eyebrow">${e(c.card_eyebrow)}</div><h3>${lines(c.card_heading)}</h3><p>${e(c.card_description)}</p>
          <a class="phone" href="tel:${e(number(site))}">${e(c.phone_display)}</a><p class="note">${e(c.phone_note)}</p>
          <div class="actions"><a class="button" href="tel:${e(number(site))}">${e(c.call_label)}</a><a class="button" href="sms:${e(number(site))}">${e(c.text_label)}</a></div>
          <div class="email-area"><h3>${e(c.email_heading)}</h3><p>${e(c.email_description)}</p>
            <a class="text-link email-address" href="mailto:${e(c.email)}">${e(c.email)}</a>
            <div class="email-button"><a class="button" href="${e(emailURL)}">${e(c.email_button_label)}</a></div><p class="note email-note">${e(c.email_note)}</p>
          </div>
          ${contactForm(site,services)}
        </div>
      </div></section>
    </main>
    <footer><a class="brand footer-brand" href="#home">${e(site.footer.brand)}</a><span>${e(site.footer.description)}</span>${link(site.footer.top_label,'home')}</footer>`;
}

