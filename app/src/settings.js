const settings = {
    unitSize: 50,
    fontSize: 32,
    minZoom: 0.25,
    maxZoom: 1200,
    fontFace: 'Veranda, sans-serif',
    colors: {
        "black": {
            r: 0,
            b: 0,
            g: 0,
        },
        "red": {
            r: 236,
            g: 35,
            b: 35
        },
        "orange": {
            r: 215,
            g: 140,
            b: 45
        },
        "green": {
            r: 47,
            g: 232,
            b: 21
        },
        "blue": {
            r: 0,
            g: 195,
            b: 255
        },
        "purple": {
            r: 131,
            g: 0,
            b: 221
        },
        toRGB: function (c) {
            let obj = this[c];
            return `rgb(${obj.r},${obj.g},${obj.b})`;
        },
        toRGBA: function (c, a) {
            let obj = this[c];
            return `rgba(${obj.r},${obj.g},${obj.b},${a})`;
        }
    },
    developmentMode: true
};

export default settings;