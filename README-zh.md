# Conversion.Business Edge Firewall (Cloudflare Worker)

此 Cloudflare Worker 充当部署在边缘的 API 网关防火墙。它拦截发往受保护 API 端点的传入 `POST` 请求，提取 Conversion.Business 游戏化 CAPTCHA 令牌，并根据我们的后端对其进行验证。

如果令牌无效（机器人流量），Worker 将在网络边缘断开连接并返回 `403 Forbidden` 响应。机器人永远不会到达您的源服务器。

## 零延迟边缘加密
不同于需要 Edge Worker 发起外部 `fetch` 请求来验证令牌的传统 CAPTCHA（会增加超过 50 毫秒的延迟并产生单点故障），Conversion.Business 使用原生的 Web Crypto API (`crypto.subtle`) 在 V8 隔离环境中以零延迟在本地验证 HMAC SHA-256 签名。

## 1. 前端集成

您的前端团队必须使用我们的 Javascript 模板原生集成 Conversion.Business 小部件。当用户解决游戏化 CAPTCHA 时，您的前端必须将验证有效负载和签名作为 Base64 编码的字符串附加到传出的 API 请求中，并使用自定义的 HTTP 标头 `X-CB-Token`。

```javascript
// 前端 API 调用示例
const tokenObj = {
    payload: event.data.payload,
    signature: event.data.signature
};
const base64Token = btoa(JSON.stringify(tokenObj));

fetch('https://api.yourdomain.com/v1/checkout', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-CB-Token': base64Token // Base64 编码的 {payload, signature}
    },
    body: JSON.stringify(checkoutData)
});
```
## 2. 部署

要将此防火墙部署到您的 Cloudflare 网络：

1. 克隆此存储库。
2. 安装依赖项：`npm install`
3. 编辑 `wrangler.toml` 以匹配您的 API 路由。
4. 安全地添加您的密钥：`npx wrangler secret put CB_SECRET_KEY`
5. 部署到边缘：`npm run deploy`
