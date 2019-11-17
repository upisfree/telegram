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

  onCodeInput() {
    if (this.codeElement.value.toString().length === 5) {
      this.codeElement.disabled = true;

      TdController.send({
        '@type': 'checkAuthenticationCode',
        code: this.codeElement.value
      }).then(() => {
        this.codeElement.disabled = false;
      }).catch(() => {
        this.codeElement.disabled = false;
      });
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

    this.monkeyElement = document.createElement('img');
    this.monkeyElement.src = './assets/monkey-1.png';
    this.monkeyElement.className = 'monkey';

    this.headerElement = document.createElement('h2');
    this.headerElement.className = 'header';
    this.headerElement.textContent = this.number;

    this.descriptionElement = document.createElement('p');
    this.descriptionElement.className = 'description';
    this.descriptionElement.textContent = 'We have sent you an SMS with the code.';

    this.codeElement = document.createElement('input');
    this.codeElement.className = 'code';
    this.codeElement.placeholder = 'Code';
    this.codeElement.addEventListener('input', this.onCodeInput.bind(this));



    this.shadowRoot.appendChild(this.monkeyElement);
    this.shadowRoot.appendChild(this.headerElement);
    this.shadowRoot.appendChild(this.descriptionElement);
    this.shadowRoot.appendChild(this.codeElement);
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
  width: 160px;
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

.code {
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

.code:focus {
  border-color: #4ea4f6;  
}
    `;

    return tag;
  }
}

customElements.define('login-code', LoginPassword);

export default LoginPassword;