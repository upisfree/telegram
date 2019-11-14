import TdController from '../core/td.js';
import ChatStore from '../store/chat.js';
import FileStore from '../store/file.js';

class ChatPlaceholder extends HTMLElement {
  constructor(chatId) {
    super();

    this.chat = ChatStore.get(chatId);
    this.chatId = chatId;
    this.titleText = this.chat.title;
    this.draftText = '';
    this.unread = false;
    this.mentionCount = 0;

    this.updateContent();
    this.updateAvatar();

    ChatStore.addListener('updateChatLastMessage', this.onUpdate.bind(this));
    ChatStore.addListener('updateChatPhoto', this.onUpdate.bind(this));
    ChatStore.addListener('updateChatTitle', this.onUpdate.bind(this));
    ChatStore.addListener('updateChatUnreadMentionCount', this.onUpdate.bind(this));
    ChatStore.addListener('updateUserChatAction', this.onUpdate.bind(this));
  }

  connectedCallback() {
    this.render();
  }

  updateContent(lastMessage) {
    if (!lastMessage) {
      lastMessage = this.chat.last_message;
    }

    switch (lastMessage.content['@type']) {
      case 'messageText':
        this.content = lastMessage.content.text.text;

        break;

      default:
        this.content = 'Вложение';
    }
  }

  updateAvatar(avatar) {
    if (!avatar) {
      avatar = this.chat.photo;
    }

    if (this.chat.photo) {
      TdController.send({
        '@type': 'readFile',
        file_id: this.chat.photo.small.id
      })
      .then(file => {
        this.querySelector('.avatar').src = FileStore.getBlobUrl(file.data);
      })
      .catch(error => {
        this.querySelector('.avatar').src = './assets/transparency.png';
      });
    }
  }

  onUpdate(update) {
    const { chat_id, order, last_message } = update;
    const chat = ChatStore.get(chat_id);

    if (chat_id !== this.chatId || !chat) {
      return;
    }

    switch (update['@type']) {
      case 'updateChatLastMessage':
        this.updateContent(last_message);

        console.log(update);

        break;

      case 'updateChatTitle':
        this.titleText = chat.title;

        break;

      case 'updateChatPhoto':
        this.updateAvatar();

        break;
    }

    this.chat = chat;

    this.render();
  }

  render() {
    this.innerHTML = `
      <style>
.avatar {
  float: left;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #ccc;
}

.title {
  font-weight: bold;
  display: block;
}
      </style>

      <div>
        <img class="avatar">
        <span class="title">${ this.titleText }</span>
        <span class="content">${ this.content }</span>        
      </div>
    `;
  }

  // onLoad={this.handleLoad}

  disconnectedCallback() {
    ChatStore.removeListener('updateChatLastMessage', this.onUpdate.bind(this));
    ChatStore.removeListener('updateChatPhoto', this.onUpdate.bind(this));
    ChatStore.removeListener('updateChatTitle', this.onUpdate.bind(this));
    ChatStore.removeListener('updateChatUnreadMentionCount', this.onUpdate.bind(this));
    ChatStore.removeListener('updateUserChatAction', this.onUpdate.bind(this));
  }
}

customElements.define('chat-placeholder', ChatPlaceholder);

export default ChatPlaceholder;