import TdController from '../core/td.js';
import ChatStore from '../store/chat.js';
import FileStore from '../store/file.js';
import UserStore from '../store/user.js';

const SHOWN_OPACITY_CLASS_NAME = 'shown-opacity';
const MUTED_CLASS_NAME = 'muted';

class ChatPlaceholder extends HTMLElement {
  constructor(chatId) {
    super();

    this.attachShadow({ mode: 'open' });

    this.chat = ChatStore.get(chatId);
    this.chatId = chatId;
    this.isFirstTimeCreated = true;

    this.titleText = this.chat.title;
    this.contentText = 'text';
    this.timeText = '00:00';
    this.draftText = '';
    this.unread = false;
    this.mentionCount = 0;

    ChatStore.addListener('updateChatLastMessage', this.onUpdate.bind(this));
    ChatStore.addListener('updateChatPhoto', this.onUpdate.bind(this));
    ChatStore.addListener('updateChatTitle', this.onUpdate.bind(this));
    ChatStore.addListener('updateChatReadInbox', this.onUpdate.bind(this));
    ChatStore.addListener('updateUserChatAction', this.onUpdate.bind(this));
    ChatStore.addListener('updateChatNotificationSettings', this.onUpdate.bind(this));

    if (this.chat.type['@type'] === 'chatTypePrivate') {
      UserStore.addListener('updateUserStatus', this.onUserUpdate.bind(this));
    }
  }

  connectedCallback() {
    if (this.isFirstTimeCreated) {
      this.render();      
      this.updateAvatar();
      this.updateTitle();
    }

    this.isFirstTimeCreated = false;

    this.updateContent();
    this.updateTime();
    this.updateUnread();
    this.updateMute();
  }

  disconnectedCallback() {
    ChatStore.removeListener('updateChatLastMessage', this.onUpdate.bind(this));
    ChatStore.removeListener('updateChatPhoto', this.onUpdate.bind(this));
    ChatStore.removeListener('updateChatTitle', this.onUpdate.bind(this));
    ChatStore.removeListener('updateChatReadInbox', this.onUpdate.bind(this));
    ChatStore.removeListener('updateUserChatAction', this.onUpdate.bind(this));
    ChatStore.removeListener('updateChatNotificationSettings', this.onUpdate.bind(this));
  }

  updateContent(lastMessage) {
    if (lastMessage === undefined) {
      lastMessage = this.chat.last_message;
    }

    switch (lastMessage.content['@type']) {
      case 'messageText':
        this.contentText = lastMessage.content.text.text;

        break;

      default:
        this.contentText = 'Attachment';
    }

    if (this.contentElement) {
      this.contentElement.textContent = this.contentText;      
    }
  }

