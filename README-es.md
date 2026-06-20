# Conversion.Business Edge Firewall (Cloudflare Worker)

Este Cloudflare Worker actúa como un firewall de puerta de enlace API implementado en el borde (edge). Intercepta las solicitudes `POST` entrantes a sus puntos finales de API protegidos, extrae el token CAPTCHA gamificado de Conversion.Business y lo valida contra nuestro backend.

Si el token no es válido (tráfico de bots), el Worker descarta la conexión en el borde de la red con una respuesta `403 Forbidden`. El bot nunca llega a su servidor de origen, ahorrándole una carga masiva en la base de datos y ancho de banda.

## Criptografía Edge de Cero Latencia
A diferencia de los CAPTCHAs antiguos que requieren que el Edge Worker realice una solicitud `fetch` externa para verificar el token (agregando más de 50 ms de latencia y creando un único punto de falla), Conversion.Business utiliza la API nativa Web Crypto (`crypto.subtle`) para verificar localmente la firma HMAC SHA-256 al instante dentro de V8.

## 1. Integración Frontend

Su equipo de frontend debe integrar el widget de Conversion.Business de forma nativa utilizando nuestras plantillas de Javascript. Cuando el usuario resuelve el CAPTCHA gamificado, su frontend debe adjuntar el payload de validación y la firma a las solicitudes API salientes como una cadena codificada en Base64 utilizando el encabezado HTTP personalizado `X-CB-Token`.

```javascript
// Ejemplo de llamada API Frontend
const tokenObj = {
    payload: event.data.payload,
    signature: event.data.signature
};
const base64Token = btoa(JSON.stringify(tokenObj));

fetch('https://api.yourdomain.com/v1/checkout', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-CB-Token': base64Token // {payload, signature} codificado en Base64
    },
    body: JSON.stringify(checkoutData)
});
```
## 2. Despliegue

Para implementar este firewall en su red Cloudflare:

1. Clonar este repositorio.
2. Instalar dependencias: `npm install`
3. Editar `wrangler.toml` y configurar la matriz `routes` para que coincida con sus rutas de API.
4. Agregar de forma segura su clave secreta: `npx wrangler secret put CB_SECRET_KEY`
5. Desplegar en el borde: `npm run deploy`
