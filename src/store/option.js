import EventEmitter from '../../lib/events.js';
import TdController from '../core/td.js';

class OptionStore extends EventEmitter {
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
      case 'updateOption':
        const { name, value } = update;

        this.set(name, value);

        this.emit('updateOption', update);

        break;
    }
  }

  addTdListener() {
    TdController.addListener('update', this.onUpdate.bind(this));
  }

  get(name) {
    return this.items.get(name);
  }

  set(name, value) {
    this.items.set(name, value);
  }
};



const store = new OptionStore();

export default store;