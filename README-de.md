# Conversion.Business Edge Firewall (Cloudflare Worker)

Dieser Cloudflare Worker fungiert als am Rand (Edge) eingesetzte API-Gateway-Firewall. Er fängt eingehende `POST`-Anfragen an Ihre geschützten API-Endpunkte ab, extrahiert das Gamified-CAPTCHA-Token von Conversion.Business und validiert es gegen unser Backend.

Wenn das Token ungültig ist (Bot-Verkehr), bricht der Worker die Verbindung am Netzwerkrand mit einer `403 Forbidden`-Antwort ab. Der Bot erreicht niemals Ihren Ursprungsserver.

## 1. Frontend-Integration

Ihr Frontend-Team muss das Conversion.Business-Widget mithilfe unserer Javascript-Boilerplates nativ integrieren. Wenn der Benutzer das CAPTCHA löst, muss Ihr Frontend das Validierungstoken über den benutzerdefinierten HTTP-Header `X-CB-Token` an ausgehende API-Anfragen anhängen.

## 2. Bereitstellung

So stellen Sie diese Firewall in Ihrem Cloudflare-Netzwerk bereit:

1. Klonen Sie dieses Repository.
2. Abhängigkeiten installieren: `npm install`
3. Bearbeiten Sie `wrangler.toml`, um es an Ihre API-Routen anzupassen.
4. Fügen Sie Ihren geheimen Schlüssel sicher hinzu: `npx wrangler secret put CB_SECRET_KEY`
5. Bereitstellen: `npm run deploy`
