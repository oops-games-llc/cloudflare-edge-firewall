# Conversion.Business Edge Firewall (Cloudflare Worker)

Ce Cloudflare Worker agit comme un pare-feu de passerelle API déployé à la périphérie (edge). Il intercepte les requêtes `POST` entrantes vers vos points de terminaison API protégés, extrait le jeton CAPTCHA gamifié de Conversion.Business et le valide par rapport à notre backend.

Si le jeton n'est pas valide (trafic de robots), le Worker abandonne la connexion avec une réponse `403 Forbidden`. Le robot n'atteint jamais votre serveur d'origine, vous faisant économiser une charge massive de base de données.

## Cryptographie Edge Zéro Latence
Contrairement aux CAPTCHAs obsolètes qui nécessitent que le Edge Worker effectue une requête `fetch` externe pour vérifier le jeton (ajoutant plus de 50 ms de latence et créant un point de défaillance unique), Conversion.Business utilise l'API native Web Crypto (`crypto.subtle`) pour vérifier localement la signature HMAC SHA-256 instantanément dans l'environnement V8.

## 1. Intégration Frontend

Votre équipe frontend doit intégrer le widget Conversion.Business nativement à l'aide de nos modèles Javascript. Lorsque l'utilisateur résout le CAPTCHA gamifié, votre frontend doit joindre le payload de validation et la signature aux requêtes API sortantes sous la forme d'une chaîne encodée en Base64 à l'aide de l'en-tête HTTP personnalisé `X-CB-Token`.

```javascript
// Exemple d'appel API Frontend
const tokenObj = {
    payload: event.data.payload,
    signature: event.data.signature
};
const base64Token = btoa(JSON.stringify(tokenObj));

fetch('https://api.yourdomain.com/v1/checkout', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-CB-Token': base64Token // Le {payload, signature} encodé en Base64
    },
    body: JSON.stringify(checkoutData)
});
```
## 2. Déploiement

Pour déployer ce pare-feu sur votre réseau Cloudflare :

1. Clonez ce dépôt.
2. Installez les dépendances : `npm install`
3. Modifiez `wrangler.toml` pour correspondre à vos itinéraires d'API.
4. Ajoutez en toute sécurité votre clé secrète : `npx wrangler secret put CB_SECRET_KEY`
5. Déployez : `npm run deploy`
