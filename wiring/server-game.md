# server/game.js — merge hints

Do **not** replace your whole `game.js` with the contributor’s copy (it contains unrelated bot changes). Port the hooks below.

## Imports

```js
import {
  MATCH_RULES, botCount, defuseDecision, grenadeMode, grenadeStrength,
  modeConfig, isSandboxMode, isDebugMode, isUtilityMode,
} from '../shared/match-rules.js';
import { formatModeHelp } from '../shared/mode-help.js';
import {
  initPracticeRoom,
  capturePracticeThrow,
  notePracticeImpact,
  practiceDummyInput,
  handlePracticeCommand,
  afterPracticeRespawn,
  practiceThrowCount,
  importPracticeThrows,
  bumpPracticeDummyHud,
  practiceDummyHudSnapshot,
  equipPracticeKit,
  refillPracticeAmmo,
  startPracticeThrowTape,
  samplePracticeThrowTape,
  finalizePracticeThrowTape,
  clearPracticeThrowTape,
  beginPracticeReplay,
  stepPracticeReplay,
  clearPracticeReplay,
} from './practice-utility.js';
import { sanitizeChatText, parseChatCommand } from '../shared/chat.js';
```

## Constructor (`GameRoom`)

- `const cfg = modeConfig(mode);` then set `this.mode`, `maxPlayers`, `teamSize`, `maxBots` from cfg.
- If `debug` or `utility`: `desiredBots = 0`; stretch buy/round timers; `winTarget = 0`.
- Round starts `live` when `isSandboxMode`.
- End of constructor: `initPracticeRoom(this);`
- Getters: `get ruleset(){ return modeConfig(this.mode).ruleset; }` and `get sandbox(){ return isSandboxMode(this.mode); }`

## Player spawn / buy

- On add/respawn in utility: `equipPracticeKit(player)` (no rifles unless you want them).
- `buyStatus`: utility → buy disabled with note about keys 1–4.
- Sandbox (deathmatch + debug + utility): free armor etc.; debug can grant defuse kit.

## Damage / grenades

- `godMode` early-out in damage.
- Practice dummies: `notePracticeImpact` + `bumpPracticeDummyHud` on HE/fire/flash.
- Utility humans at 0 HP: refill HP/armor instead of `kill` (keep throwing).
- Friendly-fire skip should **not** skip `practiceDummy` targets when measuring nades.
- On throw release in utility: `finalizePracticeThrowTape` + `capturePracticeThrow` + `refillPracticeAmmo`.
- While priming: `startPracticeThrowTape` / `samplePracticeThrowTape`.

## Tick

- If `p.practiceDummy` → `practiceDummyInput(p)` (frozen at hold point).
- If `p.practiceReplay` → `stepPracticeReplay`; skip normal input while replaying.

## Chat API (add methods)

```js
handleChat(id, { scope = 'all', text = '' } = {}) {
  const p = this.controlledPlayer(id);
  if (!p) return { ok: false, message: '未加入房间。' };
  const cleaned = sanitizeChatText(text);
  if (!cleaned) return { ok: false, message: '空消息。' };
  const command = parseChatCommand(cleaned);
  if (command) {
    const result = this.handleChatCommand(p, command);
    if (result) return result;
  }
  const payload = {
    type: 'chatMessage',
    playerId: p.id,
    name: p.name,
    team: p.team,
    scope: scope === 'team' ? 'team' : 'all',
    text: cleaned,
    dead: !p.alive,
    time: this.clock(),
  };
  this.emit('chat', payload);
  return { ok: true, broadcast: payload };
}

importPractice(id, { throws: entries, force = false, packId = 'import' } = {}) {
  if (!this.players.has(id) && !this.controlledPlayer(id)) {
    return { ok: false, message: '未加入房间。' };
  }
  return importPracticeThrows(this, entries, { force: !!force, packId });
}

handleChatCommand(p, command) {
  const { name, args } = command;
  const practice = handlePracticeCommand(this, p, command);
  if (practice) return practice;
  if (name === 'help') return formatModeHelp(this.mode);
  if (name === 'fly') {
    if (!isDebugMode(this.mode) && !isUtilityMode(this.mode)) {
      return { ok: true, private: true, reply: '/fly 仅在调试模式或道具练习可用' };
    }
    p.svCheats = true;
    const on = !(p.noclip && p.fly);
    p.noclip = on;
    p.fly = on;
    if (!on && p.godMode) p.godMode = false;
    return { ok: true, private: true, reply: `fly ${on ? 'on（飞行+穿墙）' : 'off'}` };
  }
  const regionAliases = {
    region: 'region',
    name: 'region_name',
    end: 'region_end',
    cancel: 'region_cancel',
    rlist: 'region_list',
    clear: 'region_clear',
    rshow: 'region_show',
  };
  if (Object.hasOwn(regionAliases, name)) {
    if (!isDebugMode(this.mode)) {
      return { ok: true, private: true, reply: '画区指令仅调试模式可用（/region · /rlist · /rshow）' };
    }
    return { ok: true, private: true, clientCommand: regionAliases[name], args };
  }
  if ((name === 'list' || name === 'show') && isDebugMode(this.mode)) {
    return { ok: true, private: true, reply: `调试请用 /r${name}（与道具练习 /${name} 分开）` };
  }
  return { ok: true, private: true, reply: `未知指令 /${name} · 输入 /help` };
}
```

`handlePracticeCommand` also implements `/god`, `/set`, `/record`, … (utility-only).

## Snapshot

- Include `practiceThrowCount: practiceThrowCount(this)`.
- Per player: `noclip`, `fly`, and if dummy: `practiceDummy`, `practiceHud`.

## Movement cheats

When `p.noclip` / `p.fly` are set, your existing movement step should allow fly+noclip (contributor’s tree already does; port that bit if missing).
