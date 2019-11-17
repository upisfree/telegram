import TdController from '../core/td.js';
import ApplicationStore from '../store/application.js';
import ChatStore from '../store/chat.js';
import MessageStore from '../store/message.js';
import UserStore from '../store/user.js';

const SUPPORTED_MESSAGE_TYPES = [
  'messageText'
];

const UNSUPPORTED_CLASS_NAME = 'unsupported';

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

  updateContent() {
    const content = this.message.content;

    switch (content['@type']) {
      case 'messageText':
        this.contentElement.textContent = content.text.text;

        break;

      default:
        this.contentElement.classList.add(UNSUPPORTED_CLASS_NAME);
        this.contentElement.textContent = 'This type of attachment does not supported by this version of Telegram. Please view it on your mobile device.';
    }
  }

  clearNodes() {
    let i = this.shadowRoot.childNodes.length;

    while (i--) {
      this.shadowRoot.removeChild(this.shadowRoot.lastChild);
    }
  }

  render(orderedIds) {
    this.clearNodes();

    this.shadowRoot.appendChild(this.getStyleTag());

    this.containerElement = document.createElement('div');
    this.containerElement.className = 'container';

    this.bubbleElement = document.createElement('img');
    this.bubbleElement.src = './assets/my-message-bubble.svg';

    this.contentElement = document.createElement('span');
    this.contentElement.className = 'content';

    this.updateContent();

    if (UserStore.getMyId() === this.message.sender_user_id) {
      this.classList.add('right');
      this.containerElement.classList.add('self');
    }

    this.shadowRoot.appendChild(this.containerElement);
    // this.containerElement.appendChild(this.bubbleElement);
    this.containerElement.appendChild(this.contentElement);
  }

  getStyleTag() {
    const tag = document.createElement('style');

    tag.innerHTML = `
:host {
  display: block;
  margin-bottom: 12px;
  display: flex;
}

:host(.right) {
  justify-content: flex-end;
}

.container {
  position: relative;
  width: fit-content;
  max-width: 70%;
  padding: 6px 10px;
  font-size: 15px;
  word-break: break-all;
  background: #fff;
  box-shadow: 0 1px 2px 0 rgba(16,35,47,0.15);

  border-radius: 5px;
}

.self {
  background: #EEFFDE;
}

.unsupported {
  font-style: italic;
  font-size: 14px;
}
    `;

    return tag;
  }
}

customElements.define('chat-message', ChatMessage);

export default ChatMessage;