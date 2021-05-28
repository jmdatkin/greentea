import { $, $$, floorMod } from './util';
import settings from './settings';
import Coords from './coords';
import ievent from './ievent';
import Camera from './camera';

const Canvas = (function (camera,inputField) {
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

    const Paint = {
        drawGrid: function (size) {
            // coords.transform(createAffineTransform(coords.coords, coords.z));
            let tx = coords.x;
            let ty = coords.y;
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
        },

        drawAdaptiveGrid: function () {
            // const minorColor = "#e5e5e5";
            // const majorColor = "#dfdfdf";

            let tx = coords.x;//(WorldCoords.x*(a-WorldCoords.z))/a;
            let ty = coords.y;//(WorldCoords.y*(a-WorldCoords.z))/a;
            let tz = coords.z;


            let b = 50;
            let c = 10;

            while (tz >= c)
                tz /= c;

            const scaleAlpha = (a, z) => a * (c - z) / c;
            const scaleAlpha2 = (a, z) => 0.5 * a * Math.log10(50 - z);
            const scaleAlpha3 = (a, z) => {
                let t = (Math.tanh((c - z) / b) + 1) / 2;
                return a * t;
            };


            const baseMinorAlpha = 0.45;
            const scaledMinorAlpha = scaleAlpha3(baseMinorAlpha, tz);

            // console.log(scaledMinorAlpha);

            const minorColor = `rgba(1.0, 1.0, 1.0, ${scaledMinorAlpha})`;


            const baseMajorAlpha = 0.5;
            const scaledMajorAlpha = scaleAlpha3(baseMajorAlpha, tz * 5);

            const majorColor = `rgba(1.0, 1.0, 1.0, ${scaledMajorAlpha})`;

            let a = 1.0;

            let scaledGridSize = gridSize / coords.z;
            let majorGridSize = scaledGridSize * 5;
            let majorMajorGridSize = majorGridSize * 5;

            if (majorGridSize <= gridSize) {
                scaledGridSize *= 5;
                majorGridSize *= 5;
                majorMajorGridSize *= 5;
            }

            ctx.lineWidth = 1;
            ctx.strokeStyle = minorColor;
            this.drawGrid(scaledGridSize);

            ctx.lineWidth = 1;
            ctx.strokeStyle = majorColor;
            this.drawGrid(majorGridSize);

            ctx.lineWidth = 1;
            ctx.strokeStyle = majorColor;
            this.drawGrid(majorMajorGridSize);
        },


        drawText: function (text, color) {
            let thisCoords = new Coords(text.x, text.y, text.z);
            let shiftedCameraCoords = new Coords(camera.coords.x - camera.midpoint.x, camera.coords.y - camera.midpoint.y, camera.coords.z);

            let cameraTransform = camera.getPerspectiveMatrix();//shiftedCameraCoords.getTransformMatrix();

            thisCoords.applyTransform(cameraTransform);            
                       
            // ctx.textBaseline = "bottom";
            ctx.fillStyle = color;
            let thisFontSize = settings.fontSize*(camera.coords.z/text.z);
            ctx.font = `${thisFontSize}px ${settings.fontFace}`;

            //Adjust for offset between canvas text render and DOM style properties
            ctx.fillText(text.value, thisCoords.x, thisCoords.y + fontSize - 2);
        },


        clear: function () {
            ctx.clearRect(0, 0, width, height);
        }
    };


    window.addEventListener("resize", () => resize(window.innerWidth, window.innerHeight));



    canvas.addEventListener("wheel", function (e) {
        coords.z = Math.max(0, coords.z + e.deltaY / 1000);
        $("#coord-indicator").textContent = `x: ${coords.x / 5}, y: ${coords.y / 5}, z: ${coords.z / 5}`;
    });


    return {
        canvas: canvas,
        width: width,
        height: height,
        resize: resize,
        Paint: Paint
    };
})(Camera);

export default Canvas;