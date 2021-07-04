
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
};

const MainCanvasOpts = {
    uniformScaling: false,
    moveCursor: 'none',
    selectionColor: 'rgba(1.0,1.0,1.0,0.01)',
    selectionBorderColor: 'rgba(1.0,1.0,1.0,0.5)',
    selectionLineWidth: 1,
    selectionDashArray: [7, 5]
};

const BindMainCanvas = function (main_canvas) {
    MainCanvas = main_canvas;
};

const BindGridCanvas = function (grid_canvas) {
    GridCanvas = grid_canvas;
};

const BindEvents = function () {
    window.addEventListener("resize", () => {
        console.log('resize');
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

const scaleAlpha = (a, z, c) => 0.15 * ((c - z) / c);
const getAlphaString = alpha => `rgba(0,0,0,${alpha})`;

const drawAdaptiveGrid = function (store, ctx) {
    let tz = store.z;

    let modSize = 5;

    while (tz >= modSize)
        tz /= modSize;


    let scaledUnitSize = unitSize / tz;
    let majorUnitSize = scaledUnitSize * 5;
    let majorMajorUnitSize = majorUnitSize * 5;


    const baseMinorAlpha = 0.45;
    const scaledMinorAlpha = scaleAlpha(baseMinorAlpha, tz, modSize);
    const minorColor = getAlphaString(scaledMinorAlpha);

    const baseMajorAlpha = 0.5;
    const scaledMajorAlpha = scaleAlpha(baseMajorAlpha, tz, modSize * 2);
    const majorColor = getAlphaString(scaledMajorAlpha);

    const baseMMajorAlpha = 0.65;
    const scaledMMajorAlpha = scaleAlpha(baseMMajorAlpha, tz, modSize * 3);
    const mMajorColor = getAlphaString(scaledMMajorAlpha);


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

const clear = function(canv) {
    canv.getContext('2d').clearRect(0,0,canv.width,canv.height);
};


const render = function () {
    drawAdaptiveGrid(Store.store);
    MainCanvas.renderAll();
};

const Core = {
    BindMainCanvas: BindMainCanvas,
    BindGridCanvas: BindGridCanvas,
    Init: Init,
    drawAdaptiveGrid: drawAdaptiveGrid,
    clear: clear
};

export default Core;