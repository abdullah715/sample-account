export default function Head() {
  return (
    <>
      <title>Accounts</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />

      {/* PWA */}
      <link rel="manifest" href="/manifest.json" />
      <meta name="theme-color" content="#ffffff" />
      <link rel="apple-touch-icon" href="/next.svg" />

      {/* Register service worker from client script */}
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <script defer>
        {`if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
          window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').catch(() => {});
          });
        }`}
      </script>
    </>
  );
}
