import TdController from '../core/td.js';
import ApplicationStore from '../store/application.js';
import ChatStore from '../store/chat.js';
import ChatPlaceholder from './chat-placeholder.js';

// TODO: to const
const CHAT_SLICE_LIMIT = 25;

class ChatList extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: 'open' });

    this.chatIds = [];

    ApplicationStore.addListener('updateAuthorizationState', this.onAuthUpdate.bind(this));
    ChatStore.addListener('updateChatLastMessage', this.onUpdate.bind(this));
    ChatStore.addListener('updateChatOrder', this.onUpdate.bind(this));
  }

  connectedCallback() {
    // this.render();

    // this.loadChats();
  }

  onAuthUpdate(update) {
    switch (update['@type']) {
      case 'updateAuthorizationState': {
        switch (update.authorization_state['@type']) {
          case 'authorizationStateReady':
            this.loadChats();

            break;
        }

        break;
      }
    }
  }

  onUpdate(update) {
    const { chat_id, order, last_message } = update;
    const chat = ChatStore.get(chat_id);

    if (chat_id !== this.chatId || !chat) {
      return;
    }

    switch (update['@type']) {
      case 'updateChatLastMessage': {
        // switch case
        if (last_message.content['@type'] === 'messageText') {
          this.text = last_message.content.text.text;
        }

        console.log(update);

        break;
      }
    }

    this.chat = chat;

    this.render();
  }

  loadChats() {
    let offsetOrder = '9223372036854775807'; // 2^63 - 1
    let offsetChatId = 0;

    TdController.send({
      '@type': 'getChats',
      offset_chat_id: offsetChatId,
      offset_order: offsetOrder,
      limit: CHAT_SLICE_LIMIT
    }).then(result => {
      this.chatIds = result.chat_ids;

      this.render();
    });
  }

  clearNodes() {
    let i = this.shadowRoot.childNodes.length;

    while (i--) {
      this.shadowRoot.removeChild(this.shadowRoot.lastChild);
    }
  }

  render() {
    this.clearNodes();

    this.shadowRoot.appendChild(this.getStyleTag());

    this.chatIds.forEach(id => {
      this.shadowRoot.appendChild(new ChatPlaceholder(id));
    });
  }

  getStyleTag() {
    const tag = document.createElement('style');

    tag.innerHTML = `
:host {
  display: block;
  width: 420px;
  background: #fff;
  padding: 10px 10px;
}
    `;

    return tag;
  }
}

customElements.define('chat-list', ChatList);

export default ChatList;