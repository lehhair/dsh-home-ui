# dsh-home-ui

基于 [OpenCodeUI](https://github.com/lehhair/OpenCodeUI) 视觉语言的主页信息流精修插件（纯扩展，零核心改动）。

## 功能

参考 OpenCodeUI 的主页设计语言，对 DSH web 客户端主页做三处视觉调整，全部通过插件自有的全局样式表实现：

1. **侧边栏配色与信息流统一** — 侧边栏列与每一层 shell 的填充色从偏灰的 bluish-50 改为与信息流相同的 `bg-base`，左右两栏读作同一块表面（OpenCodeUI 中侧边栏与聊天共用同一底色）。
2. **信息流 header 与侧边栏按钮对齐** — 侧边栏 shell 顶部控制行与 header 标题行对齐在同一条线上：展开时标题文字与侧边栏 brand / 折叠按钮垂直中心完全一致（0px 误差）；**收起为 rail 后同样对齐**（rail 顶部 padding 从官方 18px 收至 4px，36px 控制盒中心落在同一标题线）。
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
- 对齐规则通过 `:not([data-sidebar-collapsed])` 钉住「侧边栏展开」状态、通过 `[data-sidebar-collapsed]` 钉住「收起 rail」状态，details 打开等其他状态保持官方几何。

## 开发

```bash
pnpm install
pnpm run check   # typecheck + test + build
```

测试覆盖：控制器作用域属性的幂等挂载/卸载，以及样式表的静态契约（全部规则作用域化、token 重绑、展开/收起对齐与渐变规则存在）。
