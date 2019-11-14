import EventEmitter from '../../lib/events.js';
import TdController from '../core/td.js';

// TODO: to const
const FILE_PRIORITY = 1;

class FileStore extends EventEmitter {
  constructor() {
    super();

    this.reset();

    this.addTdListener();

    this.setMaxListeners(100);
  }

  reset() {
    this.items = new Map();
    this.blobItems = new Map();
    this.urls = new Map();
    this.downloads = new Map();
    this.uploads = new Map();
  }

  onUpdate(update) {
    switch (update['@type']) {
      case 'updateFile': {
        this.set(update.file);

        this.onUpdateFile(update);

        this.emit(update['@type'], update);

        break;
      }
    }
  }

  onUpdateFile(update) {
    if (!update) {
      return;
    }

    const { file } = update;
    
    if (!file) {
      return;
    }

    this.handleDownloads(file);
    // this.handleUploads(file);
  }

  handleDownloads(file) {
    const { arr, id, idb_key, local } = file;
    delete file.arr;

    if (!this.downloads.has(id)) {
      return;
    }

    if (!local.is_downloading_completed) {
      return;
    }

    if (!useReadFile && !idb_key && !arr) {
      return;
    }

    const items = this.downloads.get(id);
    
    if (!items) {
      return;
    }

    this.downloads.delete(id);

    const store = this.getStore();

    items.forEach(item => {
      switch (item['@type']) {
        // case 'animation': {
        //   this.handleAnimation(store, item, file, arr, null);
        //   break;
        // }

        // case 'audio': {
        //   this.handleAudio(store, item, file, arr, null);
        //   break;
        // }

        // case 'chat': {
        //   this.handleChat(store, item, file, arr);
        //   break;
        // }

        // case 'document': {
        //   this.handleDocument(store, item, file, arr, null);
        //   break;
        // }

        // case 'game': {
        //   this.handleGame(store, item, file, arr, null);
        //   break;
        // }

        // case 'location': {
        //   this.handleLocation(store, item, file, arr, null);
        //   break;
        // }

        // case 'message': {
        //   this.handleMessage(store, item, file, arr);
        //   break;
        // }

        // case 'pageBlockMap': {
        //   this.handlePageBlockMap(store, item, file, arr, null);
        //   break;
        // }

        case 'photo': {
          this.handlePhoto(store, item, file, arr, null);

          break;
        }

        // case 'sticker': {
        //   this.handleSticker(store, item, file, arr, null);
        //   break;
        // }

        // case 'video': {
        //   this.handleVideo(store, item, file, arr, null);
        //   break;
        // }

        // case 'videoNote': {
        //   this.handleVideoNote(store, item, file, arr, null);
        //   break;
        // }

        // case 'voiceNote': {
        //   this.handleVoiceNote(store, item, file, arr, null);
        //   break;
        // }

        // case 'user': {
        //   this.handleUser(store, item, file, arr);
        //   break;
        // }

        default: {
          console.error('FileStore.onUpdateFile unhandled item', item);

          break;
        }
      }
    });
  }

  handlePhoto(store, photo, file, arr, obj) {
    const chatId = obj ? obj.chat_id : 0;
    const messageId = obj ? obj.id : 0;

    if (photo) {
      for (let i = 0; i < photo.sizes.length; i++) {
        const photoSize = photo.sizes[i];

        if (photoSize) {
          const source = photoSize.photo;

          if (source && source.id === file.id) {
            this.getLocalFile(
              store,
              source,
              arr,
              () => this.updatePhotoBlob(chatId, messageId, file.id),
              () => this.getRemoteFile(file.id, FILE_PRIORITY, obj || photo)
            );

            break;
          }
        }
      }
    }
  }

  updatePhotoBlob(chatId, messageId, fileId) {
    this.emit('clientUpdatePhotoBlob', {
      chatId: chatId,
      messageId: messageId,
      fileId: fileId
    });
  }

  getLocalFile(store, file, arr, callback, faultCallback) {
    file = this.get(file.id) || file;

    if (file && file.local && !file.local.is_downloading_completed) {
      faultCallback();

      return;
    }

    (async file => {
      const response = await TdController.send({
        '@type': 'readFile',
        file_id: file.id
      });

      this.setBlob(file.id, response.data);
    })(file).then(callback, faultCallback);
  }

  getRemoteFile(fileId, priority, obj) {
    const items = this.downloads.get(fileId) || [];

    if (items.some(x => x === obj)) {
      return;
    }

    items.push(obj);
    this.downloads.set(fileId, items);

    TdController.send({
      '@type': 'downloadFile',
      file_id: fileId,
      priority: priority
    });
  }

  addTdListener() {
    TdController.addListener('update', this.onUpdate.bind(this));
  }

  assign(source1, source2) {
    this.set(Object.assign({}, source1, source2));
  }

  get(fileId) {
    return this.items.get(fileId);
  }

  set(file) {
    this.items.set(file.id, file);
  }

  getBlob(fileId) {
    return this.blobItems.get(fileId);
  }

  setBlob(fileId, blob) {
    this.blobItems.set(fileId, blob);
  }

  deleteBlob(fileId) {
    this.blobItems.delete(fileId);
  }

  getBlobUrl(blob) {
    if (!blob) {
      return null;
    }

    if (this.urls.has(blob)) {
      return this.urls.get(blob);
    }

    const url = URL.createObjectURL(blob);

    this.urls.set(blob, url);

    return url;
  }

  deleteBlobUrl(blob) {
    if (this.urls.has(blob)) {
      this.urls.delete(blob);
    }
  }

  emitUpdate(update) {
    this.emit(update['@type'], update);
  }  
};

const store = new FileStore();

window.fileStore = store;

export default store;