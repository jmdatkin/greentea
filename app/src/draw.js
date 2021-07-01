const drawGrid = function (ctx,size) {
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
};

const drawAdaptiveGrid = function (ctx) {
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
    this.drawGrid(ctx, scaledGridSize);

    ctx.lineWidth = 1;
    ctx.strokeStyle = majorColor;
    this.drawGrid(ctx, majorGridSize);

    ctx.lineWidth = 1;
    ctx.strokeStyle = majorColor;
    this.drawGrid(ctx, majorMajorGridSize);
};


const drawText = function (ctx, text, color) {
    ctx.fillStyle = color;
    let thisFontSize = settings.fontSize / camera.coords.z;
    ctx.font = `${thisFontSize}px ${settings.fontFace}`;

    //Adjust for offset between canvas text render and DOM style properties
    ctx.fillText(text.value, text.x - coords.x, text.y + fontSize - 2 - coords.y);
};


const clear = function (ctx) {
    ctx.clearRect(0, 0, width, height);
};

export { drawGrid, drawText, clear };