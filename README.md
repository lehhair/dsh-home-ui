# dsh-home-ui

基于 [OpenCodeUI](https://github.com/lehhair/OpenCodeUI) 视觉语言的主页信息流精修插件（纯扩展，零核心改动）。

## 功能

参考 OpenCodeUI 的主页设计语言，对 DSH web 客户端主页做四处调整，全部通过插件自有的全局样式表实现：

1. **侧边栏配色与信息流统一** — 侧边栏列与每一层 shell 的填充色从偏灰的 bluish-50 改为与信息流相同的 `bg-base`，左右两栏读作同一块表面（OpenCodeUI 中侧边栏与聊天共用同一底色）。
2. **信息流 header 与侧边栏按钮对齐** — 侧边栏 shell 顶部控制行中心（展开与收起均为 y=36，官方几何不动）与信息流标题行对齐：standalone header 顶部 padding 从官方 12px 降到 20px，标题中心落在侧边栏按钮的 y=36 线上（0px 误差）。**分屏 pane 被显式排除**：split-panes 的 split 容器带稳定的 `data-direction` 属性，其内的 pane header 恢复官方 12px——分屏 pane 标题中心 ~37 本就与侧边栏对齐（frame 的 8px padding + 1px border 自然落在按钮线上），插件对分屏 pane 零影响。
3. **header 底部横线改为渐变** — 官方 header 下方的 1px 实线分隔改为 OpenCodeUI 式渐变带：从信息流底色（不透明）向下渐隐到透明，内容从 header 下浮现而不是被一条线切断（对应 OpenCodeUI 的 `data-chat-header-shadow`，h-8 from-bg-100 to-transparent）。
4. **宽屏模式** — 设置 → 通用 →「信息流宽度」：标准 / 宽屏两档。宽屏把 `--dsh-chat-content-width` 从 748px 放宽到 1080px，消息流、统计行、dock 卡、输入框整体放宽（与官方 748px 同构，只是更大）；偏好写入 localStorage，刷新后自动恢复。

明暗两种主题都生效；卸载插件即完全还原官方外观。

## 安装

```bash
# 在 dsh profile 目录
pnpm dsh plugin --profile web add @dsh-external/dsh-home-ui
```

或在 profile 的 `package.json` 中：

```json
{
  "dependencies": { "@dsh-external/dsh-home-ui": "link:../dsh-home-ui" },
  "dsh": { "profile": { "bundles": ["...", "@dsh-external/dsh-home-ui"] } }
}
```

## 推荐组合：纯前端 UI 扩展

dsh-home-ui 属于一组**纯前端视觉扩展**——它们只通过全局样式表、轻量 DOM 控制器和官方开放的 slot 工作，不改任何核心包，可以任意组合、独立卸载，叠加后也不会互相干扰。推荐按需搭配：

| 扩展 | 仓库 | 做什么 | 组合效果 |
|---|---|---|---|
| **dsh-home-ui**（本插件） | [lehhair/dsh-home-ui](https://github.com/lehhair/dsh-home-ui) | 主页信息流视觉精修 + 宽屏模式 | 基准视觉：侧边栏与信息流同底色、header 对齐、渐变分隔、宽屏开关 |
| **dsh-diff-viewer** | [lehhair/dsh-diff-viewer](https://github.com/lehhair/dsh-diff-viewer) | edit/write 工具的 diff 渲染增强 | 宽屏下 diff 自动左右分栏（按容器宽度判定），与宽屏模式天然契合 |
| **dsh-mobile** | [lehhair/dsh-mobile](https://github.com/lehhair/dsh-mobile) | 窄屏适配：chat pager、触摸目标、设置 dialog 卡片化 | 手机上也保持同一套视觉语言 |
| **dsh-split-panes** ⚠️ | [lehhair/dsh-split-panes](https://github.com/lehhair/dsh-split-panes) | 多会话分屏 | ⚠️ 需要渲染器会话绑定能力（官方 rc.5 未内置），见其 README 前置说明 |

**推荐组合**：

- **桌面宽屏体验**：`dsh-home-ui`（开宽屏）+ `dsh-diff-viewer`——信息流放宽、diff 自动 split，最接近 OpenCodeUI 的桌面观感。
- **全平台**：再加 `dsh-mobile`——桌面用上述组合，手机自动切换 pager 布局。
- **多会话**：需要分屏时再加 `dsh-split-panes`（注意其核心能力前置）。

## 原理

- 浏览器端 `src/client/index.ts` 挂载一个极小的 DOM 控制器，在 `<html>` 上设置 `data-dsh-home-ui` 作用域属性；全局样式表 `src/client/home-ui.css` 的每一条规则都挂在该作用域下。卸载插件（`ctx.effect` 清理 + 属性移除）后，注入的 `<style>` 标签失去作用域，官方 GUI 保持逐字节一致。
- 选择器只依赖跨发行版稳定的钩子：AppFrame 的 `data-sidebar-collapsed` / `data-details-collapsed` 属性、会话骨架的 `data-slot="conversation.session.header"` 座位、侧边栏的 `data-slot="sidebar"` 座位、页面唯一的 `<header>` 元素——不引用任何 hashed class 名，因此可作用于官方 npm 发行版。
- 对齐规则只调整 header 顶部 padding（standalone 20px，分屏 pane 内 12px），**完全不触碰侧边栏几何**；分屏 pane 通过 `data-direction` 属性排除，保证与 split-panes 插件零冲突。
- 宽屏偏好通过 `settings.general.item` 槽注册设置行（官方开放扩展点），localStorage 持久化，apply 时立即生效（不依赖设置页打开）。

## 开发

```bash
pnpm install
pnpm run check   # typecheck + test + build
```

测试覆盖：控制器作用域属性的幂等挂载/卸载、样式表的静态契约（全部规则作用域化、token 重绑、对齐与渐变规则存在）、宽屏 localStorage 持久化。

## 友情链接 / Friend Links

- [DSHFind](https://dshfind.com/) — DeepSeek Harness 插件市场与学习社区
