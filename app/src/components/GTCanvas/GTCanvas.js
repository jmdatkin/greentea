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

    getContext(name,ctx) {
        this[name] = ctx;
    }

    componentDidMount = () => {
        // MainCanvas = new fabric.Canvas(this.MainCanvasRef.current);
        // GridCanvas = this.GridCanvasRef.current;


        Core.BindMainCanvas(this.MainCanvas);
        Core.BindGridCanvas(this.GridCanvas);

        Core.Init();

        let self = this;

        this.MainCanvas.on('mouse:wheel', function (opt) {
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



        this.MainCanvas.add(testSquare);

        Core.drawAdaptiveGrid(this.state.coords, this.GridCanvas.getContext('2d'));
        this.props.PubSub.subscribe('view-move', (data) => {
            self.setState({
                coords: data
            });
        });

        testSquare.setCoords();
    }

    componentDidUpdate() {
        let coords = this.state.coords;
            testSquare.strokeWidth = 3*coords.z;
            let scaleFactor = 1 / coords.z;
            this.MainCanvas.viewportTransform[0] = scaleFactor;
            this.MainCanvas.viewportTransform[3] = scaleFactor;
            this.MainCanvas.viewportTransform[4] = utop(-coords.x) / coords.z;
            this.MainCanvas.viewportTransform[5] = utop(-coords.y) / coords.z;
            testSquare.setCoords();
            Core.drawAdaptiveGrid(this.state.coords, this.GridCanvas.getContext('2d'));
            this.MainCanvas.renderAll();

    }

    componentWillUmount() {
        this.MainCanvas.off('object:moving');
        this.MainCanvas.off('object:scaling');
        this.MainCanvas.off('mouse:wheel');
        this.props.PubSub.unsubscribe('view-move');
        return false;
    }

    render() {
        return (
            <div className="GTCanvas">
                <div className="GTCanvas-inner">
                    <PureCanvas contextRef={this.getContext.bind(this)}></PureCanvas>
                    <PureFabricCanvas contextRef={this.getContext.bind(this)}></PureFabricCanvas>
                    {/* <canvas ref={this.GridCanvasRef} className="GTCanvas-canvas" id="GTCanvas_grid_canv"></canvas>
                    <canvas ref={this.MainCanvasRef} className="GTCanvas-canvas" id="GTCanvas_main_canv"></canvas> */}
                </div>
            </div>
        );
    }
}

export default GTCanvas;