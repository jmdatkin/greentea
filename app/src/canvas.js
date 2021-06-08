import { $, $$, floorMod } from './util';
import settings from './settings';
import Vector from './vector';
import Camera from './camera';
import Store from './store';

const Canvas = (function (camera) {
    const canvas = $("#main-canv");
    const ctx = canvas.getContext("2d");

    let width = 1600;
    let height = 900;

    const coords = camera.coords;

    const gridSize = settings.gridSize;
    const fontSize = settings.fontSize;
    const fontFace = settings.fontFace;

    const resize = function (w, h) {
        width = w;
        height = h;
        canvas.width = width;
        canvas.height = height;
    };

    const drawGrid = function (store, size) {
        let tx = store.x;
        let ty = store.y;
        let i = size - floorMod(tx, size);
        let j = size - floorMod(ty, size);

        let ii = i;
        ctx.beginPath();
        while (ii <= width) {             //Vertical lines
            ctx.moveTo(ii, 0);
            ctx.lineTo(ii, height);
            ii += size;
        }

        let jj = j;
        while (jj <= height) {
            ctx.moveTo(0, jj);
            ctx.lineTo(width, jj);
            jj += size;
        }
        ctx.stroke();
    };

    const drawAdaptiveGrid = function (store) {
        // const minorColor = "#e5e5e5";
        // const majorColor = "#dfdfdf";

        let tx = store.x;
        let ty = store.y;
        let tz = store.z;


        let b = 50;
        let c = 10;

        while (tz >= c)
            tz /= c;

        const scaleAlpha = (a, z) => a * (c - z) / c;
        // const scaleAlpha2 = (a, z) => 0.5 * a * Math.log10(50 - z);
        // const scaleAlpha3 = (a, z) => {
        //     let t = (Math.tanh((c - z) / b) + 1) / 2;
        //     return a * t;
        // };


        const baseMinorAlpha = 0.45;
        const scaledMinorAlpha = scaleAlpha(baseMinorAlpha, tz);


        const minorColor = `rgba(1.0, 1.0, 1.0, ${scaledMinorAlpha})`;


        const baseMajorAlpha = 0.5;
        const scaledMajorAlpha = scaleAlpha(baseMajorAlpha, tz * 5);

        const majorColor = `rgba(1.0, 1.0, 1.0, ${scaledMajorAlpha})`;

        let a = 1.0;

        let scaledGridSize = gridSize / tz;
        let majorGridSize = scaledGridSize * 5;
        let majorMajorGridSize = majorGridSize * 5;

        if (majorGridSize <= gridSize) {
            scaledGridSize *= 5;
            majorGridSize *= 5;
            majorMajorGridSize *= 5;
        }

        ctx.lineWidth = 1;
        ctx.strokeStyle = minorColor;
        drawGrid(store, scaledGridSize);

        ctx.lineWidth = 1;
        ctx.strokeStyle = majorColor;
        drawGrid(store, majorGridSize);

        ctx.lineWidth = 1;
        ctx.strokeStyle = majorColor;
        drawGrid(store, majorMajorGridSize);
    };


    const drawText = function (text, color) {
        ctx.fillStyle = color;
        let thisFontSize = settings.fontSize / camera.coords.z;
        ctx.font = `${thisFontSize}px ${settings.fontFace}`;

        //Adjust for offset between canvas text render and DOM style properties
        ctx.fillText(text.value, text.x - coords.x, text.y + fontSize - 2 - coords.y);
    };


    const clear = function () {
        ctx.clearRect(0, 0, width, height);
    };


    window.addEventListener("resize", () => resize(window.innerWidth, window.innerHeight));



    canvas.addEventListener("wheel", function (e) {
        let dz = e.deltaY / 1000;//Math.max(0, coords.z + e.deltaY / 1000);

        let s = 100;


        let dx = e.pageX / (s * dz);
        let dy = e.pageY / (s * dz);

        // camera.coords.x += dx;
        // camera.coords.y += dy;
        // camera.coords.z = Math.max(0, coords.z + dz);
        Store.publish("view-move", {
            z: Math.max(0, Store.store.z + dz)
        });

        $("#coord-indicator").textContent = `x: ${coords.x}, y: ${coords.y}, z: ${coords.z}`;
    });

    Store.subscribe("view-move", function (store) {
        clear();
        drawAdaptiveGrid(store);
    });

    Store.subscribe("shape-draw-progress", function(store) {
        clear();
        drawAdaptiveGrid(store);
        store.tempShape.draw(ctx);
    });

    return {
        canvas: canvas,
        width: width,
        height: height,
        resize: resize,
    };
})(Camera);

export default Canvas;