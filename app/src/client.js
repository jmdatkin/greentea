const { Socket } = require("socket.io-client");
const io = require("socket.io-client");
const ievent = require("./ievent");

//Shortcut for querySelector
const $ = x => document.querySelector(x);
const $$ = x => document.querySelectorAll(x);

const GRID_SIZE = 50;
const FONT_SIZE = 32;
const FONT_STRING = 'Veranda, sans-serif';

let UserNick = "";

const COLORS = {
    "black": {
        r: 0,
        b: 0,
        g: 0,   
    },
    "red": {
        r: 236,
        g: 35,
        b: 35
    },
    "orange": {
        r: 215,
        g: 140,
        b: 45
    },
    "green": {
        r: 47,
        g: 232,
        b: 21
    },
    "blue": {
        r: 0,
        g: 195,
        b: 255
    },
    "purple": {
        r: 131,
        g: 0,
        b: 221
    },
    toRGB: function(c) {
        let obj = this[c];
        return `rgb(${obj.r},${obj.g},${obj.b})`;
    },
    toRGBA: function(c,a) {
        let obj = this[c];
        return `rgba(${obj.r},${obj.g},${obj.b},${a})`;
    }
};

//Array storing text data
let texts = [];
let avg = { x: 0, y: 0 };

let selectedColor = {
    _color: "black",
    get color() {
        return this._color;
    },
    set color(x) {
        this._color = x;
        InputField.setColor(x);
    }
}

//Screen coordinates
const WorldCoords = {
    x: 0,
    y: 0,
    z: 0,
};

//Canavs DOM element
const canvas = $("#main-canv");
const ctx = canvas.getContext("2d");

let c_width = 1600;
let c_height = 900;

const resize = function (w, h) {
    c_width = w;
    c_height = h;
    canvas.width = c_width;
    canvas.height = c_height;
};


const floorMod = function (n, m) {
    return ((n % m) + m) % m;
};



class Text {
    constructor(x, y, z, value, color) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.value = value;
        this.color = color;
        this.time = Date.now();
    }
}

const Draw = {
    drawGrid: function () {
        const minorColor = "#e5e5e5";
        const majorColor = "#dfdfdf";

        let majorGridSize = GRID_SIZE * 5;
        let i = GRID_SIZE - floorMod(WorldCoords.x, GRID_SIZE);
        let j = GRID_SIZE - floorMod(WorldCoords.y, GRID_SIZE);

        //Minor gridlines: gridlines within each group of 5
        let ii = i;
        ctx.beginPath();
        while (ii <= c_width) {
            ctx.moveTo(ii, 0);
            ctx.lineTo(ii, c_height);
            ii += GRID_SIZE;
        }

        let jj = j;
        while (jj <= c_height) {
            ctx.moveTo(0, jj);
            ctx.lineTo(c_width, jj);
            jj += GRID_SIZE;
        }

        ctx.lineWidth = 2;
        ctx.strokeStyle = minorColor;
        ctx.stroke();

        //Major gridlines: gridlines marking intervals of 5 minor gridlines
        i = majorGridSize - floorMod(WorldCoords.x, majorGridSize);
        j = majorGridSize - floorMod(WorldCoords.y, majorGridSize);

        ii = i;
        ctx.beginPath();
        while (ii <= c_width) {
            ctx.moveTo(ii, 0);
            ctx.lineTo(ii, c_height);
            ii += majorGridSize;
        }

        jj = j;
        while (jj <= c_height) {
            ctx.moveTo(0, jj);
            ctx.lineTo(c_width, jj);
            jj += majorGridSize;
        }
        ctx.lineWidth = 3;
        ctx.strokeStyle = majorColor;
        ctx.stroke();
    },

    drawText: function (text, color) {
        ctx.fillStyle = color;
        let dz = WorldCoords.z - text.z;
        let thisFontSize = FONT_SIZE;
        let fontString = `${thisFontSize}px ${FONT_STRING}`;
        ctx.font = fontString;

        //Adjust for offset between canvas text render and DOM style properties
        ctx.fillText(text.value, text.x - WorldCoords.x, text.y + FONT_SIZE - 2 - WorldCoords.y);
    },

    drawAvg: function (x, y) {
        let centerX = WorldCoords.x + c_width / 2;
        let centerY = WorldCoords.y + c_height / 2;

        let m = (y - centerY) / (x - centerX);

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
        ctx.stroke();

        //y = m(x-x0) + y0

    },

    clear: function () {
        ctx.clearRect(0, 0, c_width, c_height);
    }
};

