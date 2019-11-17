import TdController from '../core/td.js';
import ChatStore from '../store/chat.js';
import FileStore from '../store/file.js';
import ChatList from '../component/chat-list.js';

class MainScreen extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.chatListElement = new ChatList();

    this.shadowRoot.appendChild(this.getStyleTag());
    this.shadowRoot.appendChild(this.chatListElement);
  }

  getStyleTag() {
    const tag = document.createElement('style');

    tag.innerHTML = `
:host {
  display: block;
  max-width: 1680px;
  height: 100vh;
  margin: auto;
  background: #e6ebee;*
  border-left: 1px solid #dedfe3;
}
    `;

    return tag;
  }
}

customElements.define('main-screen', MainScreen);

export default MainScreen;