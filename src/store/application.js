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
        switch (update.authorization_state['@type']) {
          case 'authorizationStateWaitTdlibParameters':
            TdController.sendTdParameters();

            break;

          case 'authorizationStateWaitEncryptionKey':
            TdController.send({ '@type': 'checkDatabaseEncryptionKey' });

            break;
  
          case 'authorizationStateReady':
            console.log('auth done');

            break;

          default:

            break;
        }

        this.emit(update['@type'], update);

        break;
      }

      default:
        break;
    }
  }

  addTdListener() {
    TdController.addListener('update', this.onUpdate.bind(this));
  }
};



const store = new ApplicationStore();

export default store;