import TdController from '../core/td.js';
import ApplicationStore from '../store/application.js';
import LoginPhone from '../component/login-phone.js';
import LoginCode from '../component/login-code.js';
import LoginPassword from '../component/login-password.js';

class LoginScreen extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: 'open' });

    this.waitingForThePhone = true;
    this.waitingForTheCode = false;
    this.waitingForThePassword = false;

    this.phoneElement = new LoginPhone();
    this.codeElement = new LoginCode();
    this.passwordElement = new LoginPassword();

    this.render();
  }

  connectedCallback() {
    ApplicationStore.addListener('updateAuthorizationState', this.onUpdate.bind(this));
  }

  disconnectedCallback() {
    ApplicationStore.removeListener('updateAuthorizationState', this.onUpdate.bind(this));
  }

  onUpdate(update) {
    switch (update['@type']) {
      case 'updateAuthorizationState': {
        switch (update.authorization_state['@type']) {
          case 'authorizationStateWaitPhoneNumber':
            this.waitingForThePhone = true;
            this.waitingForTheCode = false;
            this.waitingForThePassword = false;

            this.render();

            break;

          case 'authorizationStateWaitCode':
            this.waitingForThePhone = false;
            this.waitingForTheCode = true;
            this.waitingForThePassword = false;

            this.render();

            break;

          case 'authorizationStateWaitPassword':
            this.waitingForThePhone = false;
            this.waitingForTheCode = false;
            this.waitingForThePassword = true;

            this.hint = update.authorization_state.password_hint;

            this.render();

            break;
        }
      }
    }
  }

  clearNodes() {
    let i = this.shadowRoot.childNodes.length;

    while (i--) {
      this.shadowRoot.removeChild(this.shadowRoot.lastChild);
    }
  }

  render() {
    this.clearNodes();

    this.shadowRoot.appendChild(this.getStyleTag());

    if (this.waitingForThePhone) {
      this.shadowRoot.appendChild(this.phoneElement);      
    } else if (this.waitingForTheCode) {
      this.shadowRoot.appendChild(this.codeElement);

      this.codeElement.headerElement.textContent = this.phoneElement.number;
    } else if (this.waitingForThePassword) {
      this.shadowRoot.appendChild(this.passwordElement);

      this.passwordElement.passwordElement.placeholder = `Hint: ${ this.hint }***`;
    }
  }

  getStyleTag() {
    const tag = document.createElement('style');

    tag.innerHTML = `
:host {
  display: block;
}
    `;

    return tag;
  }
}

customElements.define('login-screen', LoginScreen);

export default LoginScreen;