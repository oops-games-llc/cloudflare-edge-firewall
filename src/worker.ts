/**
 * Conversion.Business Cloudflare Edge Firewall
 */

export interface Env {
  CB_SECRET_KEY: string;
  CUSTOM_PATHS?: string;
}

interface VerifyResponse {
  success: boolean;
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

    const token = request.headers.get("X-CB-Token");

    if (!token) {
      return new Response(JSON.stringify({ error: "Missing CAPTCHA validation token." }), {
        status: 403,
        headers: { "Content-Type": "application/json" }
      });
    }

    try {
      const verifyResponse = await fetch("https://api.conversion.business/v1/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          secret: env.CB_SECRET_KEY,
          response: token
        })
      });

      const verifyData = (await verifyResponse.json()) as VerifyResponse;

      if (!verifyData.success) {
        return new Response(JSON.stringify({ error: "CAPTCHA verification failed. Bot detected." }), {
          status: 403,
          headers: { "Content-Type": "application/json" }
        });
      }

      const pristineRequest = new Request(request);
      pristineRequest.headers.delete("X-CB-Token");

      return fetch(pristineRequest);

    } catch (error) {
      console.error("Conversion.Business API Error:", error);
      return fetch(request);
    }
  },
};
