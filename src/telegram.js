import TdController from './core/td.js';
import ApplicationStore from './store/application.js';
import ChatStore from './store/chat.js';
import FileStore from './store/file.js';
import MessageStore from './store/message.js';
import UserStore from './store/user.js';
import MainScreen from './screen/main.js';
import LoginScreen from './screen/login.js';

let mainScreen = new MainScreen();
let loginScreen = new LoginScreen();

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
        case 'authorizationStateReady':
          if (document.body.contains(loginScreen)) {
            document.body.removeChild(loginScreen);
          }

          document.body.appendChild(mainScreen);

          break;

        case 'authorizationStateClosed':
        case 'authorizationStateClosing':
        case 'authorizationStateLoggingOut':
        case 'authorizationStateWaitPhoneNumber':
        case 'authorizationStateWaitCode':
        case 'authorizationStateWaitPassword':
        case 'authorizationStateWaitRegistration':
          if (document.body.contains(mainScreen)) {
            document.body.removeChild(mainScreen);
          }

          document.body.appendChild(loginScreen);

          break;
      }
    }
  }
});