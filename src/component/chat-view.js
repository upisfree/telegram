import TdController from '../core/td.js';
import ApplicationStore from '../store/application.js';
import ChatStore from '../store/chat.js';
import MessageStore from '../store/message.js';
import UserStore from '../store/user.js';
import FileStore from '../store/file.js';
import ChatMessage from './chat-message.js';

const ONLINE_CLASS_NAME = 'online';
const MESSAGE_SLICE_LIMIT = 100;

class ChatView extends HTMLElement {
  constructor(chatId) {
    super();

    this.attachShadow({ mode: 'open' });

    this.chat = ChatStore.get(chatId);
    this.chatId = chatId;
    this.messages;

    ChatStore.addListener('updateChatLastMessage', this.onUpdate.bind(this));
    // ChatStore.addListener('updateChatIsPinned', this.onUpdate.bind(this));
    // ChatStore.addListener('updateChatDraftMessage', this.onUpdate.bind(this));
    // ChatStore.addListener('updateChatOrder', this.onUpdate.bind(this));

    if (this.chat.type['@type'] === 'chatTypePrivate') {
      UserStore.addListener('updateUserStatus', this.onUserUpdate.bind(this));
    }
  }

  connectedCallback() {
    TdController.send({
      '@type': 'openChat',
      chat_id: this.chat.id
    });

    TdController.send({
      '@type': 'getChatHistory',
      chat_id: this.chat.id,
      from_message_id: this.chat.last_message.id,
      offset: 0,
      limit: MESSAGE_SLICE_LIMIT
    }).then(result => {
      MessageStore.setItems(result.messages);

      this.messages = result.messages;
      this.messages.reverse();

      this.render();
    });
  }

  disconnectedCallback() {
    ChatStore.removeListener('updateChatLastMessage', this.onUpdate.bind(this));

    if (this.chat.type['@type'] === 'chatTypePrivate') {
      UserStore.removeListener('updateUserStatus', this.onUserUpdate.bind(this));
    }
  }

  onUpdate(update) {
    switch (update['@type']) {
      case 'updateChatLastMessage':
        if (update.last_message.chat_id === this.chatId) {
          this.newMessage(update.last_message);          
        }

        break;
    }
  }


  onUserUpdate(update) {
    switch (update['@type']) {
      case 'updateUserStatus':
        if (this.chat.type.user_id === update.user_id) {
          this.updateUserStatus(update.status);
        }

        break;
    }
  }


  // этот метод выполняется только в приватных беседах,
  // поэтому user_id точно есть
  updateUserStatus(status) {
    // Saved messages
    // || status === undefined — это группы, пока без
    if (UserStore.getMyId() === this.chat.type.user_id || this.chat.type['@type'] !== 'chatTypePrivate') {
      return;
    }

    if (status === undefined) {
      status = UserStore.get(this.chat.type.user_id).status;
    }

    const isOnline = (status['@type'] === 'userStatusOnline') ? true : false;

    if (this.statusElement) {
      if (isOnline) {
        this.statusElement.textContent = 'online';
        this.statusElement.classList.add(ONLINE_CLASS_NAME);
      } else {
        this.statusElement.classList.remove(ONLINE_CLASS_NAME);
        
        let statusText = 'last seen ';

        if (status['@type'] === 'userStatusRecently') {
          statusText += 'recently';
        } else {
          let seen = new Date(status.was_online * 1000);
          let now = new Date();
          let diff = new Date(now - seen);
          let minutes = diff.getMinutes();

          if (minutes > 1) {
            statusText += minutes + ' minutes ago';            
          } else {
            statusText += 'just now';
          }
        }

        this.statusElement.textContent = statusText;
      }
    }
  }

  updateAvatar() {
    const avatar = this.chat.photo;

    if (!avatar) {
      this.avatarElement.src = './assets/transparency.png';

      return;
    }

    this.readAvatar()
      .then(this.setAvatar.bind(this))
      .catch(() => {
        // if (error type)
        this.downloadAvatar().then(this.setAvatar.bind(this));
      });
  }

  createHeader() {
    this.headerElement = document.createElement('div');
    this.headerElement.className = 'header';

    this.userInfoElement = document.createElement('div');
    this.userInfoElement.className = 'user-info';

    this.avatarElement = document.createElement('img');
    this.avatarElement.className = 'avatar';
    this.avatarElement.src = './assets/transparency.png';

    this.updateAvatar();

    this.titleElement = document.createElement('span');
    this.titleElement.className = 'title';
    this.titleElement.textContent = this.chat.title;

    this.statusElement = document.createElement('span');
    this.statusElement.className = 'status';
    this.statusElement.textContent = '';

    this.updateUserStatus();

    this.shadowRoot.appendChild(this.headerElement);
    this.headerElement.appendChild(this.userInfoElement);
    this.userInfoElement.appendChild(this.avatarElement);
    this.userInfoElement.appendChild(this.titleElement);
    this.userInfoElement.appendChild(this.statusElement);
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

    this.createHeader();

    this.messages.forEach(this.newMessage.bind(this));
  }

  newMessage(message) {
    const messageElement = new ChatMessage(message);

    this.shadowRoot.appendChild(messageElement);

    this.scroll(0, this.scrollHeight);
  }

  getStyleTag() {
    const tag = document.createElement('style');

    tag.innerHTML = `
:host {
  display: block;
  position: absolute;
  bottom: 0;
  left: 441px;
  width: calc(100vw - 144px - 442px);
  height: calc(100% - 150px);
  max-width: 1260px;
  padding: 72px;
  overflow-y: auto;
  background: #e6ebee;
}

.shown-opacity {
  opacity: 1 !important;
}

.hidden-opacity {
  opacity: 0 !important;
}

.user-info {
  position: fixed;
  top: 0;
  margin-left: -72px;
  width: 100%;
  padding: 6.5px 20px;
  background: #fff;
  z-index: 10;
}

.avatar {
  float: left;
  width: 42px;
  height: 42px;
  margin-top: 2px;
  margin-bottom: 3px;
  border-radius: 50%;
  background: #ccc;
}

.title,
.status {
  display: block;
  overflow: hidden;
  white-space: nowrap;
  word-break: break-all;
  text-overflow: ellipsis;
  width: calc(100% - 720px);
  margin-top: 2.5px;
  margin-left: 57.5px;
  font-size: 15px;
}

.title {
  font-weight: 500;
  margin-top: 5px;
}

.status {
  color: #999c9f;
  font-size: 14px;
}

.status.online {
  color: #1e85ea;
}
    `;

    return tag;
  }

  setAvatar(file) {
    if (this.avatarElement) {
      this.avatarElement.src = FileStore.getBlobUrl(file.data);
    } else {
      console.trace('no this.avatarElement');
    }
  }

  downloadAvatar() {
    return TdController.send({
      '@type': 'downloadFile',
      file_id: this.chat.photo.small.id,
      priority: 1
    });
  }

  readAvatar() {
    return TdController.send({
      '@type': 'readFile',
      file_id: this.chat.photo.small.id
    });
  }
}

customElements.define('chat-view', ChatView);

export default ChatView;