import TdController from '../core/td.js';
import ApplicationStore from '../store/application.js';

class LoginRegistration extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  onNextButtonClick() {
    TdController.send({
      '@type': 'registerUser',
      first_name: this.firstNameElement.value,
      last_name: this.lastNameElement.value
    });
  }

  onPhoneInput() {
    this.lastNameElement.classList.remove('invalid');
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

    this.logoElement = document.createElement('img');
    this.logoElement.src = './assets/logo.svg';
    this.logoElement.className = 'logo';

    this.headerElement = document.createElement('h2');
    this.headerElement.className = 'header';
    this.headerElement.textContent = 'Your name';

    this.descriptionElement = document.createElement('p');
    this.descriptionElement.className = 'description';
    // this.descriptionElement.textContent = 'Enter your name and add a profile picture.';
    this.descriptionElement.textContent = 'Enter your name';

    this.firstNameElement = document.createElement('input');
    this.firstNameElement.className = 'first-name';
    this.firstNameElement.placeholder = 'Name';

    this.lastNameElement = document.createElement('input');
    this.lastNameElement.className = 'last-name';
    this.lastNameElement.placeholder = 'Last Name (optional)';

    this.nextButtonElement = document.createElement('button');
    this.nextButtonElement.addEventListener('click', this.onNextButtonClick.bind(this));
    this.nextButtonElement.textContent = 'START MESSAGING';



    this.shadowRoot.appendChild(this.logoElement);
    this.shadowRoot.appendChild(this.headerElement);
    this.shadowRoot.appendChild(this.descriptionElement);
    this.shadowRoot.appendChild(this.firstNameElement);
    this.shadowRoot.appendChild(this.lastNameElement);
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

.logo {
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

.first-name,
.last-name {
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

.first-name:focus,
.last-name:focus {
  border-color: #4ea4f6;  
}

.invalid {
  border-color: #d4483e;
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

customElements.define('login-registration', LoginRegistration);

export default LoginRegistration;