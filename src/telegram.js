import TdController from './core/td.js';
import ApplicationStore from './store/application.js';
import ChatStore from './store/chat.js';
import FileStore from './store/file.js';
import MessageStore from './store/message.js';
import UserStore from './store/user.js';
import MainScreen from './screen/main.js';

document.body.appendChild(new MainScreen());

TdController.init();

console.log(ApplicationStore);
console.log(ChatStore);
console.log(FileStore);
console.log(MessageStore);
console.log(UserStore);

ApplicationStore.addListener('updateAuthorizationState', update => {
  console.log(update);

  switch (update['@type']) {
    case 'updateAuthorizationState': {
      switch (update.authorization_state['@type']) {
        // case 'authorizationStateClosed':
        // case 'authorizationStateClosing':
        // case 'authorizationStateLoggingOut':
        case 'authorizationStateReady':

          break;
      }
    }
  }
});