import Coords from './coords';
import { mat4 } from './gl-matrix';

const Camera = (function() {
    const coords = new Coords();

    const midpoint = {
        x: window.innerWidth/2,
        y: window.innerHeight/2
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
        midpoint: midpoint,
        getPerspectiveMatrix: getPerspectiveMatrix
    };
})();

export default Camera;