const InputField = (function () {

    const element = document.createElement('input');
    element.maxLength = 255;
    element.style.fontSize = `${FONT_SIZE}px`;
    element.style.fontFamily = FONT_STRING;
    element.classList.add("TextInput");

    var x = 0,
        y = 0;

    const set = (newX, newY) => {
        x = newX;
        y = newY;
        element.style.left = `${newX}px`;
        element.style.top = `${newY}px`;
    };

    const hide = () => element.classList.add("hidden");
    const unhide = () => element.classList.remove("hidden");

    const focus = () => element.focus();
    const unfocus = () => element.blur();

    const setColor = newColor => {
        element.style.color = COLORS.toRGB(newColor);
    };

    hide();
    $(".canvas-wrapper").appendChild(element)

    //Evt handler for textarea defocus
    const blurHandler = function (e) {
        element.value = '';     //Clear inputted text
        hide();                 //Hide form (user has submitted)
    };

    const submitHandler = function () {
        let textObj = new Text(InputField.x + WorldCoords.x,
            InputField.y + WorldCoords.y,
            WorldCoords.z,
            InputField.value, selectedColor.color);
        console.log(textObj);
        SocketIO.sendText(textObj);     //Send data to server
        InputField.unfocus();           //Unfocus input area
    };

    //Check for enter
    const keypressHandler = function (e) {
        if (e.code === 'Enter')
            submitHandler();
    };

    element.addEventListener("blur", blurHandler);
    element.addEventListener("submit", submitHandler);
    element.addEventListener("keypress", keypressHandler);

    return {
        element: element,
        set: set,
        hide: hide,
        unhide: unhide,
        focus: focus,
        unfocus: unfocus,
        setColor: setColor,
        get value() {
            return element.value;
        },
        get x() {
            return x;
        },
        get y() {
            return y;
        }
    };
})();


const CanvasEvents = new ievent({ delta: 81 });
const mouseDownHandler = (e, i) => {
    let m = e.touches ? e.touches[0] : e;
    console.log(WorldCoords);
    i.store.put({
        px: m.pageX,
        py: m.pageY,
        wx: WorldCoords.x,
        wy: WorldCoords.y,
        drag: false
    });
    i.handlers[canvas]["mousemove"].activate();
    i.handlers[canvas]["touchmove"].activate();
};
CanvasEvents.addEvent(canvas, "mousedown", mouseDownHandler);
CanvasEvents.addEvent(canvas, "touchstart", mouseDownHandler);

const mouseMoveHandler = (e, i) => {
    let m = e.touches ? e.touches[0] : e;
    let store = i.store.get();
    let cx = m.pageX,
        cy = m.pageY;
    let drag;

    dx = cx - store.px;
    dy = cy - store.py;

    dist = dx * dx + dy * dy;

    if (dist > store.delta) {
        drag = true;
        canvas.classList.add("dragged");
        WorldCoords.x = store.wx - dx;
        WorldCoords.y = store.wy - dy;
        $("#coord-indicator").textContent = `x: ${WorldCoords.x}, y: ${WorldCoords.y}`;
    }
    else
        drag = false;
    i.store.put({ drag: drag });
};
CanvasEvents.addEvent(canvas, "mousemove", mouseMoveHandler, false);
CanvasEvents.addEvent(canvas, "touchmove", mouseMoveHandler, false);

const mouseUpHandler = (e, i) => {
    canvas.classList.remove("dragged");
    if (!i.store.get("drag"))
        canvasClickHandler(e);
    i.handlers[canvas]["mousemove"].deactivate();
    i.handlers[canvas]["touchmove"].deactivate();
};
CanvasEvents.addEvent(canvas, "mouseup", mouseUpHandler);
CanvasEvents.addEvent(canvas, "touchend", mouseUpHandler);

const canvasClickHandler = function (e) {
    let m = e.touches ? e.touches[0] : e;
    let x = m.pageX;
    let y = m.pageY;

    InputField.set(x, y);
    InputField.unhide();
    InputField.focus();
};


