const { Socket } = require("socket.io-client");
const io = require("socket.io-client");
const ievent = require("./ievent");

//Shortcut for querySelector
const $ = x => document.querySelector(x);

const GRID_SIZE = 50;
const FONT_SIZE = 18;

//Array storing text data
let texts = [];
let avg = {x: 0, y: 0};

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

const resize = function(w,h) {
    c_width = w;
    c_height = h;
    canvas.width = c_width;
    canvas.height = c_height;
};


const floorMod = function (n, m) {
    return ((n % m) + m) % m;
};



class Text {
    constructor(x, y, z, value) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.value = value;
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
        let fontString = `${thisFontSize}px sans-serif`;
        ctx.font = fontString;

        //Adjust for offset between canvas text render and DOM style properties
        ctx.fillText(text.value, text.x - WorldCoords.x, text.y + FONT_SIZE - 1 - WorldCoords.y);
    },

    drawAvg: function(x,y) {
        let centerX = WorldCoords.x + c_width/2;
        let centerY = WorldCoords.y + c_height/2;

        let m = (y - centerY)/(x-centerX);

        ctx.beginPath();
        ctx.moveTo(centerX,centerY);
        ctx.lineTo(x,y);
        ctx.stroke();

        //y = m(x-x0) + y0

    },

    clear: function() {
        ctx.clearRect(0,0,c_width,c_height);
    }
};

const InputField = (function () {

    const element = document.createElement('input');
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

    hide();
    $(".canvas-wrapper").appendChild(element)

    //Evt handler for textarea defocus
    const blurHandler = function (e) {
        element.value = '';     //Clear inputted text
        hide();                 //Hide form (user has submitted)
    };

    //Check for enter
    const keypressHandler = function (e) {
        if (e.code === 'Enter') {
            let textObj = new Text(InputField.x + WorldCoords.x,
                InputField.y + WorldCoords.y,
                WorldCoords.z,
                InputField.value);
            console.log(textObj);
            SocketIO.sendText(textObj);     //Send data to server
            InputField.unfocus();           //Unfocus input area
        }
    };

    element.addEventListener("blur", blurHandler);
    element.addEventListener("keypress", keypressHandler);;

    return {
        element: element,
        set: set,
        hide: hide,
        unhide: unhide,
        focus: focus,
        unfocus: unfocus,
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


const CanvasEvents = new ievent({delta: 81});
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
    if (!i.store.get("drag"))
        canvasClickHandler(e);
    i.handlers[canvas]["mousemove"].deactivate();
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



const Engine = (function () {
    var iid;
    const persistTime = 5500;
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
            let color = `rgba(0,0,0,${alpha}`;
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
    const HOSTNAME = "https://jatkin.dev";
    const PORT = "9001";
    const url = `${HOSTNAME}:${PORT}`;

    const socket = io(url);

    console.log(socket);

    socket.on('textupdate', (data) => {
        texts = data.texts;
        avg = data.avg;
        console.log('text update');
    });

    const sendText = function (text) {
        console.log(`sending text: ${text.value}`);
        socket.emit('text', text);
    }

    return {
        sendText: sendText
    };

})();

resize(window.innerWidth, window.innerHeight);
window.addEventListener("resize", () => {
    resize(window.innerWidth, window.innerHeight);
});

Engine.start();