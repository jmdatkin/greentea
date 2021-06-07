import settings from './settings';
import ievent from './ievent';
import SocketIO from './socket-manager';
import Text from './text';
import { vec4, mat4 } from "./gl-matrix";
import Vector from "./vector";
import Canvas from "./canvas";
import Camera from './camera';
import { InputField, UsersList } from './ui';

const DEV = true;

//Shortcut for querySelector
const $ = x => document.querySelector(x);
const $$ = x => document.querySelectorAll(x);

let UserNick = "";
let UserId = "";

//Array storing text data
let texts = [];

const events = new ievent({ delta: 81 });
const mouseDownHandler = (e, i) => {
    let m = e.touches ? e.touches[0] : e;
    
    i.store.put({
        px: m.pageX,
        py: m.pageY,
        wx: Camera.coords.x,
        wy: Camera.coords.y,
        drag: false
    });
    i.handlers[Canvas.canvas]["mousemove"].activate();
    i.handlers[Canvas.canvas]["touchmove"].activate();
};
events.addEvent(Canvas.canvas, "mousedown", mouseDownHandler);
events.addEvent(Canvas.canvas, "touchstart", mouseDownHandler);

const mouseMoveHandler = (e, i) => {
    let m = e.touches ? e.touches[0] : e;
    let store = i.store.get();
    let cx = m.pageX,
        cy = m.pageY;
    let drag;

    let dx = cx - store.px;
    let dy = cy - store.py;

    let dist = dx * dx + dy * dy;

    if (dist > store.delta) {
        drag = true;
        Canvas.canvas.classList.add("dragged");

        Camera.moveTo(store.wx - dx, store.wy - dy);
        // coords.x = store.wx - dx;
        // coords.y = store.wy - dy;
        $("#coord-indicator").textContent = `x: ${Camera.coords.x}, y: ${Camera.coords.y}, z: ${Camera.coords.z}`;
    }
    else
        drag = false;
    i.store.put({ drag: drag });
};
events.addEvent(Canvas.canvas, "mousemove", mouseMoveHandler, false);
events.addEvent(Canvas.canvas, "touchmove", mouseMoveHandler, false);

const mouseUpHandler = (e, i) => {
    Canvas.canvas.classList.remove("dragged");
    if (!i.store.get("drag"))
        canvasClickHandler(e);
    i.handlers[Canvas.canvas]["mousemove"].deactivate();
    i.handlers[Canvas.canvas]["touchmove"].deactivate();
};
events.addEvent(Canvas.canvas, "mouseup", mouseUpHandler);
events.addEvent(Canvas.canvas, "touchend", mouseUpHandler);

const canvasClickHandler = function (e) {
    let m = e.touches ? e.touches[0] : e;
    let x = m.pageX;
    let y = m.pageY;

    InputField.set(x, y);
    InputField.unhide();
    InputField.focus();
};

SocketIO.addListener("textUpdate", (data) => {
    texts = data.texts.sort((t1,t2) => {
        return (t1.z - t2.z);
    });
    // texts = data.texts;
});

SocketIO.addListener("helloId", (id) => {
    UserId = id;
    UsersList.updateUsers()
});

SocketIO.addListener("userUpdate", (data) => {
    UsersList.updateUsers(data);
});

const Engine = (function () {
    var iid;
    const persistTime = 7500;
    const fadeDelta = 300;

    const init = function () {
        Canvas.resize(window.innerWidth, window.innerHeight);
    };

    const step = function () {
        let now = Date.now();
        Canvas.Paint.clear();
        Canvas.Paint.drawAdaptiveGrid();  //First draw grid
        texts.forEach((text) => {   //Draw all current texts
            let textObj = text.data;
            // console.log(textObj);
            let dTime = now - textObj.time;
            //let alpha = dTime < persistTime ? 1.0 : Math.max(0, fadeDelta - (dTime - persistTime)) / fadeDelta;
            let alpha = 1.0;
            let color = settings.colors.toRGBA(textObj.color, alpha);//`rgba(0,0,0,${alpha}`;
            Canvas.Paint.drawText(textObj, color);
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
        init: init,
        start: start,
        stop: stop
    };
})();


Engine.init();
Engine.start();
