(() => {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  const RELOAD_FLAG = 'ogm-sw-controller-reloaded';
  const currentScript = document.currentScript;
  const scriptUrl =
    currentScript && currentScript.src
      ? currentScript.src
      : new URL('registerSW.js', window.location.href).href;
  const workerUrl = new URL('sw.js', scriptUrl);
  const scopeUrl = new URL('./', workerUrl);

  const register = async () => {
    try {
      const hadController = !!navigator.serviceWorker.controller;

      navigator.serviceWorker.addEventListener(
        'controllerchange',
        () => {
          if (!hadController || sessionStorage.getItem(RELOAD_FLAG)) {
            return;
          }

          sessionStorage.setItem(RELOAD_FLAG, '1');
          window.location.reload();
        },
        { once: true }
      );

      await navigator.serviceWorker.register(workerUrl.href, {
        scope: scopeUrl.pathname,
        updateViaCache: 'none',
      });

      if (!hadController) {
        sessionStorage.removeItem(RELOAD_FLAG);
      }
    } catch (error) {
      console.warn('Service worker registration failed:', error);
    }
  };

  if (document.readyState === 'complete') {
    void register();
  } else {
    window.addEventListener('load', () => void register(), { once: true });
  }
})();
