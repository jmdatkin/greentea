import settings from './settings';
import ievent from './ievent';
import SocketIO from './network-controller';
import Text from './text';
import { vec4, mat4 } from "./gl-matrix";
import Vector from "./vector";
import { $ } from "./util";
import Canvas from "./canvas";
// import { drawAdaptiveGrid, drawText, clear } from "./draw";
import Camera from './camera';
import { InputField, UsersList } from './ui';
import Store from "./store";
import { QuadShape } from "./shape";


let UserNick = "";
let UserId = "";

//Array storing text data
let texts = [];

$("#move-mode").addEventListener("click", () => {
    Store.publish("mode-change", {
        mode: 'move'
    });
});

$("#rect-mode").addEventListener("click", () => {
    Store.publish("mode-change", {
        mode: 'rect'
    });
});

const events = new ievent({ delta: 81 });
const mouseDownHandler = (e, i) => {
    let m = e.touches ? e.touches[0] : e;

    const MODE = Store.store.mode;

    if (MODE === "move") {
        i.store.put({
            px: m.pageX,
            py: m.pageY,
            wx: Store.store.x,
            wy: Store.store.y,
            drag: false
        });
    }
    else if (MODE === "rect") {
        i.store.put({
            px: m.pageX,
            py: m.pageY,
            wx: Store.store.x,
            wy: Store.store.y,
            drag: false
        });
    }
    i.handlers[Canvas.canvas]["mousemove"].activate();
    i.handlers[Canvas.canvas]["touchmove"].activate();
};
events.addEvent(Canvas.canvas, "mousedown", mouseDownHandler);
events.addEvent(Canvas.canvas, "touchstart", mouseDownHandler);

const mouseMoveHandler = (e, i) => {
    let m = e.touches ? e.touches[0] : e;

    const MODE = Store.store.mode;

    let store = i.store.get();

    if (MODE === "move") {
        let cx = m.pageX,
            cy = m.pageY;
        let drag;

        let dx = cx - store.px;
        let dy = cy - store.py;

        let dist = dx * dx + dy * dy;

        if (dist > store.delta) {
            drag = true;
            Canvas.canvas.classList.add("dragged");

            //
            Store.publish("view-move", {
                x: store.wx - dx,
                y: store.wy - dy
            });

            // Camera.moveTo(store.wx - dx, store.wy - dy);
            // coords.x = store.wx - dx;
            // coords.y = store.wy - dy;
            $("#coord-indicator").textContent = `x: ${Camera.coords.x}, y: ${Camera.coords.y}, z: ${Camera.coords.z}`;
        }
        else
            drag = false;
        i.store.put({ drag: drag });
    }
    else if (MODE === "rect") {
        let dx = m.pageX - store.px;
        let dy = m.pageY - store.py;
        let tempShape = new QuadShape(store.px, store.py, dx, dy);
        Store.publish("shape-draw-progress", {
            tempShape: tempShape
        });
    }
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
    Store.publish("text-update", {
        texts: data
    });
    texts = data.texts.sort((t1, t2) => {
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

const init = function () {
    Canvas.resize(window.innerWidth, window.innerHeight);
};

init();