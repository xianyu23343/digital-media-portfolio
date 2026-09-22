(() => {
  const current = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('[data-page]').forEach(link => {
    if (link.getAttribute('href') === current || (current === 'index.html' && link.getAttribute('href') === 'index.html')) link.classList.add('active');
  });
  const filters = [...document.querySelectorAll('.filter')];
  const works = [...document.querySelectorAll('.work')];
  filters.forEach(btn => btn.addEventListener('click', () => {
    filters.forEach(b => b.classList.remove('active')); btn.classList.add('active');
    const filter = btn.dataset.filter;
    works.forEach(work => work.classList.toggle('hidden', filter !== 'all' && work.dataset.category !== filter));
  }));
  const videos = [...document.querySelectorAll('.work video, .category-tile video')];
  const lazyVideos = videos.filter(video => video.hasAttribute('data-lazy-video'));
  const startVideo = video => {
    video.autoplay = true;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = video.hasAttribute('data-lazy-video') ? 'metadata' : 'auto';
    video.dataset.started = 'true';
    const playback = video.play();
    if (playback && typeof playback.catch === 'function') playback.catch(() => {});
  };
  const pauseVideo = video => video.pause();
  videos.filter(video => !video.hasAttribute('data-lazy-video')).forEach(video => startVideo(video));
  if (lazyVideos.length && 'IntersectionObserver' in window) {
    const videoObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const video = entry.target;
        video.dataset.inViewport = String(entry.isIntersecting);
        if (entry.isIntersecting) startVideo(video);
        else pauseVideo(video);
      });
    }, { rootMargin: '240px 0px', threshold: .01 });
    lazyVideos.forEach(video => videoObserver.observe(video));
  } else {
    lazyVideos.forEach(video => startVideo(video));
  }
  works.forEach(work => {
    const video = work.querySelector('video');
    if (video) work.addEventListener('mouseenter', () => startVideo(video));
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      videos.forEach(video => pauseVideo(video));
      return;
    }
    videos.filter(video => !video.hasAttribute('data-lazy-video') || video.dataset.inViewport === 'true')
      .forEach(video => startVideo(video));
  });
  const revealItems = [...document.querySelectorAll('#featured .ref-section-head, #featured .featured-card, #directions .ref-section-head, #directions .direction-link, #operations .ref-section-head, #operations .operation-card, #operations .internship-panel')];
  if (revealItems.length) {
    revealItems.forEach(item => item.classList.add('reveal-item'));
    if ('IntersectionObserver' in window) {
      const revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        });
      }, { threshold: 0.14 });
      revealItems.forEach(item => revealObserver.observe(item));
    } else {
      revealItems.forEach(item => item.classList.add('is-visible'));
    }
    revealItems.forEach(item => {
      const press = () => {
        item.classList.remove('is-pressed');
        void item.offsetWidth;
        item.classList.add('is-pressed');
        window.setTimeout(() => item.classList.remove('is-pressed'), 560);
      };
      item.addEventListener('pointerdown', press);
      item.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') press();
      });
    });
  }
  const modal = document.querySelector('#workDetail, #modal');
  if (modal) {
    const isNativeDialog = modal instanceof HTMLDialogElement;
    const media = modal.querySelector('.work-detail-media, .modal-media');
    const modalCard = modal.querySelector('.work-detail-card, .modal-card');
    const clearMedia = () => { while (media.firstChild) media.removeChild(media.firstChild); };
    const close = () => {
      if (isNativeDialog && modal.open) modal.close();
      modal.classList.remove('is-poster-detail');
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      modal.style.removeProperty('opacity');
      modal.style.removeProperty('pointer-events');
      clearMedia();
      document.body.classList.remove('modal-open');
    };
    const openWork = work => {
      modal.classList.toggle('is-poster-detail', work.dataset.category === 'poster');
      modal.querySelector('#modalType').textContent = work.dataset.type;
      modal.querySelector('#modalTitle').textContent = work.dataset.title;
      modal.querySelector('#modalCopy').textContent = work.dataset.copy;
      modal.querySelector('#modalYear').textContent = work.dataset.year;
      modal.querySelector('#modalSoftware').textContent = work.dataset.software;
      if (isNativeDialog) {
        if (!modal.open) modal.showModal();
      } else {
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        modal.style.display = 'grid';
        modal.style.opacity = '1';
        modal.style.pointerEvents = 'auto';
      }
      document.body.classList.add('modal-open');
      if (modalCard && !isNativeDialog) {
        modalCard.scrollTop = 0;
        Object.assign(modalCard.style, { position: 'relative', top: 'auto', left: 'auto', transform: 'none', zIndex: 'auto', display: 'block', opacity: '1', visibility: 'visible' });
      }
      clearMedia();
      const video = work.querySelector('video');
      const image = work.querySelector('img');
      if (video) {
        const modalVideo = document.createElement('video');
        modalVideo.src = video.getAttribute('src') || video.currentSrc || video.src;
        modalVideo.autoplay = true;
        modalVideo.muted = true;
        modalVideo.loop = true;
        modalVideo.playsInline = true;
        modalVideo.controls = true;
        modalVideo.preload = 'auto';
        media.appendChild(modalVideo);
        const playModalVideo = () => {
          const playback = modalVideo.play();
          if (playback && typeof playback.catch === 'function') playback.catch(() => {});
        };
        modalVideo.addEventListener('loadedmetadata', playModalVideo, { once: true });
        requestAnimationFrame(playModalVideo);
      } else if (image) {
        const modalImage = image.cloneNode();
        modalImage.loading = 'eager';
        media.appendChild(modalImage);
      }
    };
    document.addEventListener('click', event => {
      const work = event.target.closest('.work.catalog-card');
      if (work) openWork(work);
    });
    const closeButton = modal.querySelector('.work-detail-close, .modal-close');
    if (closeButton) closeButton.addEventListener('click', close);
    modal.addEventListener('click', e => { if (e.target === modal) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
    if (isNativeDialog) modal.addEventListener('close', () => { clearMedia(); document.body.classList.remove('modal-open'); });
  }
  const pageRevealItems = [...document.querySelectorAll('.about-page [data-reveal], .method-page [data-reveal]')];
  if (pageRevealItems.length) {
    const revealPageItem = item => item.classList.add('is-visible');
    if ('IntersectionObserver' in window) {
      const pageRevealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          revealPageItem(entry.target);
          pageRevealObserver.unobserve(entry.target);
        });
      }, { threshold: 0.12 });
      pageRevealItems.forEach(item => pageRevealObserver.observe(item));
    } else {
      pageRevealItems.forEach(revealPageItem);
    }
  }
  document.querySelectorAll('[data-expandable]').forEach(entry => {
    const toggleEntry = () => {
      const expanded = entry.classList.toggle('is-expanded');
      entry.setAttribute('aria-expanded', String(expanded));
    };
    entry.addEventListener('click', toggleEntry);
    entry.addEventListener('keydown', event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      toggleEntry();
    });
  });
  const methodSteps = [...document.querySelectorAll('[data-method-step]')];
  methodSteps.forEach(step => {
    step.addEventListener('click', () => {
      const shouldOpen = !step.classList.contains('is-active');
      methodSteps.forEach(item => {
        item.classList.remove('is-active');
        item.setAttribute('aria-expanded', 'false');
      });
      if (shouldOpen) {
        step.classList.add('is-active');
        step.setAttribute('aria-expanded', 'true');
      }
    });
  });
  const operationLightbox = document.querySelector('#operationLightbox');
  if (operationLightbox) {
    const operationImage = operationLightbox.querySelector('#operationLightboxImage');
    const operationViewport = operationLightbox.querySelector('.operation-lightbox-viewport');
    const zoomLabel = operationLightbox.querySelector('#operationZoomLabel');
    let zoom = 1;
    let operationReturnScrollY = 0;
    const restoreOperationScroll = () => {
      requestAnimationFrame(() => window.scrollTo({left:0, top:operationReturnScrollY, behavior:'auto'}));
    };
    const clampZoom = value => Math.min(3, Math.max(1, value));
    const updateOperationImageSize = () => {
      if (!operationImage.naturalWidth || !operationImage.naturalHeight || !operationViewport) return;
      const availableWidth = Math.max(120, operationViewport.clientWidth - 28);
      const availableHeight = Math.max(120, operationViewport.clientHeight - 28);
      const fitScale = Math.min(availableWidth / operationImage.naturalWidth, availableHeight / operationImage.naturalHeight, 1);
      operationImage.style.width = `${Math.max(1, operationImage.naturalWidth * fitScale * zoom)}px`;
      operationImage.classList.toggle('is-zoomed', zoom > 1);
      if (zoomLabel) zoomLabel.textContent = `${Math.round(zoom * 100)}%`;
    };
    const setZoom = value => { zoom = clampZoom(value); updateOperationImageSize(); };
    const resetOperationImage = () => {
      zoom = 1;
      operationImage.style.width = '';
      operationImage.classList.remove('is-zoomed');
      if (zoomLabel) zoomLabel.textContent = '100%';
    };
    const closeOperationLightbox = () => { if (operationLightbox.open) operationLightbox.close(); restoreOperationScroll(); };
    document.addEventListener('click', event => {
      const trigger = event.target.closest('.operation-media-button');
      if (!trigger) return;
      event.preventDefault();
      operationReturnScrollY = window.scrollY;
      resetOperationImage();
      operationImage.src = trigger.dataset.image;
      operationImage.alt = trigger.dataset.alt || '';
      operationLightbox.showModal();
      requestAnimationFrame(() => {
        window.scrollTo({left:0, top:operationReturnScrollY, behavior:'auto'});
        if (operationImage.complete) updateOperationImageSize();
      });
    });
    operationImage.addEventListener('load', updateOperationImageSize);
    operationImage.addEventListener('click', () => setZoom(zoom === 1 ? 1.75 : 1));
    operationViewport.addEventListener('wheel', event => {
      event.preventDefault();
      setZoom(zoom + (event.deltaY < 0 ? .25 : -.25));
    }, {passive:false});
    operationLightbox.querySelector('#operationZoomOut').addEventListener('click', () => setZoom(zoom - .25));
    operationLightbox.querySelector('#operationZoomIn').addEventListener('click', () => setZoom(zoom + .25));
    operationLightbox.querySelector('#operationZoomReset').addEventListener('click', () => setZoom(1));
    operationLightbox.querySelector('.operation-lightbox-close').addEventListener('click', closeOperationLightbox);
    operationLightbox.addEventListener('click', event => { if (event.target === operationLightbox) closeOperationLightbox(); });
    operationLightbox.addEventListener('close', () => { resetOperationImage(); restoreOperationScroll(); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape') closeOperationLightbox(); });
  }
})();
