const mongoose = require('mongoose');
const shapeModel = require('./_shapeModel');

const rectSchema = new mongoose.Schema({
    shapeType: {
        type: String,
        default: 'rect'
    },
    x: Number,
    y: Number,
    w: Number,
    h: Number
});

const Rect = shapeModel.discriminator('Rect', rectSchema);

module.exports = Rect;