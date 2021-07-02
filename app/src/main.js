
import Canvas from "./canvas";
import Store from "./store";
import BindEvents from "./event-controller";

let UserNick = "";
let UserId = "";

//Array storing text data
let texts = [];


const Init = function () {
    BindEvents();
    Canvas.resize(window.innerWidth, window.innerHeight);
    Store.publish('view-move');
};

Init();