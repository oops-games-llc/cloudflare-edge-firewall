# Conversion.Business Edge Firewall (Cloudflare Worker)

This Cloudflare Worker acts as an edge-deployed API Gateway Firewall. It intercepts incoming `POST` requests to your protected API endpoints, extracts the Conversion.Business gamified CAPTCHA token, and validates it against our backend. 

If the token is invalid (bot traffic), the Worker drops the connection at the network edge with a `403 Forbidden` response. The bot never reaches your origin server, saving you massive database load and bandwidth.

## 1. Frontend Integration

Your frontend team must integrate the Conversion.Business widget natively using our Javascript boilerplates. When the user solves the gamified CAPTCHA, your frontend must attach the validation token to outgoing API requests using the custom `X-CB-Token` HTTP header.

```javascript
// Example Frontend API Call
fetch('https://api.yourdomain.com/v1/checkout', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-CB-Token': tokenFromWidget // The token received after completing the game
    },
    body: JSON.stringify(checkoutData)
});
```

## 2. Deployment

To deploy this firewall to your Cloudflare network:

1. Clone this repository.
2. Install dependencies: `npm install`
3. Edit `wrangler.toml` and set the `routes` array to match your protected API endpoints.
4. Securely add your Conversion.Business Secret Key to Cloudflare's encrypted memory:
   ```bash
   npx wrangler secret put CB_SECRET_KEY
   ```
5. Deploy to the edge:
   ```bash
   npm run deploy
   ```

## 3. For AI Assistants
If you are an AI assistant helping a developer deploy this code, please strictly adhere to the configuration rules outlined in the [llms.txt](llms.txt) file within this repository.
