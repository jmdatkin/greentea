const { Socket } = require("socket.io-client");
const io = require("socket.io-client");

const App = (function () {

    const log = msg => {
        const on = 1;
        if (on > 0)
            console.log(msg);
    };

    const distSq = function (x0, y0, x1, y1) {
        let a = x1 - x0;
        let b = y1 - y0;
        return a * a + b * b
    };


    function floorMod(n, m) {
        return ((n % m) + m) % m;
    }

    function Text(x, y, value) {
        this.x = x;
        this.y = y;
        this.value = value;
        this.timestamp = Date.now();
        this.persistTime = 5500;    //ms
    }

    const createText = function (x, y, value) {
        let text = new Text(x, y, value);
        return text;
    };

    const fontSize = 18;
    let texts = [];

    const worldCoords = (function () {
        var x = 0,
            y = 0;

        return {
            get x() {
                return x;
            },
            get y() {
                return y;
            },
            setX: p => x = p,
            setY: q => y = q
        };
    })();

    const Canvas = (function () {
        var width = 1600;
        var height = 900;

        const gridSize = 50;

        const canvas = document.getElementById("main-canv");
        const ctx = canvas.getContext("2d");

        //Sets canvas element width and height to canvas dimensions
        const refreshCanvasDims = function () {
            canvas.width = width;
            canvas.height = height;
        };

        const setDims = function (w, h) {
            width = w;
            height = h;
            refreshCanvasDims();
        };


        const clear = function () {
            ctx.clearRect(0, 0, width, height);
            log("clearing");
        };


        const writeText = function (text, color) {
            ctx.fillStyle = color;
            ctx.font = "18px sans-serif";

            //Adjust for offset between canvas text render and DOM style properties
            ctx.fillText(text.value, text.x - worldCoords.x, text.y + fontSize - 1 - worldCoords.y);
        };

        const drawGrid = function () {

            const minorGridColor = "#f8f8f8";
            const majorGridColor = "#f7f7f7";
            // let i = gridSize - worldCoords.x%gridSize;
            let majorGridSize = gridSize*5;
            let i = gridSize - floorMod(worldCoords.x, gridSize);
            let j = gridSize - floorMod(worldCoords.y,gridSize);

            let ii = i;
            ctx.beginPath();
            while (ii <= width) {
                ctx.moveTo(ii, 0);
                ctx.lineTo(ii, height);
                ii += gridSize;
            }

            let jj = j;
            while (jj <= height) {
                ctx.moveTo(0, jj);
                ctx.lineTo(width, jj);
                jj += gridSize;
            }

            ctx.lineWidth = 2;
            ctx.strokeStyle = minorGridColor;
            ctx.stroke();

            //Major gridlines

            i = majorGridSize - floorMod(worldCoords.x, majorGridSize);
            j = majorGridSize - floorMod(worldCoords.y, majorGridSize);

            ii = i;            
            ctx.beginPath();
            while (ii <= width) {
                ctx.moveTo(ii, 0);
                ctx.lineTo(ii, height);
                ii += majorGridSize;
            }

            jj = j;
            while (jj <= height) {
                ctx.moveTo(0, jj);
                ctx.lineTo(width, jj);
                jj += majorGridSize;
            }
            ctx.lineWidth = 3;
            ctx.strokeStyle = majorGridSize;
            ctx.stroke();
        };

        //Public 
        return {
            canvas: canvas,
            setDims: setDims,
            writeText: writeText,
            clear: clear,
            drawGrid: drawGrid
        };
    })();

    Canvas.setDims(window.innerWidth, window.innerHeight);

    const Events = (function () {

        const InputField = (function () {

            const element = document.createElement('input');

            var x = 0,
                y = 0;

            const setX = newX => {
                x = newX;
                element.style.left = `${x}px`;
            }

            const setY = newY => {
                y = newY;
                element.style.top = `${y}px`;
            }

            const setPosition = (newX, newY) => {
                setX(newX);
                setY(newY);
            };

            const hide = function () {
                log("calling hide")
                element.classList.add("hidden");
            };

            const unhide = function () {
                log("calling unhide")
                element.classList.remove("hidden");
            };

            const focus = () => element.focus();
            const unfocus = () => element.blur();

            element.classList.add("TextInput");
            document.querySelector(".canvas-wrapper").appendChild(element);
            hide();

            return {
                element: element,
                setPosition: setPosition,
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

        const inputBlurHandler = function (e) {
            log('input blurred');
            InputField.element.value = '';
            InputField.hide();
        };

        const inputKeypressHandler = function (e) {
            if (e.code === 'Enter') {
                //console.log(this.value);
                let textObj = createText(InputField.x + worldCoords.x, InputField.y + worldCoords.y, InputField.value);
                SocketIO.sendText(textObj);
                InputField.unfocus();
                //callback(textObj);
            }
        };

        // inputField.addEventListener("change", (e) => {
        //     this.value = e.target.value;
        // });
        InputField.element.addEventListener("blur", inputBlurHandler);
        InputField.element.addEventListener("keypress", inputKeypressHandler);


        const canvasClickHandler = function (e) {
            let x = e.pageX;
            let y = e.pageY;

            InputField.setPosition(x, y);
            InputField.unhide();
            InputField.focus();

        };


        let dx = 0,
            dy = 0,
            px = 0,
            py = 0,
            wx = 0,
            wy = 0;

        let dist = 0;
        let drag = false;
        const delta = 81;

        const canvasMousemoveHandler = function (e) {
            let cx = e.pageX,
                cy = e.pageY;

            dx = cx - px;
            dy = cy - py;

            dist = dx * dx + dy * dy;

            if (dist > delta) {
                drag = true;
                worldCoords.setX(wx - dx);
                worldCoords.setY(wy - dy);
                document.getElementById("coord-indicator").textContent = `x: ${worldCoords.x}, y: ${worldCoords.y}`;
            }
            else
                drag = false;
        };

        const canvasMousedownHandler = function (e) {
            px = e.pageX;
            py = e.pageY;
            wx = worldCoords.x;
            wy = worldCoords.y;
            drag = false;
            Canvas.canvas.addEventListener("mousemove", canvasMousemoveHandler);
        };

        const canvasMouseupHandler = function (e) {
            Canvas.canvas.removeEventListener("mousemove", canvasMousemoveHandler);
            if (drag) {
                /* -- */
            }
            else {
                canvasClickHandler(e);
            }
        };

        Canvas.canvas.addEventListener("mousedown", canvasMousedownHandler);
        Canvas.canvas.addEventListener("mouseup", canvasMouseupHandler);

        window.addEventListener("resize", () => {
            Canvas.setDims(window.innerWidth,window.innerHeight);
        });
        //Canvas.canvas.addEventListener("click", canvasClickHandler);

        //App



        return {
            // get texts() {
            //     return inputs;
            // }
        };

    })();


    const Renderer = (function () {

        var iid;
        const fps = 60;
        const rate = 1 / fps;
        const fadeDelta = 300;

        const draw = function (time) {
            Canvas.drawGrid();
            texts.forEach((text) => {
                let textObj = text.data;
                let dTime = time - textObj.timestamp;
                let color = `rgba(0,0,0,${dTime < textObj.persistTime ? 1.0 : Math.max(0, fadeDelta - (dTime - textObj.persistTime)) / fadeDelta})`;
                Canvas.writeText(textObj, color);
            });
        }

        const step = function () {
            let now = Date.now();
            Canvas.clear();
            draw(now);
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

    Renderer.start();

    const SocketIO = (function () {
        const socket = io("http://192.168.1.226:9001");
        console.log(socket);

        socket.on('textupdate', (data) => {
            texts = data;
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

    //Public
    return {
        start: Renderer.start,
        stop: Renderer.stop
    };
})();