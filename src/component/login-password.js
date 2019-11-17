import TdController from '../core/td.js';
import ApplicationStore from '../store/application.js';

class LoginPassword extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  onNextButtonClick() {
    TdController.send({
      '@type': 'checkAuthenticationPassword',
      password: this.passwordElement.value
    });
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

    this.monkeyElement = document.createElement('img');
    this.monkeyElement.src = './assets/monkey-2.png';
    this.monkeyElement.className = 'monkey';

    this.headerElement = document.createElement('h2');
    this.headerElement.className = 'header';
    this.headerElement.textContent = 'Enter a Password';

    this.descriptionElement = document.createElement('p');
    this.descriptionElement.className = 'description';
    this.descriptionElement.textContent = 'Your account is protected with an additional password.';

    this.passwordElement = document.createElement('input');
    this.passwordElement.className = 'password';
    this.passwordElement.type = 'password';
    this.passwordElement.placeholder = 'Password';

    this.nextButtonElement = document.createElement('button');
    this.nextButtonElement.addEventListener('click', this.onNextButtonClick.bind(this));
    this.nextButtonElement.textContent = 'NEXT';



    this.shadowRoot.appendChild(this.monkeyElement);
    this.shadowRoot.appendChild(this.headerElement);
    this.shadowRoot.appendChild(this.descriptionElement);
    this.shadowRoot.appendChild(this.passwordElement);
    this.shadowRoot.appendChild(this.nextButtonElement);
  }

  getStyleTag() {
    const tag = document.createElement('style');

    tag.innerHTML = `
:host {
  display: block;
  width: 720px;
  margin: auto;
  margin-top: 140px;
  text-align: center;
}

.monkey {
  width: 150px;
}

.header {
  margin: 0;
  margin-top: 50px;
  font-size: 30px;
  font-weight: 500;
}

.description {
  width: 35%;
  margin: auto;
  margin-top: 15px;
  margin-bottom: 55px;
  color: #82878a;
  font-size: 15px;
}

.password {
  display: block;
  width: 320px;
  margin: auto;
  margin-bottom: 24px;
  padding: 16px 12px;
  font-size: 15px;
  border: 2px solid #dadce0;
  border-radius: 10px;
  outline: none;
}

.password:focus {
  border-color: #4ea4f6;  
}

button {
  display: block;
  margin: auto;
  margin-top: 50px;
  width: 350px;
  height: 55px;
  background: #4ea4f6;
  color: #fff;
  border-radius: 12px;
  border: none;
  font-size: 16px;
  outline: none;
  cursor: pointer;
}
    `;

    return tag;
  }
}

customElements.define('login-password', LoginPassword);

export default LoginPassword;