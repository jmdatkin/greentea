import React from 'react';
import { fabric } from 'fabric';
import { connect } from 'react-redux';

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

function mapState(state) {
    return {
        coords: state.coords
    };
}

class GTCanvas extends React.Component {

    getContext(name, ctx) {
        this[name] = ctx;
    }

    mouseWheelHandler(opt) {
        let delta = Math.max(-1, Math.min(opt.e.deltaY, 1));    //Cap delta for x-browser consistency

        let mousePos = {
            x: ptou(opt.e.offsetX),
            y: ptou(opt.e.offsetY)
        };

        let newCoords = Core.zoomFromPos(this.props.coords, mousePos, delta);

        this.props.dispatch({
            type: 'viewport-move',
            payload: newCoords
        });

        testSquare.setCoords();
    }

    componentDidMount = () => {
        Core.BindMainCanvas(this.MainCanvas);
        Core.BindGridCanvas(this.GridCanvas);

        Core.Init();

        let self = this;

        window.addEventListener('resize', () => {
            Core.resize(window.innerWidth, window.innerHeight);
            Core.drawAdaptiveGrid(this.props.coords, this.GridCanvas.getContext('2d'));
        });

        //Change resizing function to change object width/height vs scale transform
        // this.MainCanvas.on('object:scaling', opt => {
        //     let {width,height,scaleX,scaleY} = opt.target;
        //     let newWidth = width*scaleX;
        //     let newHeight = height*scaleY;
        //     opt.target.set({
        //         width: newWidth,
        //         height: newHeight,
        //         scaleX: 1,
        //         scaleY: 1
        //     });
        // });

        this.MainCanvas.on('mouse:wheel', this.mouseWheelHandler.bind(this));
        this.MainCanvas.add(testSquare);

        Core.drawAdaptiveGrid(this.props.coords, this.GridCanvas.getContext('2d'));

        testSquare.setCoords();
    }

    componentDidUpdate() {
        let coords = this.props.coords;
        testSquare.strokeWidth = 3 * coords.z;
        let scaleFactor = 1 / coords.z;
        this.MainCanvas.viewportTransform[0] = scaleFactor;
        this.MainCanvas.viewportTransform[3] = scaleFactor;
        this.MainCanvas.viewportTransform[4] = utop(-coords.x) / coords.z;
        this.MainCanvas.viewportTransform[5] = utop(-coords.y) / coords.z;
        Core.clear(this.GridCanvas);
        Core.drawAdaptiveGrid(this.props.coords, this.GridCanvas.getContext('2d'));
        testSquare.setCoords();
        this.MainCanvas.renderAll();
    }

    componentWillUnmount() {
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

export default connect(mapState)(GTCanvas);