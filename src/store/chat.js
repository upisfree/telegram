import EventEmitter from '../../lib/events.js';
import TdController from '../core/td.js';

class ChatStore extends EventEmitter {
  constructor() {
    super();

    this.reset();

    this.addTdListener();

    this.setMaxListeners(100);
  }

  reset() {
    this.items = new Map();
  }

  onUpdate(update) {
    switch (update['@type']) {
      // case 'updateChatOnlineMemberCount': {
      //     this.setOnlineMemberCount(update.chat_id, update.online_member_count);

      //     this.emitUpdate(update);
      //     break;
      // }

      case 'updateChatDraftMessage': {
        const { chat_id, order, draft_message } = update;
        const chat = this.get(chat_id);

        if (chat) {
          this.assign(chat, {
            order: order === '0' ? chat.order : order,
            draft_message
          });
        }

        this.emitUpdate(update);

        break;
      }

      case 'updateChatIsMarkedAsUnread': {
        const { chat_id, is_marked_as_unread } = update;
        const chat = this.get(chat_id);

        if (chat) {
          this.assign(chat, { is_marked_as_unread });
        }

        this.emitUpdate(update);

        break;
      }

      case 'updateChatIsPinned': {
        const { chat_id, order, is_pinned } = update;
        const chat = this.get(chat_id);

        if (chat) {
          this.assign(chat, {
            order: order === '0' ? chat.order : order,
            is_pinned
          });
        }

        this.emitUpdate(update);

        break;
      }

      case 'updateChatIsSponsored': {
        const { chat_id, order, is_sponsored } = update;
        const chat = this.get(chat_id);

        if (chat) {
          this.assign(chat, {
            order: order === '0' ? chat.order : order,
            is_sponsored
          });
        }

        this.emitUpdate(update);

        break;
      }
      case 'updateChatLastMessage': {
        const { chat_id, order, last_message } = update;
        const chat = this.get(chat_id);
        
        if (chat) {
          this.assign(chat, {
            order: order === '0' ? chat.order : order,
            last_message
          });
        }

        this.emitUpdate(update);

        break;
      }

      case 'updateChatNotificationSettings': {
        const { chat_id, notification_settings } = update;
        const chat = this.get(chat_id);

        if (chat) {
          this.assign(chat, { notification_settings });
        }

        this.emitUpdate(update);

        break;
      }

      case 'updateChatOrder': {
        const { chat_id, order } = update;
        const chat = this.get(chat_id);
      
        if (chat) {
          this.assign(chat, { order });
        }

        this.emitUpdate(update);
        
        break;
      }

      case 'updateChatPhoto': {
        const { chat_id, photo } = update;
        const chat = this.get(chat_id);

        if (chat) {
          this.assign(chat, { photo });

          // TODO: WHEN USER STORE
          // 
          // 
          // switch (chat.type['@type']) {
          //   // case 'chatTypeBasicGroup': {
          //   //   break;
          //   // }

          //   // case 'chatTypeSupergroup': {
          //   //     break;
          //   // }

          //   case 'chatTypePrivate':
          //   case 'chatTypeSecret': {
          //     const user = UserStore.get(chat.type.user_id);
              
          //     if (user) {
          //       UserStore.assign(user, { profile_photo: update.photo });
          //     }

          //     break;
          //   }
          // }
        }

        this.emitUpdate(update);

        break;
      }

      case 'updateChatPinnedMessage': {
          const { chat_id, pinned_message_id } = update;
          const chat = this.get(chat_id);

          if (chat) {
            this.assign(chat, { pinned_message_id });
          }

          this.emitUpdate(update);

          break;
      }

      case 'updateChatReadInbox': {
        const { chat_id, last_read_inbox_message_id, unread_count } = update;
        const chat = this.get(chat_id);

        if (chat) {
          this.assign(chat, { last_read_inbox_message_id, unread_count });
        }

        this.emitUpdate(update);

        break;
      }

      case 'updateChatReadOutbox': {
        const { chat_id, last_read_outbox_message_id } = update;
        const chat = this.get(chat_id);

        if (chat) {
          this.assign(chat, { last_read_outbox_message_id });
        }

        this.emitUpdate(update);

        break;
      }

      case 'updateChatReplyMarkup': {
        const { chat_id, reply_markup_message_id } = update;
        const chat = this.get(chat_id);

        if (chat) {
          this.assign(chat, { reply_markup_message_id });
        }

        this.emitUpdate(update);
 
        break;
      }
 
      case 'updateChatTitle': {
        const { chat_id, title } = update;
        const chat = this.get(chat_id);
  
        if (chat) {
          this.assign(chat, { title });
        }

        this.emitUpdate(update);

        break;
      }

      case 'updateChatUnreadMentionCount': {
        const { chat_id, unread_mention_count } = update;
        const chat = this.get(chat_id);

        if (chat) {
          this.assign(chat, { unread_mention_count });
        }

        this.emitUpdate(update);

        break;
      }

      case 'updateNewChat': {
        this.set(update.chat);

        this.emitUpdate(update);

        break;
      }

      // case 'updateSecretChat': {
      //   this.emitUpdate(update);
      //   break;
      // }

      // case 'updateUnreadChatCount': {
      //   this.emitUpdate(update);

      //   break;
      // }

      // case 'updateUserChatAction': {
      //   let typingManager = this.getTypingManager(update.chat_id);

      //   if (!typingManager) {
      //     typingManager = new InputTypingManager(update.chat_id, update => this.emitUpdate(update));

      //     this.setTypingManager(update.chat_id, typingManager);
      //   }

      //   const key = update.user_id;

      //   if (update.action['@type'] === 'chatActionCancel') {
      //     typingManager.clearAction(key);
      //   } else {
      //     typingManager.addAction(key, update.action);
      //   }

      //   this.emitUpdate(update);

      //   break;
      // }

      case 'updateMessageMentionRead': {
        const { chat_id, unread_mention_count } = update;
        const chat = this.get(chat_id);

        if (chat) {
          this.assign(chat, { unread_mention_count });
        }

        this.emitUpdate(update);

        break;
      }

      case 'updateChatOnlineMemberCount': {
        const { chat_id, online_member_count } = update;
        const chat = this.get(chat_id);

        if (chat) {
          this.assign(chat, { online_member_count });
        }

        this.emitFastUpdate(update);

        break;
      }
    }
  }

  addTdListener() {
    TdController.addListener('update', this.onUpdate.bind(this));
  }

  assign(source1, source2) {
    this.set(Object.assign({}, source1, source2));
  }

  get(chatId) {
    return this.items.get(chatId);
  }

  set(chat) {
    this.items.set(chat.id, chat);
  }

  emitUpdate(update) {
    this.emit(update['@type'], update);
  }  
};

const store = new ChatStore();

export default store;