import React from 'react';
import { fabric } from 'fabric';
import { coordSelector } from '../../gt-redux/selectors/sel_coords';

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
    fill: `rgba(${settings.colors["blue"].r},${settings.colors["blue"].g},${settings.colors["blue"].b},1.0)`,
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

        //Change resizing function to change object width/height vs scale transform
        this.MainCanvas.on('object:scaling', opt => {
            let {width,height,scaleX,scaleY} = opt.target;
            let newWidth = width*scaleX;
            let newHeight = height*scaleY;
            opt.target.set({
                width: newWidth,
                height: newHeight,
                scaleX: 1,
                scaleY: 1
            });
        });

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

            this.props.d({
            // store.dispatch({
                type: 'viewport-move',
                payload: {
                    x: tx,
                    y: ty,
                    z: z2
                }
            });
            // self.props.PubSub.emit("view-move", {
            //     x: tx,
            //     y: ty,
            //     z: z2
            // });

        });

        this.MainCanvas.add(testSquare);

        let testSquare = new fabric.Rect({
            left: 0,
            top: 0,
            width: 100,
            height: 100,
            fill: 'cyan',
            stroke: 'black',
            strokeWidth: 5
        });

        MainCanvas.add(testSquare);

        Core.drawAdaptiveGrid(this.state.coords, GridCanvas.getContext('2d'));

        store.subscribe(() => {
            // let state = store.getState();
            let data = useSelector(coordSelector);
            let scaleFactor = 1 / data.z;
            MainCanvas.viewportTransform[0] = scaleFactor;
            MainCanvas.viewportTransform[3] = scaleFactor;
            MainCanvas.viewportTransform[4] = utop(-data.x) / data.z;
            MainCanvas.viewportTransform[5] = utop(-data.y) / data.z;
            testSquare.setCoords();
            Core.drawAdaptiveGrid(data, GridCanvas.getContext('2d'));
            MainCanvas.renderAll();
        });

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