import { fabric } from 'fabric';

let id = 0;

class Figure {
    // constructor()
}

class RectFigure extends Figure {
    constructor(options) {
        super(options);
        this.id = id++;
        this.left = options.left || 0;
        this.top = options.top || 0;
        this.width = options.width || 0;
        this.height = options.height || 0;
        this.strokeWidth = options.strokeWidth || 3;
        this.fill = options.fill || 'blue';
        this.stroke = options.stroke || 'black';
        this.figure = new fabric.Rect({
            left: this.left,
            top: this.top,
            width: this.width,
            height: this.height,
            strokeWidth: this.strokeWidth,
            fill: this.fill,
            stroke: this.stroke
        });
    }

}

export { RectFigure };