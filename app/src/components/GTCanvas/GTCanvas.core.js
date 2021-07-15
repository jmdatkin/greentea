
import { $, $$, floorMod, utop, ptou } from '../../util/util';
import settings from '../../settings';
import { fabric } from 'fabric';

let MainCanvas, GridCanvas;

const FabricOpts = {
    cornerColor: 'white',
    transparentCorners: false,
    cornerSize: 6,
    cornerStrokeColor: 'black',
    objectCaching: false,
    strokeUniform: true,
    strokeWidth: 2,
    snapAngle: 15
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

    // BindEvents();
    // MainCanvas.add(testSquare);
};

let width = 1600,
    height = 900;



const resizeMain = function(w,h) {
    MainCanvas.setWidth(w);
    MainCanvas.setHeight(h);
};

const resizeGrid = function(w,h) {
    GridCanvas.width = w
    GridCanvas.height = h
}

const resize = function (w, h) {
    width = w;
    height = h;
    resizeMain(w,h);
    resizeGrid(w,h);
    // MainCanvas.setWidth(width); //FabricJS
    // MainCanvas.setHeight(height);
    // GridCanvas.width = width;
    // GridCanvas.height = height;
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

const drawAdaptiveGrid = function (coords) {
    let tz = coords.z;
    let ctx = GridCanvas.getContext('2d');

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

    ctx.strokeStyle = minorColor;
    drawGrid(coords, scaledUnitSize);

    ctx.strokeStyle = majorColor;
    drawGrid(coords, majorUnitSize);

    ctx.strokeStyle = mMajorColor;
    drawGrid(coords, majorMajorUnitSize);

};

const clearGridCanvas = function () {
    GridCanvas.getContext('2d').clearRect(0, 0, GridCanvas.width, GridCanvas.height);
};

const zoomFromPos = function (coords, pos, zoom) {
    let { x, y, z } = coords;
    let [ cx, cy ] = [pos.x, pos.y];

    //Model to rendered position
    cx = cx * z + x;
    cy = cy * z + y;

    let dz = zoom * z / 20;                                //Change in z

    let tz = Math.max(settings.minZoom, Math.min(z + dz, settings.maxZoom));

    /*  https://github.com/cytoscape/cytoscape.js/blob/unstable/src/core/viewport.js  */
    let tx = -tz / z * (cx - x) + cx;
    let ty = -tz / z * (cy - y) + cy;
    
    return {
        x: tx,
        y: ty,
        z: tz
    };
};

const setMainCanvasViewportTransform = function(coords) {
    let scaleFactor = 1/coords.z;
    MainCanvas.viewportTransform[0] = scaleFactor;
    MainCanvas.viewportTransform[3] = scaleFactor;
    MainCanvas.viewportTransform[4] = utop(-coords.x) / coords.z;
    MainCanvas.viewportTransform[5] = utop(-coords.y) / coords.z;
};


const Main = {
    bind: BindMainCanvas,
    resize: resizeMain,
    setViewportTransform: setMainCanvasViewportTransform
};

const Grid = {
    bind: BindGridCanvas,
    resize: resizeGrid,
    draw: drawAdaptiveGrid,
    clear: clearGridCanvas
};

const Core = {
    // Main: {
    //     bind: BindMainCanvas,
    //     setViewportTransform: setMainCanvasViewportTransform
    // },
    // Grid: {
    //     bind: BindGridCanvas,
    //     draw: drawAdaptiveGrid
    // },
    Main: Main,
    Grid: Grid,
    BindMainCanvas: BindMainCanvas,
    BindGridCanvas: BindGridCanvas,
    Init: Init,
    drawAdaptiveGrid: drawAdaptiveGrid,
    zoomFromPos: zoomFromPos,
    resize: resize,
    // clear: clear
};

export default Core;