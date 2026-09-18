# server/index.js — merge hints

## Imports

```js
import { botCount, normalizeMode, modeConfig } from '../shared/match-rules.js';
import { handleCalloutApi, loadCalloutsFromDisk } from './callout-store.js';
```

## joinSettings

Replace hard-coded `deathmatch|defuse` with:

```js
const mode = normalizeMode(msg.mode);
const capacity = modeConfig(mode);
// validate bots against capacity.maxBots
const bots = mode === 'debug' || mode === 'utility'
  ? 0
  : botCount(msg.bots, Math.min(6, capacity.maxBots), capacity.maxBots);
```

Room list / welcome may expose `maxPlayers` from the room.

## startGameServer

```js
await loadCalloutsFromDisk();
// inside HTTP handler, before static files:
if (await handleCalloutApi(req, res, requestPath)) return;
```

## WebSocket: chat

Prefer returning private replies with optional `clientCommand`:

```js
} else if (msg.type === 'chat') {
  // rate-limit as you prefer
  const result = room.handleChat(socket.playerId, { scope: msg.scope, text: msg.text });
  if (!result.ok) { error(socket, 'CHAT_REJECTED', result.message); return; }
  if (result.private) {
    send(socket, {
      type: 'chatMessage',
      system: true,
      text: result.reply || '',
      scope: 'all',
      time: Date.now(),
      ...(result.clientCommand ? { clientCommand: result.clientCommand, args: result.args || '' } : {}),
    });
    return;
  }
  if (result.broadcast) {
    // existing team/all broadcast loop
  }
}
```

If upstream still uses `room.chat(...)`, either rename to `handleChat` or adapt the return shape (`ok`, `private`, `reply`, `clientCommand`, `args`, `broadcast`).

## WebSocket: practiceImport

```js
} else if (msg.type === 'practiceImport') {
  if (now - (socket.practiceImportAt || 0) < 800) {
    error(socket, 'IMPORT_RATE', '导入过于频繁。');
    return;
  }
  socket.practiceImportAt = now;
  const throws = Array.isArray(msg.throws) ? msg.throws.slice(0, 200) : [];
  const result = room.importPractice(socket.playerId, {
    throws,
    force: !!msg.force,
    packId: msg.packId || 'import',
  });
  send(socket, {
    type: 'chatMessage',
    system: true,
    text: result.message || (result.ok ? '导入完成' : '导入失败'),
    scope: 'all',
    time: Date.now(),
    clientCommand: 'practice_toast',
    args: JSON.stringify({
      text: result.message || (result.ok ? '导入完成' : '导入失败'),
      tone: result.ok ? 'ok' : 'warn',
    }),
  });
}
```
