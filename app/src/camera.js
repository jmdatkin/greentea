import Vector from './vector';
import { mat4 } from './gl-matrix';

const Camera = (function() {
    const coords = new Vector();

    const midpoint = function() {
        return new Vector(
            coords.x + window.innerWidth/2,
            coords.y + window.innerHeight/2
        );
    };

    const getPerspectiveMatrix = function() {
        let { x, y, z } = coords;
        x -= midpoint.x;
        y -= midpoint.y;
        return mat4.fromValues(
            x, 0, 0, 0,
            0, y, 0, 0,
            0, 0, z, 0,
            0, 0, 1, 0
        );
    };

    window.addEventListener("resize", () => {
        midpoint.x = window.innerWidth/2;
        midpoint.y = window.innerHeight/2;
    });

    return {
        moveTo(x,y) {
            coords.x = x;
            coords.y = y;
        },
        
        coords: coords,
        get midpoint() { return midpoint(); },
        getPerspectiveMatrix: getPerspectiveMatrix
    };
})();

export default Camera;