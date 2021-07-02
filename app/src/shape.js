import Store from './store';
import Transform from './transform';
import { ptou, utop } from './util';

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


        tx += Store.store.x;
        ty += Store.store.y;
        
        tx /= -Store.store.z;
        ty /= -Store.store.z;
        tw /= Store.store.z;
        th /= Store.store.z;


        tx = utop(tx);//mulVec[0]);
        ty = utop(ty);//mulVec[1]);
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