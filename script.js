/**
 * ============================================================
 *  Fakhriel Yusmana Shiddiq — Global JavaScript
 *  Swiss Design Portfolio
 * ============================================================
 *  Modules:
 *   1.  DOM Ready Helper
 *   2.  Burger / Mobile Overlay Menu
 *   3.  Scroll Progress Bar
 *   4.  Fade-Up Intersection Observer
 *   5.  Header Scroll Behaviour
 *   6.  Active Nav Link Detection
 *   7.  Smooth Anchor Scrolling
 *   8.  External Link Safety (rel attributes)
 *   9.  Reduced Motion Guard
 *  10.  Keyboard Navigation Enhancements
 * ============================================================
 */

(function () {
  'use strict';

  /* ══════════════════════════════════════════════════════════
     1. DOM READY HELPER
     ══════════════════════════════════════════════════════════ */
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }


  /* ══════════════════════════════════════════════════════════
     2. BURGER / MOBILE OVERLAY MENU
     ══════════════════════════════════════════════════════════
     - Opens / closes full-screen overlay nav
     - Manages aria-expanded / aria-hidden
     - Locks body scroll while open
     - Traps focus inside overlay when open
     - Closes on Escape key
     - Closes on overlay link click (navigation)
     - Closes on resize to desktop breakpoint
  ══════════════════════════════════════════════════════════ */
  function initBurgerMenu() {
    var burgerBtn    = document.getElementById('burgerBtn');
    var overlayClose = document.getElementById('overlayClose');
    var navOverlay   = document.getElementById('navOverlay');

    if (!burgerBtn || !navOverlay) return;

    var isOpen = false;
    var DESKTOP_BP = 900; // px — matches CSS breakpoint

    /* All focusable elements inside the overlay */
    function getFocusableElements() {
      return Array.from(
        navOverlay.querySelectorAll(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      );
    }

    /* ── Open ────────────────────────────────────────────── */
    function openMenu() {
      isOpen = true;
      burgerBtn.classList.add('open');
      burgerBtn.setAttribute('aria-expanded', 'true');
      navOverlay.classList.add('open');
      navOverlay.setAttribute('aria-hidden', 'false');
      document.body.classList.add('no-scroll');

      /* Move focus to first link inside overlay */
      var focusables = getFocusableElements();
      if (focusables.length) {
        setTimeout(function () { focusables[0].focus(); }, 50);
      }
    }

    /* ── Close ───────────────────────────────────────────── */
    function closeMenu() {
      isOpen = false;
      burgerBtn.classList.remove('open');
      burgerBtn.setAttribute('aria-expanded', 'false');
      navOverlay.classList.remove('open');
      navOverlay.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('no-scroll');

      /* Return focus to burger button */
      burgerBtn.focus();
    }

    /* ── Toggle ──────────────────────────────────────────── */
    function toggleMenu() {
      if (isOpen) { closeMenu(); } else { openMenu(); }
    }

    /* ── Event Listeners ─────────────────────────────────── */
    burgerBtn.addEventListener('click', toggleMenu);

    if (overlayClose) {
      overlayClose.addEventListener('click', closeMenu);
    }

    /* Close when clicking a nav link */
    var overlayLinks = navOverlay.querySelectorAll('a');
    overlayLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        /* Small delay lets the browser start navigation before close animation */
        setTimeout(closeMenu, 80);
      });
    });

    /* Close on resize to desktop */
    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        if (window.innerWidth >= DESKTOP_BP && isOpen) {
          closeMenu();
        }
      }, 100);
    });

    /* ── Keyboard: Escape + Focus Trap ───────────────────── */
    document.addEventListener('keydown', function (e) {
      if (!isOpen) return;

      /* Escape closes */
      if (e.key === 'Escape' || e.key === 'Esc') {
        e.preventDefault();
        closeMenu();
        return;
      }

      /* Tab focus trap */
      if (e.key === 'Tab') {
        var focusables = getFocusableElements();
        if (!focusables.length) return;

        var first = focusables[0];
        var last  = focusables[focusables.length - 1];

        if (e.shiftKey) {
          /* Shift+Tab: if on first, wrap to last */
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          /* Tab: if on last, wrap to first */
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    });
  }


  /* ══════════════════════════════════════════════════════════
     3. SCROLL PROGRESS BAR
     ══════════════════════════════════════════════════════════
     Fills a 3px red bar at the top of the viewport
     proportional to how far down the page the user has scrolled.
  ══════════════════════════════════════════════════════════ */
  function initScrollProgress() {
    var bar = document.getElementById('scrollBar');
    if (!bar) return;

    var ticking = false;

    function updateBar() {
      var scrollTop  = window.scrollY || document.documentElement.scrollTop;
      var docHeight  = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      var progress   = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = Math.min(progress, 100) + '%';
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(updateBar);
        ticking = true;
      }
    }, { passive: true });

    /* Set initial state */
    updateBar();
  }


  /* ══════════════════════════════════════════════════════════
     4. FADE-UP INTERSECTION OBSERVER
     ══════════════════════════════════════════════════════════
     Watches every .fade-up element and adds .visible when
     it enters the viewport. Respects prefers-reduced-motion.
     Stagger delay is read from existing CSS delay classes or
     from a data-delay attribute in milliseconds.
  ══════════════════════════════════════════════════════════ */
  function initFadeUpObserver() {
    /* Skip animations entirely if user prefers reduced motion */
    var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var elements = document.querySelectorAll('.fade-up');
    if (!elements.length) return;

    /* If reduced motion, just make everything visible immediately */
    if (prefersReduced) {
      elements.forEach(function (el) {
        el.style.opacity    = '1';
        el.style.transform  = 'none';
        el.style.transition = 'none';
      });
      return;
    }

    /* IntersectionObserver config */
    var observerOptions = {
      root:       null,          /* viewport */
      rootMargin: '0px 0px -60px 0px', /* trigger 60px before bottom edge */
      threshold:  0.08           /* 8% of element must be visible */
    };

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el    = entry.target;
          var delay = parseInt(el.dataset.delay || '0', 10);

          if (delay > 0) {
            setTimeout(function () { el.classList.add('visible'); }, delay);
          } else {
            el.classList.add('visible');
          }

          /* Unobserve after reveal — no need to watch further */
          observer.unobserve(el);
        }
      });
    }, observerOptions);

    elements.forEach(function (el) { observer.observe(el); });
  }


  /* ══════════════════════════════════════════════════════════
     5. HEADER SCROLL BEHAVIOUR
     ══════════════════════════════════════════════════════════
     Adds .scrolled class to header after 40px of scroll,
     which can be used in CSS for subtle visual changes
     (e.g. shadow, background opacity).
     Also hides header on fast downward scroll and reveals
     on any upward scroll (smart hide/show pattern).
  ══════════════════════════════════════════════════════════ */
  function initHeaderScroll() {
    var header = document.querySelector('.site-header');
    if (!header) return;

    var lastY         = 0;
    var ticking       = false;
    var SCROLL_HIDE   = 80;   /* px scrolled before hide triggers */
    var SCROLL_THRESHOLD = 40; /* px before .scrolled class added */
    var headerH       = header.offsetHeight;

    function handleScroll() {
      var currentY = window.scrollY || window.pageYOffset;
      var diff     = currentY - lastY;

      /* .scrolled class for CSS styling hooks */
      if (currentY > SCROLL_THRESHOLD) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }

      /* Smart hide: only below the fold */
      if (currentY > headerH * 2) {
        if (diff > 4) {
          /* Scrolling down — hide header */
          header.style.transform = 'translateY(-100%)';
        } else if (diff < -4) {
          /* Scrolling up — reveal header */
          header.style.transform = 'translateY(0)';
        }
      } else {
        header.style.transform = 'translateY(0)';
      }

      lastY   = currentY;
      ticking = false;
    }

    /* Add CSS transition for smooth hide/show */
    header.style.transition = 'transform 400ms cubic-bezier(0.16,1,0.3,1), background 200ms ease';

    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(handleScroll);
        ticking = true;
      }
    }, { passive: true });
  }


  /* ══════════════════════════════════════════════════════════
     6. ACTIVE NAV LINK DETECTION
     ══════════════════════════════════════════════════════════
     Compares the current page filename to each nav link href
     and adds .active to the matching link.
     Works for both the desktop nav and the mobile overlay nav.
     Falls back gracefully on index / root URL.
  ══════════════════════════════════════════════════════════ */
  function initActiveNav() {
    var currentPage = window.location.pathname.split('/').pop() || 'index.html';

    /* Normalise empty path → index.html */
    if (currentPage === '' || currentPage === '/') {
      currentPage = 'index.html';
    }

    var allNavLinks = document.querySelectorAll(
      '.nav-desktop a, .nav-overlay-links a'
    );

    allNavLinks.forEach(function (link) {
      /* Skip the CTA button wrapper */
      if (link.classList.contains('nav-cta')) return;

      var href = (link.getAttribute('href') || '').split('/').pop();

      /* Remove any existing .active first */
      link.classList.remove('active');

      if (href === currentPage) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }


  /* ══════════════════════════════════════════════════════════
     7. SMOOTH ANCHOR SCROLLING
     ══════════════════════════════════════════════════════════
     Handles in-page anchor links (href="#section-id") with
     smooth scrolling that accounts for the sticky header height.
  ══════════════════════════════════════════════════════════ */
  function initAnchorScrolling() {
    document.addEventListener('click', function (e) {
      var anchor = e.target.closest('a[href^="#"]');
      if (!anchor) return;

      var targetId = anchor.getAttribute('href');
      if (!targetId || targetId === '#') return;

      var target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      var header    = document.querySelector('.site-header');
      var headerH   = header ? header.offsetHeight : 64;
      var targetTop = target.getBoundingClientRect().top + window.scrollY - headerH - 16;

      window.scrollTo({
        top:      Math.max(0, targetTop),
        behavior: 'smooth'
      });

      /* Update URL hash without jumping */
      if (history.pushState) {
        history.pushState(null, null, targetId);
      }

      /* Set focus to the target for accessibility */
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
      target.addEventListener('blur', function onBlur() {
        target.removeAttribute('tabindex');
        target.removeEventListener('blur', onBlur);
      });
    });
  }


  /* ══════════════════════════════════════════════════════════
     8. EXTERNAL LINK SAFETY
     ══════════════════════════════════════════════════════════
     Automatically adds rel="noopener noreferrer" and
     target="_blank" to all external links on the page.
     Skips mailto:, tel:, and same-domain links.
  ══════════════════════════════════════════════════════════ */
  function initExternalLinks() {
    var links = document.querySelectorAll('a[href]');
    var origin = window.location.origin;

    links.forEach(function (link) {
      var href = link.getAttribute('href') || '';

      /* Skip anchors, mailto, tel, relative paths */
      if (
        href.startsWith('#')      ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:')   ||
        href.startsWith('/')      ||
        href === ''
      ) return;

      /* Skip same-domain absolute URLs */
      try {
        var url = new URL(href, window.location.href);
        if (url.origin === origin) return;
      } catch (err) {
        return;
      }

      /* Apply safety attributes */
      if (!link.getAttribute('target')) {
        link.setAttribute('target', '_blank');
      }
      var rel = link.getAttribute('rel') || '';
      if (!rel.includes('noopener')) {
        link.setAttribute('rel', (rel + ' noopener noreferrer').trim());
      }
    });
  }


  /* ══════════════════════════════════════════════════════════
     9. REDUCED MOTION GUARD
     ══════════════════════════════════════════════════════════
     Listens for changes to the prefers-reduced-motion media
     query at runtime (e.g. user changes OS setting while on
     the page) and pauses/removes animations accordingly.
  ══════════════════════════════════════════════════════════ */
  function initReducedMotionGuard() {
    var mq = window.matchMedia('(prefers-reduced-motion: reduce)');

    function applyReducedMotion(matches) {
      if (matches) {
        /* Stop ticker animation */
        var ticker = document.querySelector('.hero-ticker-inner');
        if (ticker) ticker.style.animationPlayState = 'paused';

        /* Remove availability dot pulse */
        var dots = document.querySelectorAll('.availability-dot');
        dots.forEach(function (dot) { dot.style.animation = 'none'; });

        /* Immediately show all fade-up elements */
        var fadeEls = document.querySelectorAll('.fade-up:not(.visible)');
        fadeEls.forEach(function (el) {
          el.style.opacity   = '1';
          el.style.transform = 'none';
          el.classList.add('visible');
        });
      } else {
        /* Re-enable ticker */
        var ticker = document.querySelector('.hero-ticker-inner');
        if (ticker) ticker.style.animationPlayState = 'running';
      }
    }

    /* Run on load */
    applyReducedMotion(mq.matches);

    /* Listen for runtime changes */
    if (mq.addEventListener) {
      mq.addEventListener('change', function (e) { applyReducedMotion(e.matches); });
    } else if (mq.addListener) {
      /* Safari < 14 fallback */
      mq.addListener(function (e) { applyReducedMotion(e.matches); });
    }
  }


  /* ══════════════════════════════════════════════════════════
     10. KEYBOARD NAVIGATION ENHANCEMENTS
     ══════════════════════════════════════════════════════════
     - Adds a visible focus outline style to the document when
       the user is navigating by keyboard (Tab key), and removes
       it when they switch to mouse.
     - Handles interactive service rows and project cards as
       keyboard-accessible (Enter / Space to activate).
  ══════════════════════════════════════════════════════════ */
  function initKeyboardNav() {
    /* ── Focus-visible polyfill-style toggle ────────────── */
    var usingKeyboard = false;

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Tab') {
        if (!usingKeyboard) {
          usingKeyboard = true;
          document.documentElement.classList.add('using-keyboard');
        }
      }
    });

    document.addEventListener('mousedown', function () {
      if (usingKeyboard) {
        usingKeyboard = false;
        document.documentElement.classList.remove('using-keyboard');
      }
    });

    /* ── Service rows: Enter / Space activation ─────────── */
    var serviceRows = document.querySelectorAll('.service-row');
    serviceRows.forEach(function (row) {
      /* Make it keyboard-focusable if it isn't already */
      if (!row.getAttribute('tabindex')) {
        row.setAttribute('tabindex', '0');
        row.setAttribute('role', 'button');
      }

      row.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          row.click();
        }
      });
    });

    /* ── Project cards: Enter / Space activation ────────── */
    var projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(function (card) {
      if (!card.getAttribute('tabindex') && card.tagName !== 'A') {
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
      }

      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          card.click();
        }
      });
    });
  }


  /* ══════════════════════════════════════════════════════════
     ADDITIONAL CSS INJECTED AT RUNTIME
     ══════════════════════════════════════════════════════════
     Adds a keyboard focus ring that only appears during
     keyboard navigation (class toggled by JS above).
  ══════════════════════════════════════════════════════════ */
  function injectFocusStyles() {
    var style = document.createElement('style');
    style.textContent = [
      /* Default: suppress focus ring (pointer users) */
      '*:focus { outline: none; }',

      /* Keyboard users: strong visible focus ring */
      '.using-keyboard *:focus {',
      '  outline: 2px solid #E8001C !important;',
      '  outline-offset: 3px !important;',
      '}',

      /* Extra specificity for buttons and links */
      '.using-keyboard a:focus,',
      '.using-keyboard button:focus {',
      '  outline: 2px solid #E8001C !important;',
      '  outline-offset: 3px !important;',
      '  box-shadow: 0 0 0 4px rgba(232,0,28,0.15) !important;',
      '}',

      /* Header smart hide transition (also applied in JS, CSS version for specificity) */
      '.site-header {',
      '  will-change: transform;',
      '}',

      /* Card tabindex focus ring */
      '.using-keyboard .project-card:focus {',
      '  outline: 2px solid #E8001C !important;',
      '  outline-offset: -2px !important;',
      '}'
    ].join('\n');

    document.head.appendChild(style);
  }


  /* ══════════════════════════════════════════════════════════
     INIT — Run all modules on DOM ready
  ══════════════════════════════════════════════════════════ */
  ready(function () {

    injectFocusStyles();
    initBurgerMenu();
    initScrollProgress();
    initFadeUpObserver();
    initHeaderScroll();
    initActiveNav();
    initAnchorScrolling();
    initExternalLinks();
    initReducedMotionGuard();
    initKeyboardNav();

    /* ── Announce page title to screen readers on load ── */
    var title = document.title;
    if (title) {
      var announcer = document.createElement('div');
      announcer.setAttribute('role', 'status');
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.className = 'sr-only';
      document.body.appendChild(announcer);
      /* Delay so it fires after initial render */
      setTimeout(function () { announcer.textContent = title; }, 300);
    }

    /* ── Log studio credit in console ─────────────────── */
    if (window.console && window.console.log) {
      console.log(
        '%c Fakhriel Yusmana Shiddiq %c Swiss Design Portfolio — Built with precision. No frameworks harmed.',
        'background:#E8001C;color:#fff;font-weight:900;padding:4px 8px;font-family:Helvetica Neue,sans-serif;',
        'color:#6B6B6B;font-family:Helvetica Neue,sans-serif;padding:4px;'
      );
    }

  });


})();
