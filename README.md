# dsh-home-ui

基于 [OpenCodeUI](https://github.com/lehhair/OpenCodeUI) 视觉语言的主页信息流精修插件（纯扩展，零核心改动）。

## 功能

参考 OpenCodeUI 的主页设计语言，对 DSH web 客户端主页做三处视觉调整，全部通过插件自有的全局样式表实现：

1. **侧边栏配色与信息流统一** — 侧边栏列与每一层 shell 的填充色从偏灰的 bluish-50 改为与信息流相同的 `bg-base`，左右两栏读作同一块表面（OpenCodeUI 中侧边栏与聊天共用同一底色）。
2. **信息流 header 与侧边栏按钮对齐** — 侧边栏 shell 顶部控制行中心（展开与收起均为 y=36，官方几何不动）与信息流标题行对齐：standalone header 顶部 padding 从官方 12px 降到 20px，标题中心落在侧边栏按钮的 y=36 线上（0px 误差）。**分屏 pane 被显式排除**：split-panes 的 split 容器带稳定的 `data-direction` 属性，其内的 pane header 恢复官方 12px——分屏 pane 标题中心 ~37 本就与侧边栏对齐（frame 的 8px padding + 1px border 自然落在按钮线上），插件对分屏 pane 零影响。
3. **header 底部横线改为渐变** — 官方 header 下方的 1px 实线分隔改为 OpenCodeUI 式渐变带：从信息流底色（不透明）向下渐隐到透明，内容从 header 下浮现而不是被一条线切断（对应 OpenCodeUI 的 `data-chat-header-shadow`，h-8 from-bg-100 to-transparent）。

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

## 原理

- 浏览器端 `src/client/index.ts` 挂载一个极小的 DOM 控制器，在 `<html>` 上设置 `data-dsh-home-ui` 作用域属性；全局样式表 `src/client/home-ui.css` 的每一条规则都挂在该作用域下。卸载插件（`ctx.effect` 清理 + 属性移除）后，注入的 `<style>` 标签失去作用域，官方 GUI 保持逐字节一致。
- 选择器只依赖跨发行版稳定的钩子：AppFrame 的 `data-sidebar-collapsed` / `data-details-collapsed` 属性、会话骨架的 `data-slot="conversation.session.header"` 座位、侧边栏的 `data-slot="sidebar"` 座位、页面唯一的 `<header>` 元素——不引用任何 hashed class 名，因此可作用于官方 npm 发行版。
- 对齐规则只调整 header 顶部 padding（standalone 20px，分屏 pane 内 12px），**完全不触碰侧边栏几何**；分屏 pane 通过 `data-direction` 属性排除，保证与 split-panes 插件零冲突。

## 开发

```bash
pnpm install
pnpm run check   # typecheck + test + build
```

测试覆盖：控制器作用域属性的幂等挂载/卸载，以及样式表的静态契约（全部规则作用域化、token 重绑、展开/收起对齐与渐变规则存在）。
