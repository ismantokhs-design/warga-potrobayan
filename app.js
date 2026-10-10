if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('SW Berhasil:', reg))
      .catch(err => console.error('SW Gagal:', err));
  });
}