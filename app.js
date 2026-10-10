if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then((reg) => console.log('SW Registered:', reg.scope))
      .catch((err) => console.error('SW Error:', err));
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const statusEl = document.getElementById('pwa-status');
  if (statusEl) {
    statusEl.innerText = 'Service Worker Aktif & Siap Dites PWA!';
  }
});