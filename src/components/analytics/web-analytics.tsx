import Script from "next/script";

/**
 * Cloudflare Web Analytics: çerezsiz ziyaret sayımı (KVKK onay bandı gerektirmez).
 * Yalnızca sayfa görüntüleme bilgisi gider; CV içeriği hiçbir zaman gönderilmez.
 *
 * Token repoda tutulmaz: derleme sırasında ortam değişkeninden okunur
 * (GitHub Actions → secrets.CF_WEB_ANALYTICS_TOKEN). Tanımlı değilse (ör. yerel
 * geliştirme) hiçbir şey eklenmez, böylece kendi testlerin istatistiklere karışmaz.
 */
export function WebAnalytics() {
  const token = process.env.CF_WEB_ANALYTICS_TOKEN;
  if (!token) return null;

  return (
    <Script
      src="https://static.cloudflareinsights.com/beacon.min.js"
      strategy="afterInteractive"
      data-cf-beacon={JSON.stringify({ token })}
    />
  );
}