  updateTime(time) {
    if (time === undefined) {
      time = this.chat.last_message.date;
    }

    const date = new Date(time * 1000); // Date хочет миллисекунды, а телега отдаёт секунды

    this.timeText = date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });

    if (this.timeElement) {
      this.timeElement.textContent = this.timeText;
    }
  }

  updateAvatar(avatar) {
    // если аватар не обновляем, берём из кеша его
    if (!avatar) {
      avatar = this.chat.photo;
    }

    // если и там нет, то ставим заглушку
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

  updateTitle(title) {
    if (title === undefined) {
      title = this.chat.title;
    }

    this.titleText = title;

    if (this.titleElement) {
      this.titleElement.textContent = this.titleText;
    }
  }

  // этот метод выполняется только в приватных беседах,
  // поэтому user_id точно есть
  updateUserStatus(status) {
    // Saved messages
    if (UserStore.getMyId() === this.chat.type.user_id) {
      return;
    }

    if (status === undefined) {
      status = UserStore.get(this.chat.type.user_id).status['@type'];
    }

    const isOnline = (status === 'userStatusOnline') ? true : false;

    if (this.onlineElement) {
      if (isOnline) {
        this.onlineElement.classList.add(SHOWN_OPACITY_CLASS_NAME);
      } else {
        this.onlineElement.classList.remove(SHOWN_OPACITY_CLASS_NAME);
      }
    }
  }

  updateUnread(count) {
    if (count === undefined) {
      count = this.chat.unread_count;
    }

    this.unreadText = count;

    if (this.unreadElement) {
      if (count) {
        this.unreadElement.classList.add(SHOWN_OPACITY_CLASS_NAME);
      } else {
        this.unreadElement.classList.remove(SHOWN_OPACITY_CLASS_NAME);
      }

      this.unreadElement.textContent = this.unreadText;
    }
  }

  updateMute(notificationSetting) {
    if (notificationSetting === undefined) {
      notificationSetting = this.chat.notification_settings;
    }

    let muteFor;

    if (!notificationSetting) {
      muteFor = 0;
    } else {
      muteFor = notificationSetting.mute_for;
    }

    if (muteFor > 0) {
      this.unreadElement.classList.add(MUTED_CLASS_NAME);
    } else {
      this.unreadElement.classList.remove(MUTED_CLASS_NAME);
    }
  }

  onUpdate(update) {
    const { chat_id, order, last_message, unread_count } = update;
    const chat = ChatStore.get(chat_id);

    if (chat_id !== this.chatId || !chat) {
      return;
    }

    switch (update['@type']) {
      case 'updateChatReadInbox':
        this.updateUnread(unread_count);

        break;

      case 'updateChatLastMessage':
        this.updateContent(last_message);
        this.updateTime(last_message.date);

        // console.log(update);

        break;

      case 'updateChatTitle':
        this.updateTitle();

        break;

      case 'updateChatPhoto':
        this.updateAvatar();

        break;

      case 'updateChatNotificationSettings':
        this.updateMute();

        break;
    }

    this.chat = chat;
  }

  onUserUpdate(update) {
    switch (update['@type']) {
      case 'updateUserStatus':
        if (this.chat.type.user_id === update.user_id) {
          this.updateUserStatus(update.status['@type']);
        }

        break;
    }
  }

  clearNodes() {
    let i = this.shadowRoot.childNodes.length;

    while (i--) {
      this.shadowRoot.removeChild(this.shadowRoot.lastChild);
    }
  }

  render() {
    this.clearNodes();

    this.avatarElement = document.createElement('img');
    this.avatarElement.className = 'avatar';

    this.onlineElement = document.createElement('div');
    this.onlineElement.className = 'online';

    this.timeElement = document.createElement('time');
    this.timeElement.textContent = this.timeText;

    this.titleElement = document.createElement('span');
    this.titleElement.className = 'title';
    this.titleElement.textContent = this.titleText;

    this.contentElement = document.createElement('span');
    this.contentElement.className = 'content';
    this.contentElement.textContent = this.contentText;

    this.unreadElement = document.createElement('span');
    this.unreadElement.className = 'unread';
    this.unreadElement.textContent = this.unreadText;



    this.shadowRoot.appendChild(this.getStyleTag());
    this.shadowRoot.appendChild(this.avatarElement);
    this.shadowRoot.appendChild(this.onlineElement);
    this.shadowRoot.appendChild(this.timeElement);
    this.shadowRoot.appendChild(this.titleElement);
    this.shadowRoot.appendChild(this.contentElement);
    this.shadowRoot.appendChild(this.unreadElement);
  }

  getStyleTag() {
    const tag = document.createElement('style');

    tag.innerHTML = `
:host {
  display: block;
  position: relative;
  width: calc(100% - 18px);
  height: 64px;
  margin: 6px 0;
  padding: 10px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 50ms ease;
}

:host(:hover),
:host(.active) {
  background: #f4f4f5;
}

.shown-opacity {
  opacity: 1 !important;
}

.hidden-opacity {
  opacity: 0 !important;
}

.avatar {
  float: left;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #ccc;
}

.online {
  position: absolute;
  left: 54px;
  bottom: 15px;
  width: 10px;
  height: 10px;
  background: #0ac630;
  border: 2px solid #fff;
  border-radius: 50%;
}

time {
  position: absolute;
  top: 17px;
  right: 16px;
  color: #63696d;
  font-size: 14px;
}

.unread {
  position: absolute;
  bottom: 16px;
  right: 16px;
  background: #4dcd5e;
  border: 1px solid #30c544;
  color: #fff;
  font-weight: 500;
  text-align: center;
  font-size: 12px;
  padding: 4px 7.5px;
  border-radius: 16px;
}

.unread.muted {
  background: #c4c9cc;
  border-color: #bac0c3;
}

.title,
.content {
  display: block;
  overflow: hidden;
  white-space: nowrap;
  word-break: break-all;
  text-overflow: ellipsis;
  width: calc(100% - 70px - 50px);
  margin-top: 6.5px;
  margin-left: 70px;
  font-size: 16px;
}

.title {
  font-weight: 500;
}

.content {
  color: #63696d;
}

.online,
.unread {
  opacity: 0;
  transition: opacity 100ms cubic-bezier(0.55, 0.06, 0.68, 0.19);
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

customElements.define('chat-placeholder', ChatPlaceholder);

export default ChatPlaceholder;