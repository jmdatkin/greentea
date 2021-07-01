import { $, $$, floorMod, lerp } from './util';
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

        let modSize = 5;

        while (tz >= modSize)
            tz /= modSize;


        let scaledGridSize = gridSize / tz;
        let majorGridSize = scaledGridSize * 5;
        let majorMajorGridSize = majorGridSize * 5;

        const scaleAlpha = (a, z, c) => 0.15*((c - z) / c);

        const baseMinorAlpha = 0.45;
        const scaledMinorAlpha = scaleAlpha(baseMinorAlpha, tz, modSize);


        const minorColor = `rgba(1.0, 1.0, 1.0, ${scaledMinorAlpha})`;

        const baseMajorAlpha = 0.5;
        const scaledMajorAlpha = scaleAlpha(baseMajorAlpha, tz, modSize*2);

        const majorColor = `rgba(1.0, 1.0, 1.0, ${scaledMajorAlpha})`;


        const baseMMajorAlpha = 0.65;
        const scaledMMajorAlpha = scaleAlpha(baseMMajorAlpha, tz, modSize*3);

        const mMajorColor = `rgba(1.0, 1.0, 1.0, ${scaledMMajorAlpha})`;

        let a = 1.0;


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
        ctx.strokeStyle = mMajorColor;
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


    window.addEventListener("resize", () => {
        resize(window.innerWidth, window.innerHeight);
        Store.publish('view-move');
    });

    canvas.addEventListener("wheel", function (e) {
        let delta = Math.max(-1,Math.min(e.deltaY,1));    //Cap delta for x-browser consistency
        let z = Store.store.z;
        let dz = delta*z/20;


        let dx = (e.pageX + Store.store.x)/z;
        let dy = (e.pageY + Store.store.y)/z;

        let scale = Math.max(settings.minZoom,Math.min(z + dz, settings.maxZoom));

        dx = e.pageX + 2*Store.store.x - scale*dx;  //Dont exactly know why this works but 2*Store.store.x is the correct measurement
        dy = e.pageY + 2*Store.store.y - scale*dy;

        Store.publish("view-move", {
            x: dx,
            y: dy,
            z: lerp(z,scale,0.35)
        });

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