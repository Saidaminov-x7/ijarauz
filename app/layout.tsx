async function getServerTheme() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://backend-production-d0a5.up.railway.app/api';
    const res = await fetch(`${apiUrl}/site-settings/public/theme`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error('theme fetch failed');
    return await res.json();
  } catch {
    return {
      primaryColor: '#14b8a6',
      secondaryColor: '#0f766e',
      backgroundColor: '#f9fafb',
      textColor: '#111827',
      borderRadius: '0.75rem',
      fontFamily: 'Inter, sans-serif',
    };
  }
}

async function getServerSettings() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://backend-production-d0a5.up.railway.app/api';
    const res = await fetch(`${apiUrl}/site-settings/public`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) throw new Error('settings fetch failed');
    return await res.json();
  } catch {
    return {
      mobilePinchZoomEnabled: true,
    };
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, settings] = await Promise.all([
    getServerTheme(),
    getServerSettings(),
  ]);

  const pinchZoomEnabled = settings?.mobilePinchZoomEnabled !== false;

  return (
    <html suppressHydrationWarning>
      <head>
        <meta
          name="viewport"
          content={
            pinchZoomEnabled
              ? 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes'
              : 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
          }
        />
        <link rel="icon" href="/logotip.png" />
        <style
          id="server-theme-tokens"
          dangerouslySetInnerHTML={{
            __html: `:root {
              --color-primary: ${theme.primaryColor || '#14b8a6'};
              --color-secondary: ${theme.secondaryColor || '#0f766e'};
              --color-bg: ${theme.backgroundColor || '#f9fafb'};
              --color-text: ${theme.textColor || '#111827'};
              --border-radius: ${theme.borderRadius || '0.75rem'};
              --font-family: ${theme.fontFamily || 'Inter, sans-serif'};
            }`,
          }}
        />
        {/* Yandex.Metrika counter */}
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `
              (function(m,e,t,r,i,k,a){
                  m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
                  m[i].l=1*new Date();
                  for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
                  k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
              })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=112059980', 'ym');

              ym(112059980, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", referrer: document.referrer, url: location.href, accurateTrackBounce:true, trackLinks:true});
            `,
          }}
        />
        {/* /Yandex.Metrika counter */}
      </head>
      <body>
        <noscript>
          <div>
            <img
              src="https://mc.yandex.ru/watch/112059980"
              style={{ position: 'absolute', left: '-9999px' }}
              alt=""
            />
          </div>
        </noscript>
        {children}
      </body>
    </html>
  );
}
