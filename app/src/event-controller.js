import { $, ptou } from './util';
import Store from './store';
import { CoordIndicator } from './ui';
import ListenerGroup from './listener-group';
import Canvas from './canvas';
import SocketIO from './network-controller';
import { QuadShape } from './shape';

const BindButtonEvents = function () {
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

    $("#home").addEventListener("click", () => {
        Store.publish("view-move", {
            x: 0,
            y: 0,
            z: 1,
        });
    });
};

const BindStoreEvents = function () {
    Store.subscribe('view-move', (store) => {
        // Canvas.moveTo(store.x,store.y);
        // Canvas.zoomTo(store.z);
        CoordIndicator.update(store.x, store.y, store.z);
    });
};

const BindSocketEvents = function () {

};

const BindMouseEvents = function () {
    // const MouseEventGroup = new ListenerGroup({ delta: 1 });
    // const mouseDownHandler = (e, i) => {
    //     let m = e.touches ? e.touches[0] : e;

    //     const MODE = Store.store.mode;

    //     if (MODE === "move") {
    //         i.store.put({
    //             px: ptou(m.pageX)*Store.store.z,
    //             py: ptou(m.pageY - e.target.offsetTop)*Store.store.z,
    //             wx: Store.store.x,
    //             wy: Store.store.y,
    //             drag: false
    //         });
    //     }
    //     else if (MODE === "rect") {
    //         i.store.put({
    //             px: ptou(m.pageX),
    //             py: ptou(m.pageY - e.target.offsetTop),
    //             wx: Store.store.x,
    //             wy: Store.store.y,
    //             drag: false
    //         });
    //     }
    //     i.handlers[Canvas.canvas]["mousemove"].activate();
    //     i.handlers[Canvas.canvas]["touchmove"].activate();
    // };
    // MouseEventGroup.addEvent(Canvas.canvas, "mousedown", mouseDownHandler);
    // MouseEventGroup.addEvent(Canvas.canvas, "touchstart", mouseDownHandler);

    // const mouseMoveHandler = (e, i) => {
    //     let m = e.touches ? e.touches[0] : e;
    //     let EventGroupStore = i.store.get();

    //     const MODE = Store.store.mode;
    //     if (MODE === "move") {
    //         let cx = ptou(m.pageX)*Store.store.z,
    //             cy = ptou(m.pageY - e.target.offsetTop)*Store.store.z;
    //         let drag;

    //         let dx = cx - EventGroupStore.px;
    //         let dy = cy - EventGroupStore.py;

    //         let dist = dx * dx + dy * dy;

    //         if (dist > EventGroupStore.delta) {
    //             drag = true;
    //             Canvas.canvas.classList.add("dragged");

    //             //
    //             Store.publish("view-move", {
    //                 x: EventGroupStore.wx - dx,
    //                 y: EventGroupStore.wy - dy
    //             });

    //         }
    //         else
    //             drag = false;
    //         i.store.put({ drag: drag });
    //     }
    //     else if (MODE === "rect") {
    //         Canvas.canvas.classList.add("dragged-rect");

    //         let sel_width = (ptou(m.pageX) - EventGroupStore.px)*Store.store.z; 
    //         let sel_height = (ptou(m.pageY - e.target.offsetTop) - EventGroupStore.py)*Store.store.z;
    //         let nx = (EventGroupStore.px*-Store.store.z) + Store.store.x;//*-Store.store.z,
    //         let ny = (EventGroupStore.py*-Store.store.z) + Store.store.y;//*-Store.store.z
    //         let tempShape = new QuadShape(nx, ny, sel_width, sel_height);
    //         Store.publish("shape-draw-progress", {
    //             tempShape: tempShape
    //         });
    //     }
    // };
    // MouseEventGroup.addEvent(Canvas.canvas, "mousemove", mouseMoveHandler, false);
    // MouseEventGroup.addEvent(Canvas.canvas, "touchmove", mouseMoveHandler, false);

    // const mouseUpHandler = (e, i) => {
    //     let MODE = Store.store.mode;

    //     Canvas.canvas.classList.remove("dragged", "dragged-rect");
    //     if (!i.store.get("drag"))
    //         canvasClickHandler(e);
    //     i.handlers[Canvas.canvas]["mousemove"].deactivate();
    //     i.handlers[Canvas.canvas]["touchmove"].deactivate();
    // };
    // MouseEventGroup.addEvent(Canvas.canvas, "mouseup", mouseUpHandler);
    // MouseEventGroup.addEvent(Canvas.canvas, "touchend", mouseUpHandler);

    // const canvasClickHandler = function (e) {
    //     let m = e.touches ? e.touches[0] : e;
    //     let x = m.pageX;
    //     let y = m.pageY;

    //     let MODE = Store.store.mode;

    //     if (MODE === "rect") {
    //         console.log(Store.store.tempShape);
    //         SocketIO.emit("hello");
    //         SocketIO.emit("newShape", Store.store.tempShape);
    //     }
    // };
};


const BindEvents = function() {
    BindStoreEvents();
    BindSocketEvents();
    // BindMouseEvents();
    BindButtonEvents();
};

export default BindEvents;