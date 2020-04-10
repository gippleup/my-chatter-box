// eslint-disable-next-line no-unused-vars
class ButtonGroup {
  /**
   * @param {string} size lg/sm/''
   */
  constructor(size) {
    this.container = document.createElement('div');
    this.container.classList.add('btn-group');
    if (size) {
      this.container.classList.add(`btn-group-${size}`)
    }
  }

  addButton(name, event='click', callback) {
    let newButton = document.createElement('button');
    newButton.setAttribute('type', 'button');
    newButton.classList.add('btn', 'btn-primary');
    newButton.textContent = name;
    this.container.appendChild(newButton);
    if (typeof callback === 'function') {
      newButton.addEventListener(event, callback(newButton));
    }
  }

  /**
   * @param {HTMLElement} target 
   */
  appendTo(target) {
    target.appendChild(this.container);
  }
}