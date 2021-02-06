const { Socket } = require("socket.io-client");
const io = require("socket.io-client");

const App = (function() {
    function err(self,msg) {
        console.log(`Error from`);
        console.log(self);
        console.log(`> ${msg}`);
    }

    function CoordPair(x,y) {
        this.x = x;
        this.y = y;
    };
    CoordPair.prototype.set = function(object) {
        if (object.hasOwnProperty('x'))
            this.x = object.x;
        else {
            err(this,"Object passed has no property x");
            return;
        }
        if (object.hasOwnProperty('y'))
            this.y = object.y;
        else {
            err(this,"Object passed has no property y");
            return;
        }
    }


    function Text(x,y,value) {
        this.x = x;
        this.y = y;
        this.value = value;
        this.timestamp = Date.now();
        this.persistTime = 3500;    //ms
    }

    function TextFactory(x,y,callback) {
        let textObj;

        let element = document.createElement('input');
        element.classList.add("TextInput");
        element.style.left = `${x}px`;
        element.style.top = `${y}px`;
        element.addEventListener("change", (e) => {
            this.value = e.target.value;
        });
        element.addEventListener("blur", (e) => {
            //Canvas.writeText(this);
            e.target.remove();  //Incompat w/ IE9
        });
        element.addEventListener("keypress", (e) => {
            if (e.code === 'Enter') {
                //console.log(this.value);
                textObj = new Text(x,y);
                textObj.value = e.target.value;
                //callback(textObj);
                // console.log(this.value);
                e.target.blur();
                callback(textObj);
            }
        });

        document.querySelector(".canvas-wrapper").appendChild(element);
        element.focus();

    }

    const fontSize = 18;
    let texts = [];

    const userCoords = {
        x: 0,
        y: 0
    };

    const Canvas = (function() {
        var width = 1600;
        var height = 900;

        // const canvasCoords = {
        //     // get x() {
        //     //     return userCoords.x;
        //     // },
        //     // get y() {
        //     //     return userCoords.y;
        //     // },
        //     get w() {
        //         return width;
        //     },
        //     get h() {
        //         return height;
        //     }
        // };    

        const canvas = document.getElementById("main-canv");
        const ctx = canvas.getContext("2d");

        //Sets canvas element width and height to canvas dimensions
        const refreshCanvasDims = function() {
            canvas.width = width;
            canvas.height = height;
        };

        const setDims = function(w,h) {
            width = w;
            height = h;
            refreshCanvasDims();
        };

        const clear = function() {
            ctx.clearRect(0,0,width,height);
        }


        const writeText = function(text,color) {
            ctx.fillStyle = color;
            ctx.font = "18px sans-serif";


            ctx.fillText(text.value, text.x, text.y+fontSize-1);
        }

        //Public 
        return {
            canvas: canvas,
            setDims: setDims,
            writeText: writeText,
            clear: clear
        };
    })();

    Canvas.setDims(window.innerWidth,window.innerHeight);

    const Events = (function() {
        Canvas.canvas.addEventListener("click", (e) => {
            TextFactory(e.pageX,e.pageY,(text) => {SocketIO.sendText(text)});
        });


        return {
            // get texts() {
            //     return inputs;
            // }
        };

    })();


    const Renderer = (function() {
        
        var iid;

        const fadeDelta = 300;

        const draw = function(time) {
            texts.forEach((text) => {
                let textObj = text.data;
                let dTime = time - textObj.timestamp;
                let color = `rgba(0,0,0,${dTime < textObj.persistTime ? 1.0 : Math.max(0,fadeDelta - (dTime-textObj.persistTime))/fadeDelta})`;
                Canvas.writeText(textObj, color);
            });
        }

        const step = function() {
            let now = Date.now();
            Canvas.clear();
            draw(now);
            window.requestAnimationFrame(step);
        };

        const start = function() {
            iid = window.requestAnimationFrame(step);
        }

        const stop = function() {
            window.cancelAnimationFrame(iid);
        }

        return {
            start: start,
            stop: stop
        };
    })();

    Renderer.start();

    const SocketIO = (function() {
        const socket = io("http://localhost:9001");
        console.log(socket);
        
        socket.on('textupdate', (data) => {
            texts = data;
            console.log('text update');
        });

        const sendText = function(text) {
            console.log(`sending text: ${text.value}`);
            socket.emit('text',text);
        }

        return {
            sendText: sendText
        };

    })();

    //Public
    return {
        start: Renderer.start,
        stop: Renderer.stop
    };
})();