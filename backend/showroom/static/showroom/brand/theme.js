(() => {
  const root = document.documentElement;
  const media = matchMedia('(prefers-color-scheme: dark)');
  const saved = () => { try { return localStorage.getItem('manus-theme'); } catch { return null; } };
  const apply = theme => {
    root.dataset.theme = theme;
    document.querySelectorAll('[data-theme-toggle]').forEach(button => {
      button.setAttribute('aria-pressed', String(theme === 'dark'));
      button.textContent = theme === 'dark' ? '☀ Light mode' : '☾ Dark mode';
    });
  };
  const sync = () => apply(['dark', 'light'].includes(saved()) ? saved() : media.matches ? 'dark' : 'light');
  sync();
  document.addEventListener('DOMContentLoaded', sync);
  document.addEventListener('click', event => {
    if (!event.target.closest('[data-theme-toggle]')) return;
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('manus-theme', next); } catch {}
    apply(next);
  });
  media.addEventListener('change', sync);
  addEventListener('storage', event => { if (event.key === 'manus-theme' || event.key === null) sync(); });
})();
