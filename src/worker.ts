/**
 * Conversion.Business Cloudflare Edge Firewall
 */

export interface Env {
  CB_SECRET_KEY: string;
  CUSTOM_PATHS?: string;
}

function hexToUint8Array(hexString: string): Uint8Array {
  const bytes = new Uint8Array(hexString.length / 2);
  for (let i = 0; i < hexString.length; i += 2) {
    bytes[i / 2] = parseInt(hexString.substring(i, i + 2), 16);
  }
  return bytes;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    if (request.method !== "POST") {
      return fetch(request);
    }

    if (env.CUSTOM_PATHS) {
      const url = new URL(request.url);
      const paths = env.CUSTOM_PATHS.split(',').map(p => p.trim());
      const isProtected = paths.some(path => url.pathname.startsWith(path));
      if (!isProtected) {
        return fetch(request);
      }
    }

    const tokenBase64 = request.headers.get("X-CB-Token");

    if (!tokenBase64) {
      return new Response(JSON.stringify({ error: "Missing CAPTCHA validation token." }), {
        status: 403,
        headers: { "Content-Type": "application/json" }
      });
    }

    try {
      // Decode Base64 token
      const tokenStr = atob(tokenBase64);
      const tokenData = JSON.parse(tokenStr);
      const { payload, signature } = tokenData;

      if (!payload || !signature) {
         throw new Error("Invalid token format.");
      }

      // Replay Attack Prevention (5-minute TTL)
      const parsedPayload = JSON.parse(payload);
      if (Date.now() - parsedPayload.timestamp > 5 * 60 * 1000) {
        return new Response(JSON.stringify({ error: "CAPTCHA token expired." }), {
          status: 403,
          headers: { "Content-Type": "application/json" }
        });
      }

      // Local Zero-Latency Web Crypto HMAC Validation
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(env.CB_SECRET_KEY),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['verify']
      );

      const signatureBytes = hexToUint8Array(signature);
      const isValid = await crypto.subtle.verify(
        'HMAC',
        key,
        signatureBytes,
        encoder.encode(payload)
      );

      if (!isValid) {
        return new Response(JSON.stringify({ error: "CAPTCHA verification failed. Bot detected." }), {
          status: 403,
          headers: { "Content-Type": "application/json" }
        });
      }

      const pristineRequest = new Request(request);
      pristineRequest.headers.delete("X-CB-Token");

      return fetch(pristineRequest);

    } catch (error) {
      console.error("Conversion.Business Firewall Error:", error);
      return new Response(JSON.stringify({ error: "Malformed CAPTCHA token." }), {
         status: 403,
         headers: { "Content-Type": "application/json" }
      });
    }
  },
};
