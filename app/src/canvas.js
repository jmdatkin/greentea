import { $, $$, floorMod, utop, ptou } from './util';
import settings from './settings';
import Vector from './vector';
import Camera from './camera';
import Store from './store';
import { QuadShape } from './shape';

const Canvas = (function (camera) {
    const canvas = $("#main-canv");
    const ctx = canvas.getContext("2d");

    let width = 1600;
    let height = 900;

    const coords = camera.coords;

    const unitSize = settings.unitSize;
    const fontSize = settings.fontSize;
    const fontFace = settings.fontFace;

    const resize = function (w, h) {
        width = w;
        height = h;
        canvas.width = width;
        canvas.height = height;
    };

    //size: size in pixels of each box
    const drawGrid = function (store, size) {
        let tx = utop(store.x/store.z);
        let ty = utop(store.y/store.z);
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


        let scaledUnitSize = unitSize / tz;
        let majorUnitSize = scaledUnitSize * 5;
        let majorMajorUnitSize = majorUnitSize * 5;

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


        if (majorUnitSize <= unitSize) {
            scaledUnitSize *= 5;
            majorUnitSize *= 5;
            majorMajorUnitSize *= 5;
        }

        ctx.lineWidth = 1;
        ctx.strokeStyle = minorColor;
        drawGrid(store, scaledUnitSize);

        ctx.lineWidth = 1;
        ctx.strokeStyle = majorColor;
        drawGrid(store, majorUnitSize);

        ctx.lineWidth = 1;
        ctx.strokeStyle = mMajorColor;
        drawGrid(store, majorMajorUnitSize);
    };


    const drawText = function (text, color) {
        ctx.fillStyle = color;
        let thisFontSize = settings.fontSize / camera.coords.z;
        ctx.font = `${thisFontSize}px ${settings.fontFace}`;

        //Adjust for offset between canvas text render and DOM style properties
        ctx.fillText(text.value, text.x - coords.x, text.y + fontSize - 2 - coords.y);
    };

    const drawShapes = function(store) {
        if (typeof store.shapeData === 'undefined') return -1;
        store.shapeData.shapes.forEach((val) => {
            let {x,y,w,h} = val.data;
            let newShape = new QuadShape(x,y,w,h);
            newShape.draw(ctx);
        });
    }


    const clear = function () {
        ctx.clearRect(0, 0, width, height);
    };


    window.addEventListener("resize", () => {
        resize(window.innerWidth, window.innerHeight);
        Store.publish('view-move');
    });


    Store.subscribe('shapeUpdate', function(store) {
        drawShapes(store);
    });

    canvas.addEventListener("wheel", function (e) {
        let delta = Math.max(-1,Math.min(e.deltaY,1));    //Cap delta for x-browser consistency

        let {x,y,z} = Store.store;

        let [cx, cy] = [ptou(e.pageX), ptou(e.pageY-canvas.offsetTop)];      //Mouse cursor position

        //Model to rendered position
        cx = cx*z + x;
        cy = cy*z + y;


        let dz = delta*z/20;                                //Change in z

        let z2 = Math.max(settings.minZoom,Math.min(z + dz, settings.maxZoom));

        /*  https://github.com/cytoscape/cytoscape.js/blob/unstable/src/core/viewport.js  */
        let tx = -z2 / z * (cx - x) + cx;
        let ty = -z2 / z * (cy - y) + cy;



        Store.publish("view-move", {
            x: tx,
            y: ty,
            z: z2
        });

    });

    Store.subscribe("view-move", function (store) {
        clear();
        drawAdaptiveGrid(store);
        drawShapes(store);
        // ctx.beginPath();
        // ctx.arc(utop(Store.virtual.x_mid),utop(Store.virtual.y_mid),15,0,2*Math.PI);
        // ctx.closePath();
        // ctx.fillStyle = 'black';
        // ctx.fill();
    });

    Store.subscribe("shape-draw-progress", function(store) {
        clear();
        drawAdaptiveGrid(store);
        drawShapes(store);


        store.tempShape.draw(ctx);

        // let nx = (store.tempShape.x - Store.store.x)/50;
        // let ny = (store.tempShape.y - Store.store.y)/50;
        // let myNewShape = new QuadShape(nx,ny,store.tempShape.w,store.tempShape.h);
        // myNewShape.draw(ctx);
        // store.tempShape.draw(ctx);
    });

    return {
        canvas: canvas,
        width: width,
        height: height,
        resize: resize,
    };
})(Camera);

export default Canvas;