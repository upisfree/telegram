import EventEmitter from '../../lib/events.js';
import TdController from '../core/td.js';

class MessageStore extends EventEmitter {
  constructor() {
    super();

    this.reset();

    this.addTdListener();
  }

  reset() {
    this.items = new Map();
  }

  onUpdate(update) {
    switch (update['@type']) {
      case 'updateNewMessage':
        this.set(update.message);

        this.emit('updateNewMessage', update);

        break;

      case 'updateDeleteMessages':
        this.emit('updateDeleteMessages', update);

        break;

      case 'updateMessageEdited': {
        const chat = this.items.get(update.chat_id);

        if (chat) {
          const message = chat.get(update.message_id);

          if (message) {
            message.reply_markup = update.reply_markup;
            message.edit_date = update.edit_date;
          }
        }

        this.emit('updateMessageEdited', update);

        break;
      }

      case 'updateMessageViews': {
        const chat = this.items.get(update.chat_id);

        if (chat) {
          const message = chat.get(update.message_id);

          if (message && update.views > message.views) {
            message.views = update.views;
          }
        }

        this.emit('updateMessageViews', update);

        break;
      }

      case 'updateMessageContent': {
        const chat = this.items.get(update.chat_id);

        if (chat) {
          const message = chat.get(update.message_id);

          if (message) {
            update.old_content = message.content;
            message.content = update.new_content;
          }
        }

        this.emit('updateMessageContent', update);

        break;
      }

      case 'updateMessageContentOpened': {
        const { chat_id, message_id } = update;
        const message = this.get(chat_id, message_id);

        if (message) {
          const { content } = message;

          switch (content['@type']) {
            case 'messageVoiceNote': {
              message.content.is_listened = true;

              break;
            }

            case 'messageVideoNote': {
              message.content.is_viewed = true;

              break;
            }
          }
        }

        this.emit('updateMessageContentOpened', update);

        break;
      }
      case 'updateMessageSendSucceeded': {
        const chat = this.items.get(update.message.chat_id);

        if (chat) {
          const message = chat.get(update.old_message_id);

          if (message) {
            message.sending_state = update.message.sending_state;
          }

          if (update.old_message_id !== update.message.id) {
            this.set(update.message);
          }
        }

        this.set(update.message);
        this.emit('updateMessageSendSucceeded', update);

        break;
      }
      case 'updateMessageSendFailed': {
        if (update.message.sending_state) {
          update.message.sending_state.error_code = update.error_code;
          update.message.sending_state.error_message = update.error_message;
        }

        const chat = this.items.get(update.message.chat_id);

        if (chat) {
          const message = chat.get(update.old_message_id);

          if (message) {
            message.sending_state = update.message.sending_state;

            if (message.sending_state) {
              message.sending_state.error_code = update.error_code;
              message.sending_state.error_message = update.error_message;
            }
          }

          if (update.old_message_id !== update.message.id) {
            this.set(update.message);
          }
        }

        this.emit('updateMessageSendFailed', update);

        break;
      }
    }
  }

  addTdListener() {
    TdController.addListener('update', this.onUpdate.bind(this));
  }

  load(chatId, messageId) {
    TdController.send({
      '@type': 'getMessage',
      chat_id: chatId,
      message_id: messageId
    })
    .then(message => {
      this.set(message);
      this.emit('getMessageResult', message);
    })
    .catch(error => {
      const deletedMessage = {
        '@type': 'deletedMessage',
        chat_id: chatId,
        id: messageId,
        content: null
      };

      this.set(deletedMessage);
      this.emit('getMessageResult', deletedMessage);
    });
  }

  get(chatId, messageId) {
    let chat = this.items.get(chatId);

    if (!chat) {
      return null;
    }

    let message = chat.get(messageId);

    if (!message) {
      return null;
    }

    return message;
  }

  set(message) {
    let chat = this.items.get(message.chat_id);

    if (!chat) {
      chat = new Map();

      this.items.set(message.chat_id, chat);
    }

    chat.set(message.id, message);
  }

  setItems(messages) {
    for (let i = 0; i < messages.length; i++) {
      this.set(messages[i]);
    }
  }

  emitUpdate(update) {
    this.emit(update['@type'], update);
  }  
};

const store = new MessageStore();

window.messageStore = store;

export default store;