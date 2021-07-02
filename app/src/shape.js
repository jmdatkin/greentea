import Store from './store';
import { utop } from './util';

class Shape {
    constructor() { }
}


class QuadShape extends Shape {
    constructor(x, y, w, h) {
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

        let tx = this.x,
            ty = this.y,
            tw = this.w,
            th = this.h;


        
        tx += tx/Store.store.z;
        ty += ty/Store.store.z;


        // tx += Store.store.x*Store.store.z;
        // ty += Store.store.y*Store.store.z;

 //       let ratio = Object.z/Store.store.z;
 //     tx *= ratio;

        // tx /= Store.store.z;
        // ty /= Store.store.z;
        // tw /= Store.store.z;
        // th /= Store.store.z;

        // tx -= Store.store.x*Store.store.z;
        // ty -= Store.store.y*Store.store.z;



        tx = utop(tx);
        ty = utop(ty);
        tw = utop(tw);
        th = utop(th);

        ctx.strokeRect(
            tx, ty, tw, th
        );
        // ctx.fillRect(this.x,this.y,this.w,this.h);
        ctx.fillRect(tx, ty, tw, th);
    }
}

export { QuadShape };