# 验证记录

验证日期：2026-10-29。

## 页面范围

- 官网风格首页：`docs/index.html`。
- 完整功能工作区：`docs/workspace/index.html`。

## 首页自动检查

使用 Playwright + Chromium 检查当前官网首页，结果：通过。

- Images, icons, and local assets loaded
- Homepage interactive workflow passed
- No document overflow at 1440/768/390/360px
- Mobile navigation and zero page errors

## 工作区自动回归

原功能样品移动到嵌套目录后重新执行，结果：通过。

- Local images, icons and scoped tokens render
- Interactive workflow passed
- No document overflow at 1440/768/390/360px
- Mobile navigation/visibility checked

## 视觉检查

已查看当前首页的桌面和手机截图。已核对黑色开放画布、衬线标题、深色金属分块立方体；桌面和手机物件非空白且完整，像素、运动、暂停和旋转另有自动记录。

页面依据参考站的真实 HTML、CSS 与参考图调整构图、字号、色彩和产品展示方式；没有完成官网实时截图的逐像素对齐，也不声称像素级一致。使用原创品牌、文案和演示媒体。

## 复制与资源

- Skill frontmatter、名称与资源检查通过。
- `node scripts/check.mjs` / `npm run check` 用于文件、HTML 静态资源与 JavaScript 语法检查；它不是浏览器测试。
- 脚手架复制 19 个样品文件，逐文件 SHA-256 一致；同一目录重复运行停止，原有文件哈希保持不变。
- 字体、Lucide、照片和其他依赖来源见 [第三方说明](THIRD_PARTY_NOTICES.md)。

## 截图与复查

README 展示官网首页：`.github/preview-desktop.png`、`.github/preview-mobile.png`。工作区回归截图另存为 `.github/workspace-desktop.png`、`.github/workspace-mobile.png`，两组互不覆盖。

直接打开两个页面分别复查；后续修改布局和功能时需重新执行对应检查。GitHub Pages 地址规划见 README，本文不将本地测试视为发布成功证明。

## 范围

这是静态前端演示。业务记录、文章、笔记、表单结果和接口响应属于演示或浏览器本地状态。前端验证不代表后端、认证、支付、真实发送、生产可用性或完整可访问性审计已经完成。
