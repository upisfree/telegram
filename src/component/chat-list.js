import TdController from '../core/td.js';
import ChatStore from '../store/chat.js';
import ChatPlaceholder from './chat-placeholder.js';

// TODO: to const
const CHAT_SLICE_LIMIT = 25;

class ChatList extends HTMLElement {
  constructor() {
    super();

    this.chatIds = [];

    // ChatStore.addListener('updateChatLastMessage', this.onUpdate.bind(this));
    // ChatStore.addListener('updateChatOrder', this.onUpdate.bind(this));
  }

  connectedCallback() {
    // this.render();

    this.loadChats();
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
    let i = this.childNodes.length;

    while (i--) {
      this.removeChild(this.lastChild);
    }
  }

  render() {
    this.clearNodes();

    this.chatIds.forEach(id => {
      this.appendChild(new ChatPlaceholder(id));
    });
  }
}

customElements.define('chat-list', ChatList);

export default ChatList;