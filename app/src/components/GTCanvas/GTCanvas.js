import React from 'react';
import { fabric } from 'fabric';

import { utop, ptou } from '../../util/util';
import settings from '../../settings';

import Core from './GTCanvas.core';

import './GTCanvas.scss';

let MainCanvas, GridCanvas;

class GTCanvas extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            coords: {
                x: 0,
                y: 0,
                z: 1
            }
        };
        this.MainCanvasRef = React.createRef();
        this.GridCanvasRef = React.createRef();
    }

    componentDidMount = () => {
        MainCanvas = new fabric.Canvas(this.MainCanvasRef.current);
        GridCanvas = this.GridCanvasRef.current;

        Core.BindMainCanvas(MainCanvas);
        Core.BindGridCanvas(GridCanvas);

        Core.Init();

        let self = this;

        MainCanvas.on('mouse:wheel', function (opt) {
            let delta = Math.max(-1, Math.min(opt.e.deltaY, 1));    //Cap delta for x-browser consistency

            let { x, y, z } = self.state.coords;
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


        let testSquare = new fabric.Rect({
            left: 0,
            top: 0,
            width: 100,
            height: 100,
            fill: 'cyan',
            stroke: 'black',
            strokeWidth: 3
        });

        MainCanvas.on('object:scaling', (opt) => {
            console.log('fired');
            let {scaleX,scaleY} = opt.target;
            let s = settings.unitSize;
            let ws = s/opt.target.width;
            let hs = s/opt.target.height;
            console.log(scaleX);
            opt.target.set({
                scaleX: Math.round(scaleX/ws)*ws,
                scaleY: Math.round(scaleY/hs)*hs,
            })
            opt.target.setCoords();
        });
        MainCanvas.on('object:moving', (opt) => {
            let {left,top} = opt.target;
            let s = settings.unitSize;
            opt.target.set({
                left: Math.round(left/s)*s,
                top: Math.round(top/s)*s,
            })
            opt.target.setCoords();
        });

        MainCanvas.add(testSquare);

        Core.drawAdaptiveGrid(this.state.coords, GridCanvas.getContext('2d'));
        this.props.PubSub.subscribe('view-move', (data) => {
            self.setState({
                coords: data
            });
            testSquare.strokeWidth = 3*data.z;
            let scaleFactor = 1 / data.z;
            MainCanvas.viewportTransform[0] = scaleFactor;
            MainCanvas.viewportTransform[3] = scaleFactor;
            MainCanvas.viewportTransform[4] = utop(-data.x) / data.z;
            MainCanvas.viewportTransform[5] = utop(-data.y) / data.z;
            testSquare.setCoords();
            Core.drawAdaptiveGrid(this.state.coords, GridCanvas.getContext('2d'));
            MainCanvas.renderAll();
        });

        testSquare.setCoords();
    }

    shouldComponentUpdate() {

        return false;
    }

    componentWillUmount() {
        MainCanvas.off('object:moving');
        MainCanvas.off('object:scaling');
        MainCanvas.off('mouse:wheel');
        return false;
    }

    render() {
        return (
            <div className="GTCanvas">
                <div className="GTCanvas-inner">
                    <canvas ref={this.GridCanvasRef} className="GTCanvas-canvas" id="GTCanvas_grid_canv"></canvas>
                    <canvas ref={this.MainCanvasRef} className="GTCanvas-canvas" id="GTCanvas_main_canv"></canvas>
                </div>
            </div>
        );
    }
}

export default GTCanvas;