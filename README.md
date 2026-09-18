**GitHub：** https://github.com/114514-atri/dust2-utility-debug-handoff

# 移交包：道具模式 + 调试模式 + 指令

**范围**：仅贡献「道具练习 (`utility`)」与「调试 (`debug`)」两套模式、聊天指令、相关协议与 UI。  
**不含**：人机练习接入、lineup 合并、`bot-utility` / `bot-tactics` / `bot-nade-decision` / `bot-region-spots` 等 bot 消费逻辑（留给维护者自行接线）。

贡献者本地实现 → 本目录可直接拷贝的新文件 + 接线说明。请基于上游 `ETO-ze/dust2-web` 打补丁合并，**不要整文件覆盖**已大幅分叉的 `server/game.js` / `client/main.js`。

---

## 目录结构

```
handoff-utility-debug/
  README.md                 ← 本说明（中英要点）
  FILE-LIST.md              ← 文件清单：新增 / 修改 / 不要交
  docs/
    模式和指令.txt          ← 玩家指令表
    PROTOCOL-ADDITIONS.md   ← 建议写入 server/PROTOCOL.md 的增量
  files/                    ← 按仓库路径摆好的可拷贝源码
    shared/...
    server/...
    client/...
    tests/...
  css/                      ← 可并入现有 CSS 的片段
  wiring/                   ← 必须改动的接线片段（对照合并）
```

---

## 给维护者（How to integrate）

1. 将 `files/**` 按相对路径拷入仓库（与现有 `client/chat.js` 冲突时见下）。
2. 按 `wiring/` 与 `FILE-LIST.md` 修改：`match-rules`（若用 `files/shared/match-rules.js` 可整文件替换）、`server/index.js`、`server/game.js`、`client/main.js`、`client/hud.js`、`client/lobby.js`、`index.html`。
3. 合并 CSS：`css/practice-landing.css` → 任意已加载的游戏 CSS；聊天区域色可进 chat CSS。
4. 聊天：本包提供 `client/chat-ui.js`（含 `systemHtml`）。上游若仍用 `client/chat.js`，请把 `system` / `systemHtml` / 指令发送能力合并进现有聊天，或改名统一引用。
5. 跑 `tests/practice-utility.mjs`（及现有 match-rules 测试）。
6. **Bot**：导出的 practice JSON / `map-callouts.json` 格式稳定后，可自行接到 lineup / 站位；本 PR 不包含。

### 模式行为摘要

| Mode | 用途 | bots | 购买 |
|------|------|------|------|
| `utility` | 录制/回放投掷、假人测伤、无限四道具 | 强制 0 | 关闭（1–4 快捷） |
| `debug` | `/fly`、F8 标点、`/region` 画区 | 强制 0 | 沙盒免费 |

指令全文见 `docs/模式和指令.txt`（与 `shared/mode-help.js` 同步）。

### 新协议（详见 docs/PROTOCOL-ADDITIONS.md）

- `join.mode`: `utility` | `debug`
- `chat` → `chatMessage` 可带 `clientCommand` + `args`
- `practiceImport`：导入道具点 JSON
- HTTP `GET/PUT/POST /api/dev/callouts`

---

## 给贡献者（你这边怎么发）

1. Fork 上游 → 新分支（例如 `feat/utility-debug-modes`）。
2. 拷贝 `files/`，按 `wiring/` 手工合并，**不要**提交本机的 `人机学习/`、一键脚本、bot 大改。
3. 把 `docs/模式和指令.txt` 放到仓库 `docs/`（或 README 链接）。
4. PR 描述可写：

> Adds solo **utility practice** and **debug** modes with chat commands (`/record`, `/show`, `/region`, …).  
> Practice packs live under `shared/practice-packs/`. Callouts API at `/api/dev/callouts`.  
> Bot consumption of practice/callout data is **out of scope** — data formats are ready for a follow-up.

---

## 验收清单

- [ ] 大厅可选「道具练习」「调试模式」
- [ ] 道具：`/help`、假人 `/set`、录制 `/record`、回放 `/show`、导入导出 `/in` `/out`
- [ ] 调试：`/fly`、`/region` 画区、F8 标点、暂停菜单「导出区域」
- [ ] 道具/调试房不加人机
- [ ] 未改 bot 战术主路径（或仅文档说明后续可接）
