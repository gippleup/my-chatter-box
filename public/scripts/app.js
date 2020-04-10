Date.prototype.koreanDate = function() {
  const year = this.getFullYear();
  const month = this.getMonth();
  const date = this.getDate();
  const day = function(){
    let dayName = '일월화수목금토';
    let dayNum = this.getDay();
    return dayName[dayNum];
  }.bind(this)();

  return `${year}년 ${month}월 ${date}일 ${day}요일`
}

// eslint-disable-next-line
const app = {
  server: "http://127.0.0.1:3000/messages",
  // server: "http://52.78.206.149:3000/messages",
  // eslint-disable-next-line no-undef
  roomDropdown: new Dropdown('전체보기', 'select-room'),
  init() {
    document.querySelector('span#select-room').appendChild(app.roomDropdown.container);

    this.fetch()
    .then((msgArr) => {
      msgArr.forEach((msg) => {
        if (!app.tempData[msg.roomname]) {
          app.tempData[msg.roomname] = [];
          app.tempData[msg.roomname].push(msg);
        } else {
          app.tempData[msg.roomname].push(msg);
        }
      })

      let bigRoom;
      let maxMsg = 0;

      app.roomDropdown.addOption('전체보기', 'click', (option) => {
        option.addEventListener('click', app.changeRoom(option.textContent))
      });
      Object.keys(app.tempData)
      .sort((front, rear) => front[0].charCodeAt() - rear[0].charCodeAt())
      .forEach((roomName) => {
        app.roomDropdown.addOption(roomName, 'click', (option) => {
          option.addEventListener('click', app.changeRoom(option.textContent))
        });

        let room = app.tempData[roomName];
        if (room.length > maxMsg) {
          maxMsg = room.length;
          bigRoom = roomName;
        }
      })
      app.roomDropdown.addOption('New Room', 'click', (option) => {
        option.addEventListener('click', app.changeRoom(option.textContent))
      });

      app.changeRoom(bigRoom);
      app.getNewMsgEvery(60);
    });
  },

  fetch() {
    return fetch(this.server)
      .then((res) => res.json())
  },

  getNewMsg() {
    let curMsgKey = {};
    let curMsg = app.tempData[app.state.curRoom];
    curMsg.forEach((msg) => {
      curMsgKey[msg.id] = 1;
    })
    app.fetch()
    .then((json) => {
      json.forEach((msg) => {
        if (!curMsgKey[msg.id]) {
          app.renderMessage(msg);
        }
      })
    });
  },

  send(message) {
    fetch(app.server, {
      method: 'POST',
      body: JSON.stringify(message),
      headers: {
        "Content-Type" : "application/json",
      }
    }).then((response) => {
      return response.json();
    }).then((json) => {
      app.findMsg(json.id);
      let nameBox = document.querySelector('input#name');
      let textBox = document.querySelector('textarea#write');
      nameBox.value = '';
      textBox.value = '';
    })
  },

  findMsg(id) {
    app.fetch()
    .then((json) => {
      json.forEach((msg) => {
        if (msg.id === id) {
          app.renderMessage(msg);
        }
      })
    })
  },

  clearMessages() {
    document.querySelector('div#chats').textContent = '';
  },

  renderMessage(message) {
    const targetNode = document.querySelector('div#chats');
    const tmplt = document.querySelector('template#message');
    const messageEle = document.importNode(tmplt.content, true);
    let userNameEle = messageEle.querySelector('.message-username');
    let dateEle = messageEle.querySelector('.message-date');
    userNameEle.textContent = message.username;
    if (message.date !== undefined) {
      dateEle.textContent = new Date(message.date).koreanDate();
    } else {
      dateEle.textContent = '';
    }
    messageEle.querySelector('.message-content').textContent = message.text;
    targetNode.appendChild(messageEle);
  },

  tempData: {
  },

  changeRoom(roomName) {
    app.clearMessages();

    if (roomName === 'New Room') {
      app.state.prevRoom = app.state.curRoom;
      document.querySelector('span#select-room').style.display = 'none';
      document.querySelector('span#create-room').style.display = 'inline';
      return;
    }

    app.state.prevRoom = app.state.curRoom;
    app.state.curRoom = roomName;

    if (roomName === '전체보기') {
      app.fetch()
      .then((json) => {
        json.forEach((msg) => {
          app.renderMessage(msg);
        })
      })
      return;
    }

    if (!app.tempData[roomName]) {
      app.tempData[roomName] = [];
    }
    app.tempData[roomName].forEach((msg) => {
      app.renderMessage(msg);
    })

    let button = document.querySelector('button#select-room')
    if (button.textContent !== roomName) {
      button.textContent = roomName;
    }
  },

  state: {
    curRoom: '',
    prevRoom: '',
  },

  createRoom() {
    let roomName = document.querySelector('input#create-room').value;
    if (Object.keys(app.tempData).indexOf(roomName) === -1) {

      app.roomDropdown.addOption(roomName, 'click', (option) => {
        option.addEventListener('click', app.changeRoom(option.textContent))
      });
      document.querySelector('input#create-room').value = '';
      document.querySelector('span#select-room').style.display = 'inline';
      document.querySelector('span#create-room').style.display = 'none';
      app.changeRoom(roomName);

    } else {
      alert(`방이름 '${roomName}'은 이미 존재합니다.`)
    }
  },

  cancelCreateRoom() {
    document.querySelector('input#create-room').value = '';
    document.querySelector('span#select-room').style.display = 'inline';
    document.querySelector('span#create-room').style.display = 'none';
    app.changeRoom(app.state.prevRoom);
  },

  createMessage() {
    let nameBox = document.querySelector('input#name');
    let textBox = document.querySelector('textarea#write');
    let newMessage = {
      username: nameBox.value,
      text: textBox.value,
      roomname: app.state.curRoom,
    }
    return newMessage;
  },

  sendMessage() {
    let newMessage = app.createMessage();
    app.send(newMessage)
  },

  getNewMsgEvery(sec) {
    clearInterval(app.getNewMsg);
    setInterval(app.getNewMsg, sec*1000);
  }
};

app.init();

let submitButton = document.querySelector('button#submit');
submitButton.addEventListener('click', app.sendMessage);

let roomCreateButton = document.querySelector('button#create-room');
roomCreateButton.addEventListener('click', app.createRoom);

let cancelCreateButton = document.querySelector('button#cancel-create-room');
cancelCreateButton.addEventListener('click', app.cancelCreateRoom);