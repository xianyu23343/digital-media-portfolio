(() => {
  document.documentElement.classList.add('concept-ready');

  const revealTargets = document.querySelectorAll(
    '.ref-section-head, .featured-card, .direction-link, .operation-card, .internship-panel, .about-lead, .about-rule-heading, .about-panel, .about-capabilities, .about-target, .catalog-hero, .category-browser, .catalog-group-label, .catalog-card, .method-intro, .method-card, .method-footer, .contact-title-block, .contact-channel-card'
  );
  revealTargets.forEach(node => node.classList.add('concept-reveal'));

  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('concept-in');
        observer.unobserve(entry.target);
      });
    }, { threshold: .08, rootMargin: '0px 0px -30px' });
    revealTargets.forEach(node => observer.observe(node));
  } else {
    revealTargets.forEach(node => node.classList.add('concept-in'));
  }

  const hero = document.querySelector('.legacy-hero');
  const stack = document.querySelector('.hero-poster-stack');
  if (hero && stack && matchMedia('(pointer:fine)').matches) {
    hero.addEventListener('pointermove', event => {
      const rect = hero.getBoundingClientRect();
      stack.style.setProperty('--mx', ((event.clientX - rect.left) / rect.width - .5).toFixed(3));
      stack.style.setProperty('--my', ((event.clientY - rect.top) / rect.height - .5).toFixed(3));
    });
    hero.addEventListener('pointerleave', () => {
      stack.style.setProperty('--mx', 0);
      stack.style.setProperty('--my', 0);
    });
  }

  const progress = document.createElement('div');
  progress.className = 'motion-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.append(progress);
  let ticking = false;
  const updateProgress = () => {
    const distance = document.documentElement.scrollHeight - innerHeight;
    document.documentElement.style.setProperty('--page-progress', distance > 0 ? Math.min(1, scrollY / distance).toFixed(4) : 0);
    ticking = false;
  };
  addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateProgress);
  }, { passive: true });
  updateProgress();

  if (matchMedia('(pointer:fine)').matches) {
    addEventListener('pointermove', event => {
      document.documentElement.style.setProperty('--pointer-x', `${event.clientX}px`);
      document.documentElement.style.setProperty('--pointer-y', `${event.clientY}px`);
    }, { passive: true });
  }
})();
