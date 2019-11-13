import * as ENV from '../env.js';
import EventEmitter from '../../lib/events.js';
import { getBrowser, getOSName, orderCompare } from '../utils/misc.js';

const TdClient = tdweb.default;

const WASM_FILE_NAME = 'b4b0d61282108a31908dd6b2dbd7067b.wasm';
const WASM_FILE_HASH = 'b4b0d61282108a31908dd6b2dbd7067b';

class TdController extends EventEmitter {
  constructor() {
    super();
  }

  init() {
    this.client = new TdClient({
      logVerbosityLevel: 1,
      jsLogVerbosityLevel: 1,
      mode: 'wasm', // 'wasm-streaming'/'wasm'/'asmjs'
      prefix: 'tdlib',
      readOnly: false,
      isBackground: false,
      useDatabase: false,
      wasmUrl: `${ WASM_FILE_NAME }?_sw-precache=${ WASM_FILE_HASH }`,
      // onUpdate: onUpdate
    });

    this.client.onUpdate = update => {
      this.emit('update', update);
    };
  }

  send(request) {
    return this.client.send(request)
      .then(result => {
        console.log('receive result', result);
        
        return result;
      })
      .catch(error => {
        console.error('catch error', error);

        throw error;
      });
  }

  sendTdParameters() {
    this.send({
      '@type': 'setTdlibParameters',
      parameters: {
          '@type': 'tdParameters',
          use_test_dc: false,
          api_id: ENV.API_ID,
          api_hash: ENV.API_HASH,
          system_language_code: navigator.language || 'en',
          device_model: getBrowser(),
          system_version: getOSName(),
          application_version: '1', // тут строка
          use_secret_chats: false,
          use_message_database: true,
          use_file_database: false,
          database_directory: '/db',
          files_directory: '/'
      }
    });
  }
};



const controller = new TdController();

export default controller;