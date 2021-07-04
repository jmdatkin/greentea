import React from 'react';
import { fabric } from 'fabric';

import PureCanvas from './PureCanvas';
import PureFabricCanvas from './PureFabricCanvas';

import { utop, ptou } from '../../util/util';
import settings from '../../settings';

import Core from './GTCanvas.core';

import './GTCanvas.scss';


let testSquare = new fabric.Rect({
    left: 0,
    top: 0,
    width: 100,
    height: 100,
    fill: `rgba(${settings.colors["orange"].r},${settings.colors.["orange"].g},${settings.colors["orange"].b},1.0)`,
    stroke: 'black',
    strokeWidth: 3
});
class GTCanvas extends React.Component {

    getContext(name, ctx) {
        this[name] = ctx;
    }

    componentDidMount = () => {
        Core.BindMainCanvas(this.MainCanvas);
        Core.BindGridCanvas(this.GridCanvas);

        Core.Init();

        let self = this;

        this.MainCanvas.on('mouse:wheel', function (opt) {
            let delta = Math.max(-1, Math.min(opt.e.deltaY, 1));    //Cap delta for x-browser consistency

            let { x, y, z } = self.props.coords;
            let [cx, cy] = [ptou(opt.e.offsetX), ptou(opt.e.offsetY)];      //Mouse cursor position

            //Model to rendered position
            cx = cx * z + x;
            cy = cy * z + y;

            let dz = delta * z / 20;                                //Change in z

            let z2 = Math.max(settings.minZoom, Math.min(z + dz, settings.maxZoom));

            /*  https://github.com/cytoscape/cytoscape.js/blob/unstable/src/core/viewport.js  */
            let tx = -z2 / z * (cx - x) + cx;
            let ty = -z2 / z * (cy - y) + cy;

            self.props.PubSub.emit("view-move", {
                x: tx,
                y: ty,
                z: z2
            });

        });

        this.MainCanvas.add(testSquare);

        Core.drawAdaptiveGrid(this.props.coords, this.GridCanvas.getContext('2d'));
        testSquare.setCoords();
    }

    componentDidUpdate() {
        // let coords = this.state.coords;
        let coords = this.props.coords;
        testSquare.strokeWidth = 3 * coords.z;
        let scaleFactor = 1 / coords.z;
        this.MainCanvas.viewportTransform[0] = scaleFactor;
        this.MainCanvas.viewportTransform[3] = scaleFactor;
        this.MainCanvas.viewportTransform[4] = utop(-coords.x) / coords.z;
        this.MainCanvas.viewportTransform[5] = utop(-coords.y) / coords.z;
        testSquare.setCoords();
        Core.clear(this.GridCanvas);
        Core.drawAdaptiveGrid(this.props.coords, this.GridCanvas.getContext('2d'));
        this.MainCanvas.renderAll();

    }

    componentWillUmount() {
        this.MainCanvas.off('object:moving');
        this.MainCanvas.off('object:scaling');
        this.MainCanvas.off('mouse:wheel');
    }

    render() {
        return (
            <div className="GTCanvas">
                <div className="GTCanvas-inner">
                    <PureCanvas contextRef={this.getContext.bind(this)}></PureCanvas>
                    <PureFabricCanvas contextRef={this.getContext.bind(this)}></PureFabricCanvas>
                </div>
            </div>
        );
    }
}

export default GTCanvas;