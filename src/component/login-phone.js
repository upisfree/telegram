import TdController from '../core/td.js';
import ApplicationStore from '../store/application.js';

class LoginPhone extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  // тут ошибки обрабатываем?
  onUpdate(update) {
    switch (update['@type']) {
      case 'updateAuthorizationState': {
        switch (update.authorization_state['@type']) {
          case 'authorizationStateWaitPhoneNumber': {
            document.body.appendChild(loginScreen);

            break;
          }
        }
      }
    }
  }

  onNextButtonClick() {
    this.number = this.phoneElement.value;

    TdController.send({
      '@type': 'setAuthenticationPhoneNumber',
      phone_number: this.phoneElement.value
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

    this.logoElement = document.createElement('img');
    this.logoElement.src = './assets/logo.svg';
    this.logoElement.className = 'logo';

    this.headerElement = document.createElement('h2');
    this.headerElement.className = 'header';
    this.headerElement.textContent = 'Sign in to Telegram';

    this.descriptionElement = document.createElement('p');
    this.descriptionElement.className = 'description';
    this.descriptionElement.textContent = 'Please confirm your country and enter your phone number.';

    this.countryElement = document.createElement('input');
    this.countryElement.className = 'country';
    this.countryElement.placeholder = 'Country';

    this.phoneElement = document.createElement('input');
    this.phoneElement.className = 'phone';
    this.phoneElement.placeholder = 'Phone Number';

    this.keepSignContainerElement = document.createElement('label');
    this.keepSignContainerElement.className = 'keep-sign-in';

    this.keepSignTextElement = document.createElement('span');
    this.keepSignTextElement.className = 'label';
    this.keepSignTextElement.textContent = 'Keep me signed in';

    this.keepSignCheckmarkElement = document.createElement('span');
    this.keepSignCheckmarkElement.className = 'checkmark';

    this.keepSignElement = document.createElement('input');
    this.keepSignElement.type = 'checkbox';
    this.keepSignElement.name = 'keep-sign-in';
    this.keepSignElement.checked = true;

    this.nextButtonElement = document.createElement('button');
    this.nextButtonElement.addEventListener('click', this.onNextButtonClick.bind(this));
    this.nextButtonElement.textContent = 'NEXT';



    this.shadowRoot.appendChild(this.logoElement);
    this.shadowRoot.appendChild(this.headerElement);
    this.shadowRoot.appendChild(this.descriptionElement);
    this.shadowRoot.appendChild(this.countryElement);
    this.shadowRoot.appendChild(this.phoneElement);
    this.keepSignContainerElement.appendChild(this.keepSignTextElement);
    this.keepSignContainerElement.appendChild(this.keepSignElement);
    this.keepSignContainerElement.appendChild(this.keepSignCheckmarkElement);
    this.shadowRoot.appendChild(this.keepSignContainerElement);
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

.phone,
.country {
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

.phone:focus,
.country:focus {
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


.keep-sign-in {
  position: relative;
  display: block;
  width: 310px;
  margin: auto;
  text-align: left;
  cursor: pointer;
  user-select: none;
}

.label {
  display: block;
  font-size: 15px;
  margin-left: 60px;
}

.keep-sign-in input {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  cursor: pointer;
}

.checkmark {
  position: absolute;
  top: 0;
  left: 0;
  width: 18px;
  height: 18px;
  border-radius: 3px;
  background-color: #eee;
}

.keep-sign-in:hover input ~ .checkmark {
  background-color: #ccc;
}

.keep-sign-in input:checked ~ .checkmark {
  background-color: #2196F3;
}

.checkmark::after {
  content: "";
  position: absolute;
  display: none;
}

.keep-sign-in input:checked ~ .checkmark::after {
  display: block;
}

.keep-sign-in .checkmark::after {
  left: 6.5px;
  top: 3px;
  width: 3px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}
    `;

    return tag;
  }
}

customElements.define('login-phone', LoginPhone);

export default LoginPhone;