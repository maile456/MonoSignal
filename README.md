# MonoSignal

**黑白精密的技术视觉，做成可复用的前端 skill。**

[在线样品](https://maile456.github.io/MonoSignal/) · [Skill 指令](SKILL.md) · [设计规范](references/design-system.md) · [样品源码](docs/)

![邮件投递与事件控制台桌面展示](.github/preview-desktop.png)

## 这是什么

MonoSignal 是一个面向 AI 编程助手的原创前端设计 skill，附带真实可操作的「邮件投递与事件控制台」样品。它定义布局、排版、色彩、组件状态与响应式决策，而不是让 AI 只模仿一张截图。灵感方向来自 [参考网站](https://resend.com/)，非其官方项目，不包含其官网源码或品牌素材。

适合希望采用「黑白精密的技术视觉」的项目。样品只是起点，不限制你做同类产品；已有 React、Vue 或其他项目均优先保留原有框架和功能。

## 样品交互

投递日志的组合搜索与状态筛选、Canvas 请求分布、详情时间线、本地模拟邮件与代码复制。

## 安装到 Codex

Windows PowerShell：

```powershell
$skillRoot = if ($env:CODEX_HOME) { Join-Path $env:CODEX_HOME 'skills' } else { Join-Path $env:USERPROFILE '.codex\skills' }
New-Item -ItemType Directory -Path $skillRoot -Force | Out-Null
git clone https://github.com/maile456/MonoSignal.git (Join-Path $skillRoot 'mono-signal')
```

macOS / Linux：

```sh
skill_root="${CODEX_HOME:-$HOME/.codex}/skills"
mkdir -p "$skill_root"
git clone https://github.com/maile456/MonoSignal.git "$skill_root/mono-signal"
```

目标已有内容时 Git 会停止，不覆盖已有 skill。安装后在下一轮对话调用；若当前列表尚未更新，重新打开对话。

```text
使用 $mono-signal 为我的项目设计前端。
先根据项目内容选择布局，保留现有框架和功能，完成响应式与实际交互。
```

## 运行与复用

直接打开 `docs/index.html` 即可体验，不需要安装依赖。也可以访问上方 GitHub Pages 在线样品。

需要复制到新项目目录时，使用 Node.js 18+：

```sh
node scripts/scaffold.mjs --dest "<尚不存在的新目录绝对路径>"
npm run check
```

`npm run check` 在本仓库执行，检查样品文件、静态资源与 JavaScript 语法；不是浏览器交互测试。样品的业务数据均为演示内容，表单不向外部提交，控制台不连接真实业务服务。具体可操作内容见在线页面。

<details>
<summary>手机展示</summary>

![手机展示](.github/preview-mobile.png)

</details>

浏览器交互、响应式与脚手架检查结果见 [验证记录](QA.md)。

## 目录

`SKILL.md` 是 skill 入口；`references/` 是设计规则；`assets/tokens.css` 是可移植浅深色变量；`docs/` 是完整静态样品，也是 Pages 发布目录；`scripts/` 提供复制和基础检查。

## 许可与素材

原创代码和设计规范使用 [MIT](LICENSE)。图标使用 [Lucide](https://lucide.dev/)，许可见 [第三方说明](THIRD_PARTY_NOTICES.md)；样品照片来源和适用许可也记录于该文件。照片不转授为 MIT，使用时请遵守其原许可。没有复制参考产品的 logo、插画或营销文案。

## 同系列

- [Clearfolio](https://github.com/maile456/Clearfolio)：清爽文档与作品秩序，样品为建筑与空间摄影作品集。
- [QuietNotes](https://github.com/maile456/QuietNotes)：温暖克制的阅读界面，样品为中文个人博客。
- [KindForm](https://github.com/maile456/KindForm)：友好极简的任务流程，样品为创意工作坊报名。
- [MonoSignal](https://github.com/maile456/MonoSignal)：黑白精密的技术视觉，样品为邮件投递与事件控制台。
- [CalmConsole](https://github.com/maile456/CalmConsole)：一致专业的业务工作台，样品为订单管理与详情编辑。
