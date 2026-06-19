# Conversion.Business Edge Firewall (Cloudflare Worker)

此 Cloudflare Worker 充当部署在边缘的 API 网关防火墙。它拦截发往受保护 API 端点的传入 `POST` 请求，提取 Conversion.Business 游戏化 CAPTCHA 令牌，并根据我们的后端对其进行验证。

如果令牌无效（机器人流量），Worker 将在网络边缘断开连接并返回 `403 Forbidden` 响应。机器人永远不会到达您的源服务器。

## 1. 前端集成

您的前端团队必须使用我们的 Javascript 样板原生集成 Conversion.Business 小部件。当用户解决 CAPTCHA 时，您的前端必须使用自定义 HTTP 标头 `X-CB-Token` 将验证令牌附加到传出的 API 请求。

## 2. 部署

要将此防火墙部署到您的 Cloudflare 网络：

1. 克隆此存储库。
2. 安装依赖项：`npm install`
3. 编辑 `wrangler.toml` 以匹配您的 API 路由。
4. 安全地添加您的密钥：`npx wrangler secret put CB_SECRET_KEY`
5. 部署到边缘：`npm run deploy`
