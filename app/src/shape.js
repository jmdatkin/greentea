class Shape {
    constructor() {}
}


class QuadShape extends Shape {
    constructor(x,y,w,h) {
        super();
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    draw(ctx) {
        ctx.strokeStyle = 'black';
        ctx.fillStyle = 'white';
        ctx.lineCap = "butt";
        ctx.lineWidth = 3;
        ctx.strokeRect(
            this.x, this.y, this.w, this.h
        );
        ctx.fillRect(this.x,this.y,this.w,this.h);
    }
}

export { QuadShape };