const ColorPicker = (function() {
    const swatches = Array.from($$(".color-swatch"));
    const SquareSize = 25;
    let selected;

    console.log(swatches);

    swatches.forEach(swatch => {
        let thisColor = swatch.dataset.color;
        swatch.style.backgroundColor = COLORS.toRGB(thisColor);
        swatch.style.width = `${SquareSize}px`;
        swatch.style.height = `${SquareSize}px`;
        swatch.addEventListener("click", (e) => {
            swatches.forEach(s => {
                s.classList.remove("color-swatch-selected");
            });
            e.target.classList.add("color-swatch-selected");
            selected = e.target;
            selectedColor.color = thisColor;
        });
    });

})();

const UsersList = (function() {
    const listElement = $("#connected-users-list");

    let userList = [];

    const updateUsers = function(newUsers) {
        userList = newUsers;
        listElement.innerHTML = '';
        newUsers.forEach(user => {
            let li = document.createElement('li');
            li.textContent = user;
            listElement.appendChild(li);
        });
        // newUsers.forEach(user => {
        //     let tr = document.createElement('tr');
        //     let td = document.createElement('td');
        //     td.textContent = user;
        //     tr.appendChild(td);
        //     listElement.appendChild(tr);
        // });
    }

    return {
        updateUsers: updateUsers
    };
})();

const NicknameField = (function() {
    const inputElement = $("#nickname-field");
    const editButton = $("#nickname-toggle-edit");

    let editable = false;
    let nick = "";
    inputElement.value = '';

    const enableEdit = () => {
        inputElement.classList.add("editable");
        inputElement.removeAttribute("disabled");
        editable = true;
    };

    const disableEdit = () => {
        inputElement.classList.remove("editable");
        inputElement.setAttribute("disabled","");
        editable = false;
    }

    const editClick = () => {
        enableEdit();
        inputElement.focus();
        inputElement.select();
    };

    const nicknameBlur = e => {
        disableEdit();
        UserNick = nick;
        SocketIO.nicknameUpdate();
    };

    const nicknameChange = e => {
        nick = e.target.value;
    };

    const nicknameSubmit = e => {
        if (e.code === 'Enter')
            e.target.blur();
    }

    editButton.addEventListener("click", editClick);
    inputElement.addEventListener("change", nicknameChange);
    inputElement.addEventListener("blur", nicknameBlur);
    inputElement.addEventListener("keydown", nicknameSubmit);
    
})();



const Engine = (function () {
    var iid;
    const persistTime = 7500;
    const fadeDelta = 300;

    const step = function () {
        let now = Date.now();
        Draw.clear();
        Draw.drawGrid();  //First draw grid
        texts.forEach((text) => {   //Draw all current texts
            let textObj = text.data;
            // console.log(textObj);
            let dTime = now - textObj.time;
            let alpha = dTime < persistTime ? 1.0 : Math.max(0, fadeDelta - (dTime - persistTime)) / fadeDelta;
            let color = COLORS.toRGBA(textObj.color, alpha);//`rgba(0,0,0,${alpha}`;
            Draw.drawText(textObj, color);
        });
        window.requestAnimationFrame(step);
    };

    const start = function () {
        iid = window.requestAnimationFrame(step);
    }

    const stop = function () {
        window.cancelAnimationFrame(iid);
    }

    return {
        start: start,
        stop: stop
    };
})();


const SocketIO = (function () {
    // const socket = io("http://192.168.1.226:9001");
    // const socket = io("http://localhost:9001");
    // const HOSTNAME = "https://jatkin.dev";
    const HOSTNAME = "http://127.0.0.1";
    const PORT = "9001";
    const url = `${HOSTNAME}:${PORT}`;

    const socket = io(url);

    console.log(socket);

    socket.on('textUpdate', (data) => {
        texts = data.texts;
        avg = data.avg;
        console.log('text update');
    });
    
    socket.on("userUpdate", (users) => UsersList.updateUsers(users));

    const sendText = function (text) {
        console.log(`sending text: ${text.value}`);
        console.log(text);
        socket.emit('text', text);
    };

    const nicknameUpdate = function() {
        socket.emit('nicknameUpdate', UserNick);
    };

    return {
        sendText: sendText,
        nicknameUpdate: nicknameUpdate
    };

})();

resize(window.innerWidth, window.innerHeight);
window.addEventListener("resize", () => {
    resize(window.innerWidth, window.innerHeight);
});

Engine.start();