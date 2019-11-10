import * as ENV from './env.js';
import { getBrowser, getOSName, orderCompare } from './utils/misc.js';

// import TdClient from 'tdweb';
const TdClient = tdweb.default;

// const
const WASM_FILE_NAME = 'b4b0d61282108a31908dd6b2dbd7067b.wasm';
const WASM_FILE_HASH = 'b4b0d61282108a31908dd6b2dbd7067b';
const CHAT_SLICE_LIMIT = 25;

let chats = { }; // мб new Map()
let users = { }; // мб new Map()
let files = { }; // мб new Map()

let currentChatId = -1;

const td = new TdClient({
  logVerbosityLevel: 1,
  jsLogVerbosityLevel: 1,
  mode: 'wasm', // 'wasm-streaming'/'wasm'/'asmjs'
  prefix: 'tdlib',
  readOnly: false,
  isBackground: false,
  useDatabase: false,
  wasmUrl: `${ WASM_FILE_NAME }?_sw-precache=${ WASM_FILE_HASH }`,
  onUpdate: onUpdate
});



document.querySelector('button').addEventListener('click', onSendButtonClick);



function send(request) {
  return td.send(request)
    .then(result => {
      console.log('receive result', result);
      
      return result;
    })
    .catch(error => {
      console.error('catch error', error);

      throw error;
    });
}

function sendTdParameters() {
  send({
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

function onUpdate(update) {
  switch (update['@type']) {
    case 'updateAuthorizationState': {
      // this.authorizationState = update.authorization_state;

      switch (update.authorization_state['@type']) {
        // case 'authorizationStateLoggingOut':
        //   this.loggingOut = true;

        //   break;

        case 'authorizationStateWaitTdlibParameters':
          sendTdParameters();

          break;

        case 'authorizationStateWaitEncryptionKey':
          send({ '@type': 'checkDatabaseEncryptionKey' });

          break;

        case 'authorizationStateWaitPhoneNumber': {
          send({
            '@type': 'setAuthenticationPhoneNumber',
            phone_number: prompt('phone number?')
          })

          break;
        }

        case 'authorizationStateWaitCode': {
          send({
            '@type': 'checkAuthenticationCode',
            code: prompt('sms code')
          });

        // тут любой код подойдёт, только для подписи оно надо
          // switch (update.authorization_state.code_info['@type']) {
          //   case 'authenticationCodeTypeSms':
          //     td.send({
          //       '@type': 'checkAuthenticationCode',
          //       code: prompt('type the code from the call, sms or previous telegram app')
          //     });

          //     break;
          // }

          break;
        }

        case 'authorizationStateWaitPassword':
          send({
            '@type': 'checkAuthenticationPassword',
            password: prompt(`cloud password, hint: ${ update.authorization_state.password_hint }`)
          });

          break;

        case 'authorizationStateReady':
          // this.loggingOut = false;
          // this.setPhoneNumberRequest = null;

          // subscribeNotifications();

          console.log('auth done');

          loadChatList();

          break;

        // case 'authorizationStateClosing':
        //   break;

        // case 'authorizationStateClosed':
        //   this.reset();

        //   if (!this.loggingOut) {
        //     document.title += ': Zzz…';

        //     TdLibController.clientUpdate({
        //       '@type': 'clientUpdateAppInactive'
        //     });
        //   } else {
        //     TdLibController.init();
        //   }
        //   break;

        default:

          break;
      }

      // this.emit(update['@type'], update);

      break;
    }

    case 'updateNewChat': {
      let chat = update.chat;

      chats[chat.id] = chat;

      if (chat.photo) {
        let id = chat.photo.small.id;

        getFile(id);
      }

      showChatsList();

      break;
    }

    case 'updateChatLastMessage': {
      let chat = update.chat;

      chats[update.chat_id].last_message = update.last_message;
      chats[update.chat_id].order = update.order;

      showChatsList();

      break;
    }

    case 'updateFile': {
      let file = update.file;

      files[file.id] = file;

      // console.log('updateFile', file);

      break;
    }

    // смотрим на чаты
  }

  // console.log(arguments[0]);
}

function showChatsList() {
  let containerDiv = document.querySelector('.chats');
  
  while (containerDiv.firstChild) {
    containerDiv.removeChild(containerDiv.firstChild);
  };

  const orderedChatIds = Object.keys(chats).sort((a, b) => {
    return orderCompare(chats[b].order, chats[a].order);
  });

  orderedChatIds.forEach(id => {
    let chat = chats[id];
    let lastMessage = chat.last_message.content;
    let text;

    if (lastMessage.text) {
      text = lastMessage.text.text;
    } else {
      text = 'Вложение'
    }

    let chatDiv = document.createElement('div');
    chatDiv.className = 'chat';
    chatDiv.dataset.id = chat.id;
    chatDiv.addEventListener('click', onChatClick);

    let authorSpan = document.createElement('span');
    authorSpan.className = 'author';
    authorSpan.textContent = chat.title;

    let messageSpan = document.createElement('span');
    messageSpan.className = 'message';
    messageSpan.textContent = text;

    chatDiv.appendChild(authorSpan);
    chatDiv.appendChild(messageSpan);

    // смотрим, если есть фотка и она уже загружена
    if (chat.photo && files[chat.photo.small.id]) {
      send({
        '@type': 'readFile',
        file_id: chat.photo.small.id
      }).then(file => {
        console.log('chat photo try set', file);

        let image = new Image();
        image.src = URL.createObjectURL(file.data);

        chatDiv.appendChild(image);
      });
    }

    containerDiv.appendChild(chatDiv);

    // console.log(chat);
  });
}

function getFile(fileId) {
  send({
    '@type': 'downloadFile',
    file_id: fileId,
    priority: 32
  });

  console.log('file loading', fileId)
}

function loadChatList() {
  send({
    '@type': 'getChats',
    offset_chat_id: 0,
    offset_order: '9223372036854775807',
    limit: CHAT_SLICE_LIMIT
  }).then((result) => {
    console.log('chat list', result);
  });
}

function onChatClick(e) {
  let chats = document.querySelectorAll('.chat');

  for (var i = 0; i < chats.length; i++) {
    let chat = chats[i];

    chat.classList.remove('active');
  }

  e.currentTarget.classList.add('active');

  currentChatId = e.currentTarget.dataset.id;
}

function onSendButtonClick() {
  if (currentChatId !== -1) {
    let text = document.querySelector('input').value;

    let textObject = {
      '@type': 'text',
      text
    };

    let inputContent = {
      '@type': 'inputMessageText',
      text: textObject,
      disable_web_page_preview: false,
      clear_draft: true
    };

    send({
      '@type': 'sendMessage',
      chat_id: currentChatId,
      input_message_content: inputContent
    });
  }
}

console.log(td);

export default td;