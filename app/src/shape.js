import Store from './store';

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

        let z = Store.store.z;

        let nx = this.x/z;
        let ny = this.y/z;
        let nw = this.w/z;
        let nh = this.h/z;

        ctx.strokeRect(
           nx,ny,nw,nh 
        );
        // ctx.fillRect(this.x,this.y,this.w,this.h);
        ctx.fillRect(nx,ny,nw,nh);
    }
}

export { QuadShape };