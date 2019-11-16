import TdController from '../core/td.js';
import ChatStore from '../store/chat.js';
import FileStore from '../store/file.js';
import ChatList from '../component/chat-list.js';

class MainScreen extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: 'open' });

    // ChatStore.addListener('updateChatLastMessage', this.onUpdate.bind(this));
    // ChatStore.addListener('updateChatPhoto', this.onUpdate.bind(this));
    // ChatStore.addListener('updateChatTitle', this.onUpdate.bind(this));
    // ChatStore.addListener('updateChatUnreadMentionCount', this.onUpdate.bind(this));
    // ChatStore.addListener('updateUserChatAction', this.onUpdate.bind(this));
  }

  connectedCallback() {
    this.render();
  }

  // onUpdate(update) {
  //   const { chat_id, order, last_message } = update;
  //   const chat = ChatStore.get(chat_id);

  //   if (chat_id !== this.chatId || !chat) {
  //     return;
  //   }

  //   switch (update['@type']) {
  //     case 'updateChatLastMessage':
  //       this.updateContent(last_message);

  //       console.log(update);

  //       break;

  //     case 'updateChatTitle':
  //       this.updateTitle();

  //       break;

  //     case 'updateChatPhoto':
  //       this.updateAvatar();

  //       break;
  //   }

  //   this.chat = chat;
  // }

  render() {
    this.chatListElement = new ChatList();

    this.shadowRoot.appendChild(this.getStyleTag());
    this.shadowRoot.appendChild(this.chatListElement);
  }

  getStyleTag() {
    const tag = document.createElement('style');

    tag.innerHTML = `
:host {
  display: block;
  max-width: 1680px;
  height: 100vh;
  background: yellow;
}
    `;

    return tag;
  }

  // onLoad={this.handleLoad}

  disconnectedCallback() {
    // ChatStore.removeListener('updateChatLastMessage', this.onUpdate.bind(this));
    // ChatStore.removeListener('updateChatPhoto', this.onUpdate.bind(this));
    // ChatStore.removeListener('updateChatTitle', this.onUpdate.bind(this));
    // ChatStore.removeListener('updateChatUnreadMentionCount', this.onUpdate.bind(this));
    // ChatStore.removeListener('updateUserChatAction', this.onUpdate.bind(this));
  }
}

customElements.define('main-screen', MainScreen);

export default MainScreen;