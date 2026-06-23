// Replaces the WordPress theme's app.js (jQuery-free): menu toggle, sub-menus,
// sticky headers, dark mode, hero video pause, newsletter bar, search overlay.

const nav = document.querySelector('#site-navigation');

// --- Mobile menu toggle ---
const toggle = document.querySelector('.menu-toggle');
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('toggled');
    toggle.classList.toggle('menu-is-active', open);
    toggle.setAttribute('aria-expanded', String(open));
  });
}

// --- Compact floating-header menu toggle (controls its own nav) ---
const fixedToggle = document.querySelector('.fixed-menu-toggle');
const fixedNav = document.querySelector('.fixed-header nav');
if (fixedToggle && fixedNav) {
  fixedToggle.addEventListener('click', () => {
    const open = fixedNav.classList.toggle('toggled');
    fixedToggle.classList.toggle('menu-is-active', open);
    fixedToggle.setAttribute('aria-expanded', String(open));
  });
}

// --- Sub-menu toggles (mobile) ---
document.querySelectorAll('.submenu-toggle-button').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    btn.closest('li')?.classList.toggle('submneu-menu-open');
  });
});

// --- Sticky headers on scroll (mirrors the original app.js) ---
const fixedHeader = document.querySelector('.fixed-header');
const mobileHeader = document.querySelector('.main-scroll-fixed-mobile');
window.addEventListener('scroll', () => {
  const scrolled = window.scrollY >= 200;
  fixedHeader?.classList.toggle('header-fixed', scrolled);
  mobileHeader?.classList.toggle('mob-header-fixed', scrolled);
  document.body.classList.toggle('mob-header-fixed-content', scrolled);
}, { passive: true });

// --- Newsletter top bar: visible until dismissed (original used a cookie) ---
const bar = document.getElementById('newsletter-bar');
if (bar) {
  if (localStorage.getItem('ccais-newsletter-dismissed')) {
    bar.remove();
  } else {
    bar.querySelector('.close-signup')?.addEventListener('click', () => {
      bar.remove();
      localStorage.setItem('ccais-newsletter-dismissed', '1');
    });
  }
}

// --- Dark mode (same localStorage key as the original) ---
const enableDark = (on) => {
  document.body.classList.toggle('darkmode', on);
  localStorage.setItem('darkMode', on ? 'enabled' : 'disabled');
};
if (localStorage.getItem('darkMode') === 'enabled') enableDark(true);
document.querySelectorAll('.dark-mode-toggle').forEach((btn) =>
  btn.addEventListener('click', () => enableDark(!document.body.classList.contains('darkmode')))
);

// --- Hero video play/pause ---
const video = document.getElementById('hero_video');
const pauseBt = document.querySelector('.video-section .pause-bt');
if (video && pauseBt) {
  pauseBt.addEventListener('click', () => {
    if (video.paused) { video.play(); pauseBt.classList.remove('is-paused'); }
    else { video.pause(); pauseBt.classList.add('is-paused'); }
  });
}

// --- Search overlay ---
// The theme CSS hard-codes `.header-search-backdrop { display: none }`, so we
// toggle inline display (which overrides it) rather than the hidden attribute.
const searchBackdrop = document.querySelector('.header-search-backdrop');
const openSearch = () => {
  if (!searchBackdrop) return;
  searchBackdrop.style.display = 'block';
  searchBackdrop.querySelector('.search-field')?.focus();
};
const closeSearch = () => { if (searchBackdrop) searchBackdrop.style.display = 'none'; };
document.querySelectorAll('.header-search-icon').forEach((b) => b.addEventListener('click', openSearch));
searchBackdrop?.querySelector('.header-search-close')?.addEventListener('click', closeSearch);
searchBackdrop?.addEventListener('click', (e) => { if (e.target === searchBackdrop) closeSearch(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSearch(); });

// --- Click-to-play video (Prof Stein box on the homepage) ---
document.querySelectorAll('.video').forEach((wrap) => {
  const placeholder = wrap.querySelector('.video__placeholder');
  const button = wrap.querySelector('.video__button');
  const src = placeholder?.dataset.video;
  if (!src || !button) return;
  wrap.addEventListener('click', () => {
    const existing = wrap.querySelector('#video-player');
    if (!existing) {
      const iframe = document.createElement('iframe');
      iframe.id = 'video-player';
      iframe.src = src;
      iframe.allowFullscreen = true;
      iframe.setAttribute('frameborder', '0');
      iframe.allow = 'autoplay; encrypted-media';
      placeholder.insertAdjacentElement('afterend', iframe);
      button.classList.add('is-playing');
    } else {
      existing.remove();
      button.classList.remove('is-playing');
    }
  });
});
