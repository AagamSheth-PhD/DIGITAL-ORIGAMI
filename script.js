/* ============================================ */
/*  DIGITAL ORIGAMI — Interactive Engine        */
/* ============================================ */

(function() {
  'use strict';

  // ==================== //
  // 1. PRELOADER         //
  // ==================== //
  const preloader = document.getElementById('preloader');
  const preloaderBar = document.querySelector('.preloader-bar-fill');
  const preloaderCounter = document.querySelector('.preloader-counter');
  let loadProgress = 0;
  let preloaderDone = false;

  const preloaderInterval = setInterval(() => {
    loadProgress += Math.random() * 15 + 5;
    if (loadProgress > 95) loadProgress = 95;
    if (preloaderBar) preloaderBar.style.width = loadProgress + '%';
    if (preloaderCounter) preloaderCounter.textContent = Math.floor(loadProgress) + '%';
  }, 150);

  function finishPreloader() {
    if (preloaderDone) return;
    preloaderDone = true;
    clearInterval(preloaderInterval);
    if (preloaderBar) preloaderBar.style.width = '100%';
    if (preloaderCounter) preloaderCounter.textContent = '100%';
    setTimeout(() => {
      if (preloader) preloader.classList.add('loaded');
      document.body.style.overflow = '';
      document.body.classList.add('page-loaded');
      initScrollReveal();
    }, 600);
  }

  // Handle race condition: load may have already fired
  if (document.readyState === 'complete') {
    finishPreloader();
  } else {
    window.addEventListener('load', finishPreloader);
  }

  // Safety timeout: dismiss preloader after 4 seconds no matter what
  setTimeout(finishPreloader, 4000);

  // ==================== //
  // 2. CUSTOM CURSOR     //
  // ==================== //
  const cursorDiamond = document.querySelector('.cursor-diamond');
  const cursorDot = document.querySelector('.cursor-dot');
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  if (!isTouchDevice && cursorDiamond && cursorDot) {
    let mouseX = 0, mouseY = 0;
    let diamondX = 0, diamondY = 0;
    let dotX = 0, dotY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    document.addEventListener('mousedown', () => cursorDiamond.classList.add('clicking'));
    document.addEventListener('mouseup', () => cursorDiamond.classList.remove('clicking'));

    // Hover detection for interactive elements
    const hoverTargets = 'a, button, input, textarea, .service-card, .portfolio-card, .social-link, .contact-method, .pillar, .video-play-btn, .nav-cta, .btn-primary, .btn-outline';

    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(hoverTargets)) {
        cursorDiamond.classList.add('hovering');
      }
    });

    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(hoverTargets)) {
        cursorDiamond.classList.remove('hovering');
      }
    });

    // Smooth cursor animation with lerp
    function animateCursor() {
      const diamondSpeed = 0.12;
      const dotSpeed = 0.6;

      diamondX += (mouseX - diamondX) * diamondSpeed;
      diamondY += (mouseY - diamondY) * diamondSpeed;
      dotX += (mouseX - dotX) * dotSpeed;
      dotY += (mouseY - dotY) * dotSpeed;

      cursorDiamond.style.transform = `translate(${diamondX - 14}px, ${diamondY - 14}px)`;
      cursorDot.style.transform = `translate(${dotX - 2.5}px, ${dotY - 2.5}px)`;

      requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Hide cursor when leaving window
    document.addEventListener('mouseleave', () => {
      cursorDiamond.style.opacity = '0';
      cursorDot.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
      cursorDiamond.style.opacity = '1';
      cursorDot.style.opacity = '1';
    });
  }

  // ==================== //
  // 3. NAVIGATION        //
  // ==================== //
  const navbar = document.querySelector('.navbar');
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  let lastScrollY = 0;
  let ticking = false;

  function handleNavScroll() {
    const currentScrollY = window.scrollY;

    // Add scrolled class
    if (currentScrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Hide/show on scroll direction
    if (currentScrollY > 300) {
      if (currentScrollY > lastScrollY + 5) {
        navbar.classList.add('hidden');
      } else if (currentScrollY < lastScrollY - 5) {
        navbar.classList.remove('hidden');
      }
    } else {
      navbar.classList.remove('hidden');
    }

    lastScrollY = currentScrollY;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(handleNavScroll);
      ticking = true;
    }
  });

  // Mobile menu toggle
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('active');
      navLinks.classList.toggle('mobile-open');
      document.body.style.overflow = navLinks.classList.contains('mobile-open') ? 'hidden' : '';
    });

    // Close menu on link click
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navLinks.classList.remove('mobile-open');
        document.body.style.overflow = '';
      });
    });
  }

  // Smooth scroll for nav links
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId === '#') return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const offsetTop = targetEl.offsetTop - 80;
        window.scrollTo({ top: offsetTop, behavior: 'smooth' });
      }
    });
  });

  // ==================== //
  // 4. PARTICLE SYSTEM   //
  // ==================== //
  const canvas = document.getElementById('particles-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    const PARTICLE_COUNT = 45;
    const colors = ['#3b82f6', '#8b5cf6', '#d946ef', '#ec4899', '#f97316', '#6366f1', '#a855f7'];

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Particle {
      constructor() {
        this.reset(true);
      }

      reset(initial = false) {
        this.x = Math.random() * canvas.width;
        this.y = initial ? Math.random() * canvas.height : canvas.height + 20;
        this.size = Math.random() * 5 + 2;
        this.speedY = Math.random() * 0.4 + 0.15;
        this.speedX = (Math.random() - 0.5) * 0.2;
        this.opacity = Math.random() * 0.25 + 0.05;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.015;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.shape = Math.random() > 0.5 ? 'triangle' : 'diamond';
      }

      update() {
        this.y -= this.speedY;
        this.x += this.speedX;
        this.rotation += this.rotSpeed;
        if (this.y < -30) this.reset();
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.beginPath();

        if (this.shape === 'triangle') {
          ctx.moveTo(0, -this.size);
          ctx.lineTo(-this.size * 0.866, this.size * 0.5);
          ctx.lineTo(this.size * 0.866, this.size * 0.5);
        } else {
          ctx.moveTo(0, -this.size);
          ctx.lineTo(this.size * 0.7, 0);
          ctx.lineTo(0, this.size);
          ctx.lineTo(-this.size * 0.7, 0);
        }

        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new Particle());
    }

    function animateParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      requestAnimationFrame(animateParticles);
    }
    animateParticles();
  }

  // ==================== //
  // 5. 3D TILT CARDS     //
  // ==================== //
  function init3DTilt() {
    const tiltCards = document.querySelectorAll('.service-card, .portfolio-card');

    tiltCards.forEach(card => {
      const glare = card.querySelector('.card-glare');

      card.addEventListener('mousemove', (e) => {
        if (isTouchDevice) return;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -8;
        const rotateY = ((x - centerX) / centerX) * 8;

        card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;

        if (glare) {
          const glareX = (x / rect.width) * 100;
          const glareY = (y / rect.height) * 100;
          glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.08), transparent 60%)`;
        }
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
        setTimeout(() => card.style.transition = '', 600);
      });

      card.addEventListener('mouseenter', () => {
        card.style.transition = 'none';
      });
    });
  }
  init3DTilt();

  // ==================== //
  // 6. SCROLL REVEAL     //
  // ==================== //
  let scrollRevealInitialized = false;

  function initScrollReveal() {
    if (scrollRevealInitialized) return;
    scrollRevealInitialized = true;

    const revealElements = document.querySelectorAll('[data-reveal]');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -20px 0px'
    });

    revealElements.forEach(el => observer.observe(el));

    // Process timeline animation
    const processTimeline = document.querySelector('.process-timeline');
    if (processTimeline) {
      const processObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animated');
            processObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });
      processObserver.observe(processTimeline);
    }
  }

  // ==================== //
  // 7. VIDEO PLAYERS     //
  // ==================== //
  const playButtons = document.querySelectorAll('.video-play-btn');

  playButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const wrapper = btn.closest('.portfolio-video-wrapper');
      const video = wrapper.querySelector('video');

      if (video) {
        if (video.paused) {
          document.querySelectorAll('.portfolio-video-wrapper video').forEach(v => {
            if (v !== video) {
              v.pause();
              const otherBtn = v.closest('.portfolio-video-wrapper').querySelector('.video-play-btn');
              if (otherBtn) otherBtn.classList.remove('playing');
            }
          });

          video.play();
          btn.classList.add('playing');
        } else {
          video.pause();
          btn.classList.remove('playing');
        }
      }
    });
  });

  document.querySelectorAll('.portfolio-video-wrapper video').forEach(video => {
    video.addEventListener('ended', () => {
      const btn = video.closest('.portfolio-video-wrapper').querySelector('.video-play-btn');
      if (btn) btn.classList.remove('playing');
    });

    video.addEventListener('click', () => {
      const btn = video.closest('.portfolio-video-wrapper').querySelector('.video-play-btn');
      if (!video.paused) {
        video.pause();
        if (btn) btn.classList.remove('playing');
      } else {
        video.play();
        if (btn) btn.classList.add('playing');
      }
    });
  });

  // ==================== //
  // 8. MAGNETIC BUTTONS  //
  // ==================== //
  if (!isTouchDevice) {
    const magneticBtns = document.querySelectorAll('.btn-primary, .btn-outline, .nav-cta');

    magneticBtns.forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
        btn.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
        setTimeout(() => btn.style.transition = '', 400);
      });

      btn.addEventListener('mouseenter', () => {
        btn.style.transition = 'none';
      });
    });
  }

  // ==================== //
  // 9. PARALLAX SHAPES   //
  // ==================== //
  if (!isTouchDevice) {
    const heroScene = document.querySelector('.hero-3d-scene');

    if (heroScene) {
      document.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 2;
        const y = (e.clientY / window.innerHeight - 0.5) * 2;

        const shapes = heroScene.querySelectorAll('.float-shape');
        shapes.forEach((shape, i) => {
          const depth = (i + 1) * 4;
          const moveX = x * depth;
          const moveY = y * depth;
          shape.style.translate = `${moveX}px ${moveY}px`;
        });

        const logo = heroScene.querySelector('.hero-logo-float');
        if (logo) {
          logo.style.translate = `${x * 8}px ${y * 8}px`;
        }
      });
    }
  }

  // ==================== //
  // 10. FORM HANDLING    //
  // ==================== //
  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function() {
      const submitBtn = contactForm.querySelector('.form-submit .btn-primary');
      if (submitBtn) {
        submitBtn.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite">
            <circle cx="12" cy="12" r="10" stroke-dasharray="60" stroke-dashoffset="20"/>
          </svg>
          Sending...
        `;
        submitBtn.disabled = true;
      }
    });
  }

  // ==================== //
  // 11. ACTIVE NAV LINK  //
  // ==================== //
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

  function setActiveNav() {
    const scrollPos = window.scrollY + 200;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navAnchors.forEach(a => {
          a.classList.remove('active');
          if (a.getAttribute('href') === '#' + id) {
            a.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', setActiveNav);

  // ==================== //
  // 12. INJECTED STYLES  //
  // ==================== //
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .nav-links a.active {
      color: var(--text-primary);
    }
    .nav-links a.active::after {
      width: 100%;
    }
  `;
  document.head.appendChild(style);

})();
