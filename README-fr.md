# Conversion.Business Edge Firewall (Cloudflare Worker)

Ce Cloudflare Worker agit comme un pare-feu de passerelle API déployé à la périphérie (edge). Il intercepte les requêtes `POST` entrantes vers vos points de terminaison API protégés, extrait le jeton CAPTCHA gamifié de Conversion.Business et le valide par rapport à notre backend.

Si le jeton n'est pas valide (trafic de robots), le Worker abandonne la connexion avec une réponse `403 Forbidden`. Le robot n'atteint jamais votre serveur d'origine, vous faisant économiser une charge massive de base de données.

## 1. Intégration Frontend

Votre équipe frontend doit intégrer le widget Conversion.Business nativement. Lorsque l'utilisateur résout le CAPTCHA, votre frontend doit joindre le jeton de validation aux requêtes API sortantes à l'aide de l'en-tête HTTP `X-CB-Token`.

## 2. Déploiement

Pour déployer ce pare-feu sur votre réseau Cloudflare :

1. Clonez ce dépôt.
2. Installez les dépendances : `npm install`
3. Modifiez `wrangler.toml` pour correspondre à vos itinéraires d'API.
4. Ajoutez en toute sécurité votre clé secrète : `npx wrangler secret put CB_SECRET_KEY`
5. Déployez : `npm run deploy`
