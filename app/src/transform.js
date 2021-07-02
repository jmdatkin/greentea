import { mat4, vec4 } from './gl-matrix';
import Store from './store';

class Matrix {
    constructor() {
        this.matrix
    }

    static from() {
        
    }
}

const Transform = (function() {

    const positionVector = function(x,y,z) {
        return vec4.fromValues(
            x, y, z, 1
        );
    };

    const projMtx = function(x,y,z) {
        return mat4.fromValues(
            x, 0, 0, 0,
            0, y, 0, 0,
            0, 0, z, 1,
            0, 0, 0, 0
        );
        // return mat4.fromValues(
        //     x,  0,  0,  0,
        //     0,  y,  0,  0,
        //     0,  0,  z,  0,
        //     0,  0,  -1,  0
        // );
    };

    const screenMtx = function() {
        let mtx = projMtx(
            Store.virtual.x_mid, Store.virtual.y_mid, Store.store.z
        );
        return mtx;
    };

    const mul = function(vec,mtx) {
        let transform_vec = vec4.create();
        vec4.transformMat4(transform_vec, vec,mtx);
        vec4.scale(transform_vec, transform_vec, 1/transform_vec[3]);
        return transform_vec;
    };

    const invert = function(mtx) {
        let mt = mat4.create();
        mat4.invert(mt, mtx);
        return mt;
    }

    const toScreenSpace = function() {

    };

    return {
        positionVector: positionVector,
        screenMtx: screenMtx,
        mul: mul
    };
})();

export default Transform;