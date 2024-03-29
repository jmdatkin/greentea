import { $, $$, floorMod, utop, ptou } from './util';
import settings from './settings';
import { fabric } from 'fabric';
import Vector from './vector';
import Camera from './camera';
import Store from './store';
import { QuadShape } from './shape';

const Canvas = (function (camera) {

    // fabric.Object.prototype.objectCaching = false;
    fabric.Object.prototype.set({
        cornerColor: 'white',
        transparentCorners: false,
        cornerSize: 6,
        cornerStrokeColor: 'black',
        objectCaching: false,
        strokeUniform: true,
        strokeWidth: 2,
    });


    const gridCanvas = $('#grid-canv');
    const ctx = gridCanvas.getContext('2d');
    const canvas = new fabric.Canvas('main-canv');


    canvas.set({
        uniformScaling: false,
        moveCursor: 'none'
    })
    // canvas.uniformScaling = false;

    // const canvas = $("#main-canv");
    // const ctx = canvas.getContext("2d");

    let width = 1600;
    let height = 900;


    const unitSize = settings.unitSize;
    const fontSize = settings.fontSize;
    const fontFace = settings.fontFace;

    const resize = function (w, h) {
        width = w;
        height = h;
        gridCanvas.width = width;
        gridCanvas.height = height;
        canvas.setWidth(width); //FabricJS
        canvas.setHeight(height);
    };


    let testSquare = new fabric.Rect({
        left: 0,
        top: 0,
        width: 100,
        height: 100,
        fill: 'green',
        stroke: 'black',
        strokeWidth: 5
    });

    canvas.add(testSquare);

    //size: size in pixels of each box
    const drawGrid = function (store, size) {
        let tx = utop(store.x/store.z);
        let ty = utop(store.y/store.z);
        let i = size - floorMod(tx, size);
        let j = size - floorMod(ty, size);

        let ii = i;
        ctx.beginPath();
        while (ii <= width) {             //Vertical lines
            ctx.moveTo(ii, 0)
            ctx.lineTo(ii, height);
            ii += size;
        }

        let jj = j;
        while (jj <= height) {
            ctx.moveTo(0,jj);
            ctx.lineTo(width,jj);
            jj += size;
        }
        ctx.stroke();
    };

    const drawAdaptiveGrid = function (store) {
        ctx.clearRect(0,0,width,height);
        let tx = store.x;
        let ty = store.y;
        let tz = store.z;

        let modSize = 5;

        // tz = Math.log(tz)/Math.log(modSize);
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

    const drawShapes = function(store) {
        if (typeof store.shapeData === 'undefined') return -1;
        store.shapeData.shapes.forEach((val) => {
            let {x,y,w,h} = val.data;
            let newShape = new fabric.Rect({
                left: x,
                top: y,
                fill: 'black',
                width: w,
                height: h
            });
            canvas.add(newShape);
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
        // drawShapes(store);
    });

    canvas.on('mouse:wheel', function(opt) {
        let delta = Math.max(-1,Math.min(opt.e.deltaY,1));    //Cap delta for x-browser consistency

        let {x,y,z} = Store.store;

        let [cx, cy] = [ptou(opt.e.offsetX), ptou(opt.e.offsetY)];      //Mouse cursor position

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
        let scaleFactor = 1/store.z;
        canvas.viewportTransform[0] = scaleFactor;
        canvas.viewportTransform[3] = scaleFactor;
        canvas.viewportTransform[4] = utop(-store.x)/store.z;
        canvas.viewportTransform[5] = utop(-store.y)/store.z;

        testSquare.setCoords();

        render();
    });

    Store.subscribe("shape-draw-progress", function(store) {
        render();
        store.tempShape.draw(ctx);

    });

    const render = function() {
        drawAdaptiveGrid(Store.store);
        canvas.renderAll();
    };

    return {
        canvas: canvas,
        width: width,
        height: height,
        resize: resize,
    };
})(Camera);

export default Canvas;