# client/main.js + HUD + lobby + index.html

## Imports

```js
import { modeConfig, isBombMode, isDebugMode, isSandboxMode, isUtilityMode } from '../shared/match-rules.js';
import { downloadPracticeThrows, pickPracticeThrowsFile } from './practice-export.js';
import { PRACTICE_KIT, practiceUtilityAt } from '../shared/practice-throws.js';
import { PracticeTrajectory } from './practice-trajectory.js';
import { PracticeDummyHud } from './practice-dummy-hud.js';
import { CalloutEditor } from './callout-editor.js';
import './callout-editor.css';
import { ChatUI } from './chat-ui.js'; // or merge into existing chat.js
import './chat-ui.css';
import { RegionPainter } from './region-painter.js';
```

Also merge `css/practice-landing.css` into a loaded stylesheet.

## Construct helpers (after scene/camera/hud)

```js
const calloutEditor = new CalloutEditor({
  scene,
  camera,
  getPose: () => self ? { x: self.x, y: self.y, z: self.z, yaw: lookYaw } : null,
  toast: (message) => hud.toast(message),
});
const chat = new ChatUI({
  send: (payload) => send(payload),
  onOpenChange: (open) => { /* unlock pointer on open; relock when closed if in-game */ },
  onCommand: (text) => { send({ type: 'chat', scope: 'all', text }); return true; },
});
const regionPainter = new RegionPainter({
  scene,
  camera,
  toast: (message) => hud.toast(message),
  system: (message) => chat.system(message),
  systemHtml: (html, plain) => chat.systemHtml(html, plain),
});
const practiceTrajectory = new PracticeTrajectory(scene, $('hud'));
const practiceDummyHud = new PracticeDummyHud(scene);
```

## Handle `chatMessage` with `clientCommand`

See contributor reference: map

- `region*` → `regionPainter.*`
- `practice_export` → `downloadPracticeThrows`
- `practice_import_pick` → file pick then `send({ type:'practiceImport', ... })`
- `practice_list` / `mode_help` → `chat.systemHtml`
- `practice_show` → set look yaw/pitch, teleport stand, enable trajectory
- `practice_toast` → `hud.toast`

Full handler lives in contributor `client/main.js` as `handleChatMessage` — copy that function body.

## Utility hotkeys 1–4

When `isUtilityMode`:

```js
function selectPracticeUtility(index) {
  const id = practiceUtilityAt(index);
  slot = 4;
  utilityId = id;
  sendInput(currentInput());
}
// Bind Digit1..Digit4 → selectPracticeUtility(0..3)
// Mouse wheel / last-weapon cycle PRACTICE_KIT
```

## Mode UI

```js
function syncModeExclusiveButtons(modeValue) {
  const debug = isDebugMode(modeValue), utility = isUtilityMode(modeValue);
  if ($('export-regions')) $('export-regions').hidden = !debug;
  if ($('export-leave-button')) $('export-leave-button').hidden = !debug;
  if ($('export-practice')) $('export-practice').hidden = !utility;
  if ($('import-practice')) $('import-practice').hidden = !utility;
  if ($('export-practice-leave')) $('export-practice-leave').hidden = !utility;
}
```

On lobby mode change: hide bot setup & loadout for utility/debug; set bots to 0; update copy strings.

On snapshot: `practiceTrajectory.setEnabled(isUtilityMode(data.mode), connectionId)`; `practiceDummyHud.sync(...)`.

Each frame (utility): update trajectory from current aim/weapon; `calloutEditor.update()` always (F8).

## Pause menu buttons (wire click handlers)

- `#export-regions` → `regionPainter.exportRegions()`
- `#export-practice` → send `/out all` via chat (or dedicated helper)
- `#import-practice` → pick file → `practiceImport`
- leave variants: export then leave

## index.html

Mode select:

```html
<select id="mode">
  <option value="defuse" selected>竞技爆破 · 13 回合获胜</option>
  <option value="deathmatch">团队死斗 · 100 次击杀</option>
  <option value="utility">道具练习 · 录制 / 演示投掷</option>
  <option value="debug">调试模式 · 仅自己 · 标点 / 画区</option>
</select>
```

Near leave button in pause menu:

```html
<button id="export-regions" type="button" hidden>导出区域命名</button>
<button id="export-leave-button" type="button" hidden>导出并退出</button>
<button id="export-practice" type="button" hidden>导出道具点</button>
<button id="import-practice" type="button" hidden>导入道具点</button>
<button id="export-practice-leave" type="button" hidden>导出道具并退出</button>
```

## hud.js

Import `isDebugMode` / `isUtilityMode` / `modeConfig` (and optionally `calloutAt` for location label).

Update mode label, round tip, buy-note, scoreboard match state strings for utility/debug (see contributor `client/hud.js` grep `utility?'`).

## lobby.js

Use `modeConfig(room.mode).label` and `room.maxPlayers || modeConfig(room.mode).maxPlayers` instead of hard-coding only defuse/deathmatch titles.
