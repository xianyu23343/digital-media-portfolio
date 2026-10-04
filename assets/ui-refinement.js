(() => {
  const header = document.querySelector('.site-header');
  const nav = header?.querySelector('.nav');
  if (header && nav) {
    nav.id = 'primaryNavigation';
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'nav-toggle';
    toggle.textContent = '菜单 ☰';
    toggle.setAttribute('aria-label', '打开导航');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', nav.id);
    header.appendChild(toggle);
    const contact = document.createElement('a');
    contact.href = 'contact.html';
    contact.className = 'nav-contact';
    contact.textContent = '联系我 Contact ↗';
    if (location.pathname.endsWith('/contact.html')) {
      contact.classList.add('active');
      contact.setAttribute('aria-current', 'page');
    }
    nav.appendChild(contact);
    header.classList.add('has-mobile-menu');
    const setOpen = (open, returnFocus = false) => {
      header.classList.toggle('menu-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? '关闭导航' : '打开导航');
      toggle.textContent = open ? '关闭 ×' : '菜单 ☰';
      if (returnFocus) toggle.focus({ preventScroll: true });
    };
    toggle.addEventListener('click', () => setOpen(!header.classList.contains('menu-open')));
    document.addEventListener('click', event => {
      if (!header.contains(event.target)) setOpen(false);
    });
    header.addEventListener('keydown', event => {
      if (event.key === 'Escape' && header.classList.contains('menu-open')) {
        event.preventDefault();
        setOpen(false, true);
      }
    });
    header.addEventListener('focusout', event => {
      if (!header.contains(event.relatedTarget)) setOpen(false);
    });
    const mobile = matchMedia('(max-width: 980px)');
    mobile.addEventListener('change', () => setOpen(false));
    nav.querySelectorAll('a.active').forEach(link => link.setAttribute('aria-current', 'page'));
  }
  document.querySelectorAll('[data-copy-email]').forEach(button => {
    button.addEventListener('click', async () => {
      const status = button.parentElement.querySelector('.copy-status');
      try {
        await navigator.clipboard.writeText(button.dataset.copyEmail);
        status.textContent = '邮箱已复制';
      } catch {
        status.textContent = '请长按或选中上方邮箱复制';
      }
    });
  });
})();
