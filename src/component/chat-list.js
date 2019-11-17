import TdController from '../core/td.js';
import ApplicationStore from '../store/application.js';
import ChatStore from '../store/chat.js';
import ChatPlaceholder from './chat-placeholder.js';
import ChatView from './chat-view.js';
import { orderCompare } from '../utils/misc.js';

// TODO: to const
const CHAT_SLICE_LIMIT = 25;

const ACTIVE_CLASS_NAME = 'active';

class ChatList extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: 'open' });

    this.chatIds = [];
    this.currentChatId;
    this.chatPlaceholders = new Map();
    this.chatView;

    this.loadingChats = false;

    ChatStore.addListener('updateChatLastMessage', this.onUpdate.bind(this));
    ChatStore.addListener('updateChatIsPinned', this.onUpdate.bind(this));
    ChatStore.addListener('updateChatDraftMessage', this.onUpdate.bind(this));
    ChatStore.addListener('updateChatOrder', this.onUpdate.bind(this));
    ChatStore.addListener('updateNewChat', this.onUpdate.bind(this));
  }

  connectedCallback() {
    this.loadChats();
  }

  disconnectedCallback() {
    ChatStore.removeListener('updateChatLastMessage', this.onUpdate.bind(this));
    ChatStore.removeListener('updateChatIsPinned', this.onUpdate.bind(this));
    ChatStore.removeListener('updateChatDraftMessage', this.onUpdate.bind(this));
    ChatStore.removeListener('updateChatOrder', this.onUpdate.bind(this));
    ChatStore.removeListener('updateNewChat', this.onUpdate.bind(this));
  }

  onUpdate(update) {
    switch (update['@type']) {
      case 'updateChatLastMessage':
      case 'updateChatIsPinned':
      case 'updateChatDraftMessage':
      case 'updateChatOrder':
        if (!this.chatIds.includes(update.chat_id)) {
          this.chatIds.push(update.chat_id);
        }

        const orderedChatIds = this.chatIds.sort((a, b) => {
          return orderCompare(ChatStore.get(b).order, ChatStore.get(a).order);
        });

        this.render(orderedChatIds);

        break;
    }
  }

  loadChats() {
    let offsetOrder = '9223372036854775807'; // 2^63 - 1
    let offsetChatId = 0;

    this.loadingChats = true;

    TdController.send({
      '@type': 'getChats',
      offset_chat_id: offsetChatId,
      offset_order: offsetOrder,
      limit: CHAT_SLICE_LIMIT
    }).then(result => {
      this.loadingChats = false;

      this.chatIds = result.chat_ids;

      this.render(this.chatIds);
    });
  }

  clearNodes() {
    let i = this.shadowRoot.childNodes.length;

    while (i--) {
      this.shadowRoot.removeChild(this.shadowRoot.lastChild);
    }
  }

  render(orderedIds) {
    if (this.loadingChats) {
      console.error('загрузка чатов ещё не всё');

      return;
    }

    this.clearNodes();

    this.shadowRoot.appendChild(this.getStyleTag());

    orderedIds.forEach(id => {
      let placeholder = this.chatPlaceholders.get(id);
      if (!placeholder) {
        placeholder = new ChatPlaceholder(id);
        placeholder.addEventListener('click', this.onPlaceholderClick.bind(this, placeholder));

        this.chatPlaceholders.set(id, placeholder);
      }

      this.shadowRoot.appendChild(placeholder);
    });
  }

  getStyleTag() {
    const tag = document.createElement('style');

    tag.innerHTML = `
:host {
  display: block;
  width: 420px;
  height: 100%;
  overflow-y: auto;
  padding: 10px 10px;
  background: #fff;
  border-right: 1px solid #dedfe3;
}
    `;

    return tag;
  }

  onPlaceholderClick(placeholder) {
    if (this.chatView) {
      this.parentNode.removeChild(this.chatView);

      let placeholders = this.shadowRoot.querySelectorAll('chat-placeholder');

      for (let i = 0; i < placeholders.length; i++) {
        placeholders[i].classList.remove(ACTIVE_CLASS_NAME);
      }
    }

    this.currentChatId = placeholder.chatId;
    placeholder.classList.add(ACTIVE_CLASS_NAME);

    this.chatView = new ChatView(this.currentChatId);

    this.parentNode.appendChild(this.chatView);
  }
}

customElements.define('chat-list', ChatList);

export default ChatList;