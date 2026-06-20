# Conversion.Business Edge Firewall (Cloudflare Worker)

Este Cloudflare Worker atua como um firewall de gateway de API implantado na borda (edge). Ele intercepta solicitações `POST` de entrada para seus endpoints de API protegidos, extrai o token CAPTCHA gamificado da Conversion.Business e o valida em nosso back-end.

Se o token for inválido (tráfego de bot), o Worker descarta a conexão com uma resposta `403 Forbidden`. O bot nunca atinge seu servidor de origem, economizando carga massiva de banco de dados.

## Criptografia Edge com Zero Latência
Ao contrário dos CAPTCHAs legados que exigem que o Edge Worker faça uma solicitação `fetch` externa para verificar o token (adicionando mais de 50 ms de latência e criando um único ponto de falha), o Conversion.Business usa a API nativa Web Crypto (`crypto.subtle`) para verificar localmente a assinatura HMAC SHA-256 instantaneamente no V8.

## 1. Integração de Frontend

Sua equipe de frontend deve integrar o widget Conversion.Business nativamente usando nossos modelos Javascript. Quando o usuário resolve o CAPTCHA gamificado, seu frontend deve anexar o payload de validação e a assinatura às solicitações de API de saída como uma string codificada em Base64 usando o cabeçalho HTTP personalizado `X-CB-Token`.

```javascript
// Exemplo de chamada de API Frontend
const tokenObj = {
    payload: event.data.payload,
    signature: event.data.signature
};
const base64Token = btoa(JSON.stringify(tokenObj));

fetch('https://api.yourdomain.com/v1/checkout', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-CB-Token': base64Token // {payload, signature} codificado em Base64
    },
    body: JSON.stringify(checkoutData)
});
```
## 2. Implantação

Para implantar este firewall em sua rede Cloudflare:

1. Clone este repositório.
2. Instalar dependências: `npm install`
3. Edite `wrangler.toml` para corresponder às suas rotas de API.
4. Adicione sua chave secreta com segurança: `npx wrangler secret put CB_SECRET_KEY`
5. Implantar na borda: `npm run deploy`
