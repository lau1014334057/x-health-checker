# X Health Checker

中文 | [English](#english)

## 项目简介

X Health Checker 是一个用于检查 X/Twitter 账号健康度和可见性信号的 Chrome 扩展与后端服务。

它可以在浏览 X 账号主页时识别当前账号，并通过后端 API 汇总账号健康分数、可见性限制检测结果和简短建议，减少用户在多个第三方工具之间手动复制用户名的麻烦。

> 注意：本项目是非官方工具，与 X Corp. 没有隶属、赞助或背书关系。检测结果来自公开信息和第三方信号，只能作为方向性诊断，不能视为官方账号状态判定。

## 主要功能

- 在 `x.com` 和 `twitter.com` 页面显示浮动检测面板
- 提供扩展弹窗和 Chrome 侧边栏视图
- 自动识别当前 X 个人主页用户名
- 通过后端 API 运行账号健康检查
- 展示账号健康分数、可见性检测和建议
- 在浏览器本地保存最近检测结果

## 数据来源

后端目前使用第三方公开接口获取：

- 账号分发健康分数
- 搜索建议、搜索可见性、幽灵封禁、回复降权等可见性信号

这些第三方服务可能随时变更、限流或不可用。因此，请把结果理解为辅助判断，而不是确定性的限流、封禁或账号状态结论。

## 项目结构

- `extension`：Chrome 扩展前端
- `backend`：账号评分和可见性检测 API 服务
- `shared`：前后端共享的 TypeScript 类型定义
- `docs`：产品、接口和技术设计文档

## 当前状态

本仓库已经完成开源前整理，可以用于本地开发和二次开发。

但它还不能直接发布到 Chrome Web Store。发布前需要部署一个生产环境 HTTPS 后端，并修改扩展配置。

开发环境下，扩展默认请求：

```text
http://localhost:8787
```

发布前需要修改：

- `extension/src/shared/config.ts`
- `extension/manifest.json`

将 API 地址改成你的 HTTPS 后端地址，并移除只用于本地开发的 host permissions。

## 环境要求

- Node.js 20+
- npm
- Chrome 或其他 Chromium 内核浏览器

## 本地开发

安装依赖：

```bash
npm install --ignore-scripts
```

构建所有包：

```bash
npm run build
```

启动后端：

```bash
npm --workspace backend run start
```

单独构建扩展：

```bash
npm run build:extension
```

加载本地扩展：

1. 打开 `chrome://extensions`
2. 开启 `Developer mode`
3. 点击 `Load unpacked`
4. 选择 `extension/dist`
5. 打开或刷新 `https://x.com`

## 配置说明

扩展 API 地址定义在：

```text
extension/src/shared/config.ts
```

生产环境示例：

```ts
export const API_BASE_URL = "https://api.example.com";
```

后端环境变量见 [.env.example](.env.example)。

## 检查命令

```bash
npm run typecheck
npm run build
```

## 发布说明

Chrome Web Store 发布前检查清单见 [CHROME_STORE.md](CHROME_STORE.md)。

## 隐私与安全

- 隐私说明：[PRIVACY.md](PRIVACY.md)
- 安全说明：[SECURITY.md](SECURITY.md)

## 故障排查

本地加载扩展时的已知错误记录在 [docs/troubleshooting.md](docs/troubleshooting.md)，包括 Chrome content script 报错：

```text
Uncaught SyntaxError: Unexpected token 'export'
```

## 开源协议

MIT License. See [LICENSE](LICENSE).

---

## English

X Health Checker is a Chrome extension and backend service for inspecting public account-level health and visibility signals for X accounts.

This is an unofficial project and is not affiliated with, endorsed by, or sponsored by X Corp. Results are estimates based on public and third-party signals, not an official account status determination.

The extension provides:

- a floating panel on `x.com` and `twitter.com`
- popup and side panel views
- X profile handle detection
- account health checks through a backend API
- local storage for recent check results

## Data Sources

The backend currently uses third-party public endpoints for:

- distribution health scoring
- visibility and restriction checks

These upstream services can change, rate-limit, or become unavailable without notice. Treat check results as directional diagnostics and avoid presenting them as guaranteed enforcement or reach status.

## Repository Structure

- `extension`: Chrome extension frontend
- `backend`: API server for score and visibility checks
- `shared`: shared TypeScript contracts
- `docs`: product and technical notes

## Current Status

This repository is prepared for open-source development, but it is not ready for public store release until you configure a production HTTPS backend.

The development extension currently calls:

```text
http://localhost:8787
```

Before publishing to Chrome Web Store, update [extension/src/shared/config.ts](extension/src/shared/config.ts) and remove local-only host permissions from [extension/manifest.json](extension/manifest.json).

## Requirements

- Node.js 20+
- npm
- Chrome or another Chromium-based browser for local extension testing

## Local Development

Install dependencies:

```bash
npm install --ignore-scripts
```

Build all packages:

```bash
npm run build
```

Start the backend:

```bash
npm --workspace backend run start
```

Build the extension:

```bash
npm run build:extension
```

Load the extension locally:

1. Open `chrome://extensions`
2. Enable `Developer mode`
3. Click `Load unpacked`
4. Select `extension/dist`
5. Open or refresh `https://x.com`

## Configuration

The extension API base URL is defined in:

```text
extension/src/shared/config.ts
```

For production, set it to your deployed HTTPS backend, for example:

```ts
export const API_BASE_URL = "https://api.example.com";
```

Then update `extension/manifest.json` host permissions to include that API host and remove local development permissions.

Backend environment variables are documented in [.env.example](.env.example).

## Checks

```bash
npm run typecheck
npm run build
```

## Publishing

See [CHROME_STORE.md](CHROME_STORE.md) for a Chrome Web Store checklist.

## Privacy

See [PRIVACY.md](PRIVACY.md).

## Security

See [SECURITY.md](SECURITY.md).

## Troubleshooting

Known local extension loading errors are documented in [docs/troubleshooting.md](docs/troubleshooting.md), including the Chrome content script error:

```text
Uncaught SyntaxError: Unexpected token 'export'
```

## License

MIT. See [LICENSE](LICENSE).
