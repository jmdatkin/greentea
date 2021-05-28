import { vec2, vec3, vec4, mat4 } from './gl-matrix';

export default class Coords {
    constructor(x, y, z) {
        let p = x || 0;
        let q = y || 0;
        let r = z || 0;
        this.vector = vec4.fromValues(p, q, r, 1);
    }

    get x() { return this.vector[0]; }
    get y() { return this.vector[1]; }
    get z() { return this.vector[2]; }

    set x(p) { this.vector[0] = p; }
    set y(q) { this.vector[1] = q; }
    set z(r) { this.vector[2] = r; }

    getInverseTransform() {
        let mtx = this.getTransformMatrix();
        mat4.invert(mtx, mtx);
        return mtx;
    }

    getTransformMatrix() {

        const p = this.vector[0];
        const q = this.vector[1];
        const r = this.vector[2];

        const v = vec4.fromValues(p,q,0,1);
        const s = vec4.fromValues(r,r,r,1);
        const T = vec4.fromValues(p,q,r,1);

        const T1 = mat4.create();
        const S1 = mat4.create();
        const T2 = mat4.create();

        mat4.fromTranslation(T1,v);
        // const T1 = mat4.fromValues(
        //     1, 0, p,
        //     0, 1, q,
        //     0, 0, 1,
        // );

        mat4.fromScaling(S1, s);
        // const S1 = mat4.fromValues(
        //     s, 0, 0,
        //     0, s, 0,
        //     0, 0, s,
        // );
        vec4.negate(v,v);

        mat4.fromTranslation(T2,v);
        // const T2 = mat4.fromValues(
        //     1, 0, -p,
        //     0, 1, -q,
        //     0, 0, 1,
        // );

        mat4.mul(T1, T1,S1);
        mat4.mul(T1, T1,T2);
        // mat4.mul(T1, T1,T);

        return T1;
    }

    applyTransform(T) {
        vec4.transformMat4(this.vector, this.vector, T);
    }
}