# Conversion.Business Edge Firewall (Cloudflare Worker)

Dieser Cloudflare Worker fungiert als am Rand (Edge) eingesetzte API-Gateway-Firewall. Er fängt eingehende `POST`-Anfragen an Ihre geschützten API-Endpunkte ab, extrahiert das Gamified-CAPTCHA-Token von Conversion.Business und validiert es gegen unser Backend.

Wenn das Token ungültig ist (Bot-Verkehr), bricht der Worker die Verbindung am Netzwerkrand mit einer `403 Forbidden`-Antwort ab. Der Bot erreicht niemals Ihren Ursprungsserver.

## Zero-Latency Edge-Kryptografie
Im Gegensatz zu veralteten CAPTCHAs, bei denen der Edge Worker einen externen `fetch` durchführen muss, um das Token zu verifizieren (was über 50 ms Latenz hinzufügt und einen Single Point of Failure schafft), verwendet Conversion.Business die native Web Crypto API (`crypto.subtle`), um die HMAC SHA-256-Signatur lokal und ohne Verzögerung im V8-Isolate zu verifizieren.

## 1. Frontend-Integration

Ihr Frontend-Team muss das Conversion.Business-Widget nativ mithilfe unserer Javascript-Vorlagen integrieren. Wenn der Benutzer das Gamified-CAPTCHA löst, muss Ihr Frontend die Validierungsdaten (Payload und Signatur) als Base64-codierten String über den benutzerdefinierten HTTP-Header `X-CB-Token` an ausgehende API-Anfragen anhängen.

```javascript
// Beispiel für einen Frontend-API-Aufruf
const tokenObj = {
    payload: event.data.payload,
    signature: event.data.signature
};
const base64Token = btoa(JSON.stringify(tokenObj));

fetch('https://api.yourdomain.com/v1/checkout', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-CB-Token': base64Token // Base64 encodierte {payload, signature}
    },
    body: JSON.stringify(checkoutData)
});
```
## 2. Bereitstellung

So stellen Sie diese Firewall in Ihrem Cloudflare-Netzwerk bereit:

1. Klonen Sie dieses Repository.
2. Abhängigkeiten installieren: `npm install`
3. Bearbeiten Sie `wrangler.toml`, um es an Ihre API-Routen anzupassen.
4. Fügen Sie Ihren geheimen Schlüssel sicher hinzu: `npx wrangler secret put CB_SECRET_KEY`
5. Bereitstellen: `npm run deploy`
