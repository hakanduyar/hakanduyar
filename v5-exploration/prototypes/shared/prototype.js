const params = new URLSearchParams(location.search);
const theme = params.get('theme') === 'light' ? 'light' : 'dark';
document.documentElement.dataset.theme = theme;
document.documentElement.dataset.motion = params.get('motion') === 'reduce' ? 'reduce' : 'full';

document.querySelectorAll('[data-theme-link]').forEach((link) => {
  link.setAttribute('href', `?theme=${link.dataset.themeLink}`);
  link.setAttribute('aria-current', link.dataset.themeLink === theme ? 'true' : 'false');
});

document.querySelectorAll('[data-year]').forEach((node) => {
  node.textContent = new Date().getFullYear();
});
