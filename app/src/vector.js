import { vec2, vec3, vec4, mat4 } from './gl-matrix';

class Vector {
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

    applyTransform(T) {
        vec4.transformMat4(this.vector, this.vector, T);
    }
}


export default Vector;