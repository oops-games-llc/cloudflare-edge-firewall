# Conversion.Business Edge Firewall (Cloudflare Worker)

Este Cloudflare Worker atua como um firewall de gateway de API implantado na borda (edge). Ele intercepta solicitações `POST` de entrada para seus endpoints de API protegidos, extrai o token CAPTCHA gamificado da Conversion.Business e o valida em nosso back-end.

Se o token for inválido (tráfego de bot), o Worker descarta a conexão com uma resposta `403 Forbidden`. O bot nunca atinge seu servidor de origem, economizando carga massiva de banco de dados.

## 1. Integração de Frontend

Sua equipe de frontend deve integrar o widget Conversion.Business nativamente. Quando o usuário resolve o CAPTCHA, seu frontend deve anexar o token de validação às solicitações de API de saída usando o cabeçalho HTTP `X-CB-Token`.

## 2. Implantação

Para implantar este firewall em sua rede Cloudflare:

1. Clone este repositório.
2. Instalar dependências: `npm install`
3. Edite `wrangler.toml` para corresponder às suas rotas de API.
4. Adicione sua chave secreta com segurança: `npx wrangler secret put CB_SECRET_KEY`
5. Implantar na borda: `npm run deploy`
