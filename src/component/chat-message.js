import TdController from '../core/td.js';
import ApplicationStore from '../store/application.js';
import ChatStore from '../store/chat.js';
import MessageStore from '../store/message.js';

const SUPPORTED_MESSAGE_TYPES = [
  'messageText'
];

class ChatMessage extends HTMLElement {
  constructor(message) {
    super();

    this.attachShadow({ mode: 'open' });

    this.message = message;

    // ApplicationStore.addListener('updateAuthorizationState', this.onAuthUpdate.bind(this));
    // ChatStore.addListener('updateChatLastMessage', this.onUpdate.bind(this));
    // ChatStore.addListener('getMessageResult', this.onUpdate.bind(this));
    // ChatStore.addListener('updateChatIsPinned', this.onUpdate.bind(this));
    // ChatStore.addListener('updateChatDraftMessage', this.onUpdate.bind(this));
    // ChatStore.addListener('updateChatOrder', this.onUpdate.bind(this));
  }

  connectedCallback() {
    this.render();
  }

  // onAuthUpdate(update) {
  //   switch (update['@type']) {
  //     case 'updateAuthorizationState': {
  //       switch (update.authorization_state['@type']) {
  //         case 'authorizationStateReady':
  //           // this.loadChats();

  //           break;
  //       }

  //       break;
  //     }
  //   }
  // }

  // onUpdate(update) {
  //   switch (update['@type']) {
  //     case 'getMessageResult':
  //       // this.render();
  //       console.log('getMessageResult', update);

  //       break;

  //     // case 'updateChatLastMessage':
  //     // case 'updateChatIsPinned':
  //     // case 'updateChatDraftMessage':
  //     // case 'updateChatOrder':
  //     //   if (!this.chatIds.includes(update.chat_id)) {
  //     //     this.chatIds.push(update.chat_id);
  //     //   }

  //     //   const orderedChatIds = this.chatIds.sort((a, b) => {
  //     //     return orderCompare(ChatStore.get(b).order, ChatStore.get(a).order);
  //     //   });

  //     //   this.render(orderedChatIds);

  //     //   break;
  //   }
  // }

  clearNodes() {
    let i = this.shadowRoot.childNodes.length;

    while (i--) {
      this.shadowRoot.removeChild(this.shadowRoot.lastChild);
    }
  }

  render(orderedIds) {
    this.clearNodes();

    this.shadowRoot.appendChild(this.getStyleTag());

    this.contentElement = document.createElement('span');
    this.contentElement.className = 'content';
    this.contentElement.textContent = this.message.id;

    this.shadowRoot.appendChild(this.contentElement);
  }

  getStyleTag() {
    const tag = document.createElement('style');

    tag.innerHTML = `
:host {
  display: block;
}
    `;

    return tag;
  }
}

customElements.define('chat-message', ChatMessage);

export default ChatMessage;