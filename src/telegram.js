import TdController from './core/td.js';
import ApplicationStore from './store/application.js';
import ChatStore from './store/chat.js';
import FileStore from './store/file.js';
import MessageStore from './store/message.js';
import UserStore from './store/user.js';

TdController.init();

console.log(ApplicationStore);
console.log(ChatStore);
console.log(FileStore);
console.log(MessageStore);
console.log(UserStore);