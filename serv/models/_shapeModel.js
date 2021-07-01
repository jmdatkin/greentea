const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    shapeType: String,
    date: {
        type: Date,
        default: Date.now
    }
});

const Shape = mongoose.model('Shape', schema);

module.exports = Shape;