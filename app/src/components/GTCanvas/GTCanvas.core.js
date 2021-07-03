
import { $, $$, floorMod, utop, ptou } from '../../util/util';
import settings from '../../settings';
import { fabric } from 'fabric';

let Store = {};
let MainCanvas, GridCanvas;

const FabricOpts = {
    cornerColor: 'white',
    transparentCorners: false,
    cornerSize: 6,
    cornerStrokeColor: 'black',
    objectCaching: false,
    strokeUniform: true,
    strokeWidth: 2,
}

const MainCanvasOpts = {
    uniformScaling: false,
    moveCursor: 'none'
};

const BindMainCanvas = function (main_canvas) {
    MainCanvas = main_canvas;
};

const BindGridCanvas = function (grid_canvas) {
    GridCanvas = grid_canvas;
};

const BindEvents = function () {
    window.addEventListener("resize", () => {
        resize(window.innerWidth, window.innerHeight);
    });
};

const Init = function () {
    fabric.Object.prototype.set(FabricOpts);
    MainCanvas.set(MainCanvasOpts);

    resize(window.innerWidth, window.innerHeight);

    BindEvents();
    // MainCanvas.add(testSquare);
};

let width = 1600,
    height = 900;

const resize = function (w, h) {
    width = w;
    height = h;
    MainCanvas.setWidth(width); //FabricJS
    MainCanvas.setHeight(height);
    GridCanvas.width = width;
    GridCanvas.height = height;
};



const unitSize = settings.unitSize;
const fontSize = settings.fontSize;
const fontFace = settings.fontFace;
//size: size in pixels of each box
const drawGrid = function (store, size) {
    let ctx = GridCanvas.getContext("2d");
    let tx = utop(store.x / store.z);
    let ty = utop(store.y / store.z);
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
        ctx.moveTo(0, jj);
        ctx.lineTo(width, jj);
        jj += size;
    }
    ctx.stroke();
};

const drawAdaptiveGrid = function (store, ctx) {
    ctx.clearRect(0, 0, width, height);
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

    const scaleAlpha = (a, z, c) => 0.15 * ((c - z) / c);

    const baseMinorAlpha = 0.45;
    const scaledMinorAlpha = scaleAlpha(baseMinorAlpha, tz, modSize);


    const minorColor = `rgba(1.0, 1.0, 1.0, ${scaledMinorAlpha})`;

    const baseMajorAlpha = 0.5;
    const scaledMajorAlpha = scaleAlpha(baseMajorAlpha, tz, modSize * 2);

    const majorColor = `rgba(1.0, 1.0, 1.0, ${scaledMajorAlpha})`;


    const baseMMajorAlpha = 0.65;
    const scaledMMajorAlpha = scaleAlpha(baseMMajorAlpha, tz, modSize * 3);

    const mMajorColor = `rgba(1.0, 1.0, 1.0, ${scaledMMajorAlpha})`;

    let a = 1.0;


    if (majorUnitSize <= unitSize) {
        scaledUnitSize *= 5;
        majorUnitSize *= 5;
        majorMajorUnitSize *= 5;
    }

    ctx.lineWidth = 1;
    ctx.strokeStyle = minorColor;
    drawGrid(store, scaledUnitSize, ctx);

    ctx.lineWidth = 1;
    ctx.strokeStyle = majorColor;
    drawGrid(store, majorUnitSize, ctx);

    ctx.lineWidth = 1;
    ctx.strokeStyle = mMajorColor;
    drawGrid(store, majorMajorUnitSize, ctx);

};




const render = function () {
    drawAdaptiveGrid(Store.store);
    MainCanvas.renderAll();
};

const Core = {
    BindMainCanvas: BindMainCanvas,
    BindGridCanvas: BindGridCanvas,
    Init: Init,
    drawAdaptiveGrid: drawAdaptiveGrid
};

export default Core;