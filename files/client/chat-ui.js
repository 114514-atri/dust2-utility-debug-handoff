import { CHAT_HISTORY, sanitizeChatText, formatChatLine } from '../shared/chat.js';

/**
 * CS2-style chat: Y = all, U = team, Enter send, Esc cancel.
 * History fades on the left; input bar at bottom when open.
 */
export class ChatUI {
  constructor({ send, onOpenChange = () => {}, onCommand = null } = {}) {
    this.send = send;
    this.onOpenChange = onOpenChange;
    this.onCommand = onCommand;
    this.open = false;
    this.scope = 'all';
    this.lines = [];
    this.root = document.createElement('div');
    this.root.id = 'game-chat';
    this.root.innerHTML = `
      <div class="chat-history" aria-live="polite"></div>
      <form class="chat-compose" hidden>
        <span class="chat-scope"></span>
        <input class="chat-input" type="text" maxlength="120" autocomplete="off" spellcheck="false" data-game-input="ignore" />
      </form>`;
    document.body.append(this.root);
    this.history = this.root.querySelector('.chat-history');
    this.form = this.root.querySelector('.chat-compose');
    this.input = this.root.querySelector('.chat-input');
    this.scopeEl = this.root.querySelector('.chat-scope');
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.submit();
    });
    this.input.addEventListener('keydown', (e) => {
      e.stopPropagation();
      if (e.code === 'Escape') {
        e.preventDefault();
        this.close();
      }
    });
  }

  isOpen() {
    return this.open;
  }

  openChat(scope = 'all') {
    this.scope = scope === 'team' ? 'team' : 'all';
    this.open = true;
    this.form.hidden = false;
    this.scopeEl.textContent = this.scope === 'team' ? '队友' : '全部';
    this.scopeEl.dataset.scope = this.scope;
    this.input.value = '';
    document.exitPointerLock?.();
    this.onOpenChange(true);
    queueMicrotask(() => this.input.focus());
  }

  close() {
    if (!this.open) return;
    this.open = false;
    this.form.hidden = true;
    this.input.blur();
    this.onOpenChange(false);
  }

  submit() {
    const text = sanitizeChatText(this.input.value);
    this.close();
    if (!text) return;
    if (text.startsWith('/')) {
      const handled = this.onCommand?.(text, this.scope);
      if (handled !== false) return;
    }
    this.send?.({ type: 'chat', scope: this.scope, text });
  }

  push(message) {
    this.lines.push(message);
    if (this.lines.length > CHAT_HISTORY) this.lines.splice(0, this.lines.length - CHAT_HISTORY);
    const row = document.createElement('div');
    row.className = `chat-line scope-${message.scope || 'all'} team-${message.team || 'T'}${message.dead ? ' dead' : ''}${message.system ? ' system' : ''}`;
    if (message.html) row.innerHTML = String(message.text || '');
    else {
      row.textContent = message.system
        ? String(message.text || '')
        : formatChatLine(message);
    }
    this.history.append(row);
    while (this.history.children.length > CHAT_HISTORY) this.history.firstChild.remove();
    this.history.scrollTop = this.history.scrollHeight;
    clearTimeout(row._fade);
    row._fade = setTimeout(() => row.classList.add('faded'), 12000);
  }

  system(text) {
    this.push({ system: true, text: String(text || ''), scope: 'all', time: Date.now() });
  }

  /** Trusted HTML system line (region list colors). */
  systemHtml(html, plain = '') {
    this.push({ system: true, html: true, text: String(html || ''), plain: plain || '', scope: 'all', time: Date.now() });
  }

  clear() {
    this.lines.length = 0;
    this.history.replaceChildren();
  }
}
