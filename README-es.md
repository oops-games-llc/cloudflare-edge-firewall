# Conversion.Business Edge Firewall (Cloudflare Worker)

Este Cloudflare Worker actúa como un firewall de puerta de enlace API implementado en el borde (edge). Intercepta las solicitudes `POST` entrantes a sus puntos finales de API protegidos, extrae el token CAPTCHA gamificado de Conversion.Business y lo valida contra nuestro backend.

Si el token no es válido (tráfico de bots), el Worker descarta la conexión en el borde de la red con una respuesta `403 Forbidden`. El bot nunca llega a su servidor de origen, ahorrándole una carga masiva en la base de datos y ancho de banda.

## 1. Integración Frontend

Su equipo de frontend debe integrar el widget de Conversion.Business de forma nativa utilizando nuestros plantillas de Javascript. Cuando el usuario resuelve el CAPTCHA gamificado, su frontend debe adjuntar el token de validación a las solicitudes API salientes utilizando el encabezado HTTP personalizado `X-CB-Token`.

## 2. Despliegue

Para implementar este firewall en su red Cloudflare:

1. Clonar este repositorio.
2. Instalar dependencias: `npm install`
3. Editar `wrangler.toml` y configurar la matriz `routes` para que coincida con sus rutas de API.
4. Agregar de forma segura su clave secreta: `npx wrangler secret put CB_SECRET_KEY`
5. Desplegar en el borde: `npm run deploy`
