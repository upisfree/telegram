import EventEmitter from '../../lib/events.js';
import TdController from '../core/td.js';

class ApplicationStore extends EventEmitter {
  constructor() {
    super();

    this.addTdListener();
  }

  onUpdate(update) {
    switch (update['@type']) {
      case 'updateAuthorizationState': {
        this.authorizationState = update.authorization_state;

        switch (update.authorization_state['@type']) {
          // case 'authorizationStateLoggingOut':
          //   this.loggingOut = true;

          //   break;

          case 'authorizationStateWaitTdlibParameters':
            TdController.sendTdParameters();

            break;

          case 'authorizationStateWaitEncryptionKey':
            TdController.send({ '@type': 'checkDatabaseEncryptionKey' });

            break;
  
          case 'authorizationStateWaitPhoneNumber': {
            // TdController.send({
            //   '@type': 'setAuthenticationPhoneNumber',
            //   phone_number: prompt('phone number?')
            // });

            break;
          }

          case 'authorizationStateWaitCode':
            // TdController.send({
            //   '@type': 'checkAuthenticationCode',
            //   code: prompt('code?')
            // });

            break;

          case 'authorizationStateWaitPassword':
            // TdController.send({
            //   '@type': 'checkAuthenticationPassword',
            //   password: prompt(`cloud password, hint: ${ this.authorizationState.password_hint }`)
            // });

            break;

          case 'authorizationStateReady':
            // this.loggingOut = false;
            // this.setPhoneNumberRequest = null;
            // subscribeNotifications();

            console.log('auth done');

            break;

          // case 'authorizationStateClosing':
          //   break;
  
          // case 'authorizationStateClosed':
          //   this.reset();

          //   if (!this.loggingOut) {
          //     document.title += ': Zzz…';

          //     TdLibController.clientUpdate({
          //         '@type': 'clientUpdateAppInactive'
          //     });
          //   } else {
          //     TdLibController.init();
          //   }

          //   break;

          default:

            break;
        }

        this.emit(update['@type'], update);

        break;
      }

      // case 'updateChatIsMarkedAsUnread': {
      //   const { chat_id, is_marked_as_unread } = update;

      //   if (chat_id === this.chatId && is_marked_as_unread) {
      //     closeChat();
      //   }

      //   break;
      // }

      // case 'updateConnectionState': {
      //   this.connectionState = update.state;

      //   this.emit(update['@type'], update);
      //   break;
      // }

      // case 'updateFatalError': {
      //   this.emit(update['@type'], update);

      //   break;
      // }

      // case 'updateServiceNotification': {
      //   const { type, content } = update;

      //   if (!content) return;
      //   if (content['@type'] === 'messageText') {
      //     const { text } = content;
      //     if (!text) return;

      //     if (text['@type'] === 'formattedText' && text.text) {
      //       switch (type) {
      //         case 'AUTH_KEY_DROP_DUPLICATE':
      //           let result = window.confirm(text.text);
      //           if (result) {
      //               TdLibController.logOut();
      //           }
      //           break;
      //         default:
      //           alert(text.text);
      //           break;
      //       }
      //     }
      //   }

      //   break;
      // }
      
      default:
        break;
    }
  }

  addTdListener() {
    TdController.addListener('update', this.onUpdate.bind(this));
  }
};



const store = new ApplicationStore();

window.appStore = store;

export default store;