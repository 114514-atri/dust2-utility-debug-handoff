# Cover note（可直接发给原作者）

---

Hi — thanks for the interest. Here is a handoff package for **utility practice mode** + **debug mode** + chat commands only.

### What’s included
- New modes: `utility` (solo nade practice / record / dummy feedback) and `debug` (fly, F8 points, `/region` paint).
- Full command list: see `docs/模式和指令.txt` (synced with `shared/mode-help.js`).
- Drop-in sources under `files/` plus merge notes under `wiring/`.
- Protocol deltas: `docs/PROTOCOL-ADDITIONS.md` (`clientCommand`, `practiceImport`, `/api/dev/callouts`).

### What’s intentionally NOT included
- Bot consumption of practice throws / painted regions (lineups, nade decision, region spots).
- You can wire bots later using the exported JSON formats; this PR stays focused on authoring tools.

### How to land it
1. Copy `files/**` into the repo tree.
2. Merge `wiring/*` into `server/index.js`, `server/game.js`, `client/main.js`, HUD/lobby/`index.html` — **do not** wholesale-replace `game.js`/`main.js` from my fork (my tree has unrelated bot edits).
3. Resolve chat: upstream `client/chat.js` vs package `client/chat-ui.js` (need `systemHtml` for colored lists / help).
4. Run `tests/practice-utility.mjs`.

Happy to adjust naming or split into smaller PRs if you prefer.

---

（中文摘要）只交道具模式、调试模式和指令实现；人机怎么用练习数据你们自己接。`files/` 可拷，`wiring/` 是对接说明，别整文件覆盖上游的 `game.js`。
