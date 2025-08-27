/* Content loader for content.json (no drawer logic) */
(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const setHTML = (el, html) => { if (el) el.innerHTML = html; };
  const setText = (el, txt) => { if (el) el.textContent = txt; };

  document.addEventListener('DOMContentLoaded', () => {
    const yearEl = $('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    const el = {
      siteTitle: $('siteTitle'), brandTitle: $('brandTitle'), footerBrand: $('footerBrand'),
      heroTitle: $('heroTitle'), heroSubtitle: $('heroSubtitle'),
      ctaPrimary: $('ctaPrimary'), ctaSecondary: $('ctaSecondary'),
      aboutHeading: $('aboutHeading'), aboutCopy: $('aboutCopy'), aboutBullets: $('aboutBullets'),
      listenHeading: $('listenHeading'),
      episodesHeading: $('episodesHeading'), retroHeading: $('retroHeading'),
      featuredHeading: $('featuredHeading'), contactHeading: $('contactHeading'), contactBody: $('contactBody'),
      episodesGrid: $('episodesGrid'), retroGrid: $('retroGrid'), featuredGrid: $('featuredGrid'),
      subscribeLink: $('subscribeLink')
    };

    function episodeCard(e) {
      return `
        <article class="card" data-episode-id="${e.id ?? ''}">
          <div class="card-img"></div>
          <div class="card-body">
            <strong>${e.title || ''}</strong>
            ${e.description ? `<div class="mut sm" style="margin-top:6px">${e.description}</div>` : ''}
            ${e.duration ? `<div class="mut xs" style="margin-top:6px">${e.duration}</div>` : ''}
          </div>
        </article>`;
    }

    function retroCard(r) {
      const url = r.url || '#';
      const target = r.target || (String(url).startsWith('http') ? '_blank' : '_self');
      return `
        <a class="card" href="${url}" target="${target}" rel="noopener">
          <div class="card-img"></div>
          <div class="card-body">
            <strong>${r.title || ''}</strong>
            ${r.blurb ? `<div class="mut sm" style="margin-top:6px">${r.blurb}</div>` : ''}
          </div>
        </a>`;
    }

    function featuredCard(f) {
      const inner = `
        <div class="card-img"></div>
        <div class="card-body">
          <strong>${f.title || ''}</strong>
          ${f.subtitle ? `<div class="mut xs" style="margin-top:6px">${f.subtitle}</div>` : ''}
          ${f.description ? `<div class="mut sm" style="margin-top:6px">${f.description}</div>` : ''}
        </div>`;
      if (f.type === 'episode') return `<div class="card" data-episode-id="${f.episodeId ?? ''}">${inner}</div>`;
      const url = f.url || '#';
      const target = f.target || (String(url).startsWith('http') ? '_blank' : '_self');
      return `<a class="card" href="${url}" target="${target}" rel="noopener">${inner}</a>`;
    }

    function installEpisodeClicks(data) {
      document.querySelectorAll('[data-episode-id]').forEach(card => {
        card.addEventListener('click', () => {
          const id = card.getAttribute('data-episode-id');
          const e = (data.episodes || []).find(x => String(x.id) === String(id));
          if (!e) return;
          if (e.link)         window.open(e.link, '_blank');
          else if (e.embedUrl) window.open(e.embedUrl, '_blank');
          else if (e.audioUrl) window.open(e.audioUrl, '_blank');
        });
      });
    }

    async function loadJSON() {
      const res = await fetch('content.json?v=' + Date.now(), { cache: 'no-store' });
      if (!res.ok) throw new Error('content.json not found (HTTP ' + res.status + ')');
      return await res.json();
    }

    (async () => {
      const data = await loadJSON();

      // Meta / brand
      setText(el.siteTitle,   data.meta?.title || 'Podcast');
      setText(el.brandTitle,  data.meta?.brand || data.meta?.title || 'Podcast');
      setText(el.footerBrand, data.meta?.brand || data.meta?.title || 'Podcast');

      // Hero
      setHTML(el.heroTitle, data.hero?.title || '');
      setText(el.heroSubtitle, data.hero?.subtitle || '');
      setText(el.ctaPrimary, data.hero?.ctaPrimary?.label || 'Listen now');
      if (data.hero?.ctaPrimary?.href) el.ctaPrimary.href = data.hero.ctaPrimary.href;
      setText(el.ctaSecondary, data.hero?.ctaSecondary?.label || 'Browse episodes');
      if (data.hero?.ctaSecondary?.href) el.ctaSecondary.href = data.hero.ctaSecondary.href;

      // About
      setText(el.aboutHeading, data.about?.heading || 'About');
      setText(el.aboutCopy,    data.about?.copy || '');
      el.aboutBullets && (el.aboutBullets.innerHTML = (data.about?.bullets || []).map(b => `<li>${b}</li>`).join(''));

      // Section headings & contact
      setText(el.listenHeading,   data.listen?.heading || 'Listen');
      setText(el.episodesHeading, data.episodesHeading || 'Latest episodes');
      setText(el.retroHeading,    data.retroHeading    || 'Retro spotlights');
      setText(el.featuredHeading, data.featuredHeading || 'Featured');
      setText(el.contactHeading,  data.contact?.heading || 'Contact');
      el.contactBody && (el.contactBody.innerHTML = data.contact?.html || '');

      // Subscribe link
      if (data.meta?.subscribeUrl && el.subscribeLink) {
        el.subscribeLink.href = data.meta.subscribeUrl;
        el.subscribeLink.classList.remove('hide');
      }

      // Grids
      el.episodesGrid && (el.episodesGrid.innerHTML = (data.episodes || []).map(episodeCard).join(''));
      el.retroGrid    && (el.retroGrid.innerHTML    = (data.retro || []).map(retroCard).join(''));
      el.featuredGrid && (el.featuredGrid.innerHTML = (data.featured || []).map(featuredCard).join(''));

      installEpisodeClicks(data);
    })().catch(err => console.error(err));
  });
})();// app.js will be written by previous step
