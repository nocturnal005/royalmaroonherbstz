export function initConnectionAwareness() {
  const detectSlowConnection = () => {
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    let isSlow = false;

    if (conn) {
      if (conn.saveData === true) {
        isSlow = true;
      } else {
        const type = conn.effectiveType;
        if (type === 'slow-2g' || type === '2g' || type === '3g') {
          isSlow = true;
        }
      }
    }

    if (isSlow) {
      document.body.classList.add('slow-connection');
    } else {
      document.body.classList.remove('slow-connection');
    }
  };

  // Run immediately
  detectSlowConnection();

  // Listen for connection changes
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (conn && typeof conn.addEventListener === 'function') {
    conn.addEventListener('change', detectSlowConnection);
  }

  // Fallback for browsers without Network Information API
  window.addEventListener('load', () => {
    if (!document.body.classList.contains('slow-connection')) {
      const timing = window.performance && window.performance.timing;
      if (timing) {
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        if (loadTime > 3000) { // Page load > 3 seconds
          document.body.classList.add('slow-connection');
        }
      }
    }
  });
}
