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
    let heroPointerFrame = 0;
    let heroPointerX = 0;
    let heroPointerY = 0;
    const updateHeroPointer = () => {
      heroPointerFrame = 0;
      const rect = hero.getBoundingClientRect();
      stack.style.setProperty('--mx', ((heroPointerX - rect.left) / rect.width - .5).toFixed(3));
      stack.style.setProperty('--my', ((heroPointerY - rect.top) / rect.height - .5).toFixed(3));
    };
    hero.addEventListener('pointermove', event => {
      heroPointerX = event.clientX;
      heroPointerY = event.clientY;
      if (!heroPointerFrame) heroPointerFrame = requestAnimationFrame(updateHeroPointer);
    });
    hero.addEventListener('pointerleave', () => {
      if (heroPointerFrame) cancelAnimationFrame(heroPointerFrame);
      heroPointerFrame = 0;
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
    let pointerFrame = 0;
    let pointerX = 0;
    let pointerY = 0;
    const updatePointer = () => {
      pointerFrame = 0;
      document.documentElement.style.setProperty('--pointer-x', `${pointerX}px`);
      document.documentElement.style.setProperty('--pointer-y', `${pointerY}px`);
    };
    addEventListener('pointermove', event => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (!pointerFrame) pointerFrame = requestAnimationFrame(updatePointer);
    }, { passive: true });
  }
})();
