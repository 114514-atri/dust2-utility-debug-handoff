# 文件清单

## A. 直接拷贝（本包 `files/` → 仓库根）

| 路径 | 说明 |
|------|------|
| `shared/match-rules.js` | 含 `GAME_MODES`：`utility` / `debug`（可整文件替换上游小文件） |
| `shared/mode-help.js` | `/help` 文案 |
| `shared/chat.js` | `parseChatCommand` / 消毒（上游无此文件） |
| `shared/practice-throws.js` | 道具点数据结构 |
| `shared/practice-packs.js` | 扫描 `shared/practice-packs/*.json` |
| `shared/practice-packs/.gitkeep` | 空目录占位 |
| `shared/map-callouts.js` | callout / 涂区运行时 |
| `shared/map-callouts.json` | 初始 callout 数据 |
| `server/practice-utility.js` | 道具模式服务端核心 |
| `server/callout-store.js` | `/api/dev/callouts` |
| `client/practice-export.js` | 下载 / 选文件导入 |
| `client/practice-trajectory.js` | 道具辅助 PiP |
| `client/practice-dummy-hud.js` | 假人头顶反馈 |
| `client/region-painter.js` | `/region` 画区 |
| `client/callout-editor.js` + `.css` | F8 标点 |
| `client/chat-ui.js` + `.css` | 增强聊天（见下方冲突说明） |
| `tests/practice-utility.mjs` | 模式/指令测试 |

文档：`docs/模式和指令.txt` → 建议放到仓库 `docs/模式和指令.txt`。

CSS 片段（`css/`）：合并进现有样式即可，不必单独成文件。

---

## B. 必须手工改（见 `wiring/`）

| 路径 | 改什么 |
|------|--------|
| `server/index.js` | `normalizeMode`；`loadCalloutsFromDisk`；`handleCalloutApi`；chat 回传 `clientCommand`；`practiceImport` |
| `server/game.js` | 引入 practice；构造器 `initPracticeRoom`；沙盒规则；假人/录制/回放；`handleChat` / `handleChatCommand` / `importPractice`；snapshot 字段 |
| `client/main.js` | 引入编辑器/practice；处理 `clientCommand`；模式 UI；1–4 快捷；暂停菜单按钮 |
| `client/hud.js` | 道具/调试文案；可选 callout 地名 |
| `client/lobby.js` | `modeConfig(room.mode).label` 等 |
| `index.html` | `<option value="utility|debug">`；暂停菜单导出/导入按钮 |
| `server/PROTOCOL.md` | 贴入 `docs/PROTOCOL-ADDITIONS.md` |

---

## C. 聊天文件冲突

| 上游 | 本包 |
|------|------|
| `client/chat.js` + `client/chat.css` | `client/chat-ui.js` + `client/chat-ui.css` |

任选其一：

1. **推荐**：把本包 `systemHtml`、指令 `onCommand` 能力合并进上游 `chat.js`，不改名。  
2. 或改用 `chat-ui`，并全局替换 import。

聊天必须支持：普通系统行 + **可信 HTML 系统行**（`/list`、`/help`、区域列表着色）。

---

## D. 不要放进本次贡献

- 任何人机练习消费：`practice-lineups.js`、`practice-bot-throws.json`、`all-lineups.js`、`bot-nade-decision.js`、`bot-region-spots.js`、`map-region-roles.js`
- 对 `bot-utility.js` / `bot-tactics.js` 的改造
- `scripts/import-practice-lineups.mjs`、`calibrate-callout-lineups.mjs`
- 本地杂项：`人机学习/`、`地图1/`、`cs2-workshop-maps/`、各类 `.cmd`、根目录散落 json
- 本机其它 bot 重构文件（`bot-roster`、`bot-shaping`、`bot-skill-profile` 等）

---

## E. 可选后续（维护者）

调试导出的 `map-callouts.json`、道具导出的 practice JSON，可供 bot 选位 / 学习投掷；数据契约见 practice-throws / map-callouts 源码，本移交不实现消费侧。
