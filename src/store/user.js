import EventEmitter from '../../lib/events.js';
import TdController from '../core/td.js';
import OptionStore from './option.js';

class UserStore extends EventEmitter {
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
      case 'updateUser': {
        this.set(update.user);

        this.emit(update['@type'], update);
        
        break;
      }

      // case 'updateUserFullInfo':
      //   this.setFullInfo(update.user_id, update.user_full_info);

      //   this.emit(update['@type'], update);

      //   break;

      case 'updateUserStatus': {
        let user = this.get(update.user_id);

        if (user) {
          this.assign(user, { status: update.status });
        }

        this.emit(update['@type'], update);

        break;
      }
    }
  }

  getMyId() {
    const myId = OptionStore.get('my_id');
    
    if (!myId) {
      return null;
    }

    if (!myId.value) {
      return null;
    }

    return myId.value;
  }

  addTdListener() {
    TdController.addListener('update', this.onUpdate.bind(this));
  }

  assign(source1, source2) {
    this.set(Object.assign({}, source1, source2));
  }

  get(userId) {
    return this.items.get(userId);
  }

  set(user) {
    this.items.set(user.id, user);
  }

  emitUpdate(update) {
    this.emit(update['@type'], update);
  }
};

const store = new UserStore();

export default store;