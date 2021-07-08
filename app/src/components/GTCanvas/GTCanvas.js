import React from 'react';
import { fabric } from 'fabric';
import { connect } from 'react-redux';

import { RectFigure } from '../../figure';

import PureCanvas from './PureCanvas';
import PureFabricCanvas from './PureFabricCanvas';

import { utop, ptou } from '../../util/util';
import settings from '../../settings';

import Core from './GTCanvas.core';

import './GTCanvas.scss';

function mapState(state) {
    return {
        userMode: state.userMode,
        coords: state.coords,
        figures: state.figures
    };
}

let tempFig;

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

    }

    rectModeMouseDown(opt) {
        let [x, y] = [opt.e.offsetX, opt.e.offsetY];
        
        // x += utop(this.props.coords.x);
        // y += utop(this.props.coords.y);

        let point = new fabric.Point(x,y);
        let invM = fabric.util.invertTransform(this.MainCanvas.viewportTransform);
        let pointT = fabric.util.transformPoint(point, invM);
        // this.setState({
        //     tempFig: new RectFigure({
        //         left: x,
        //         top: y,
        //         width: 0,
        //         height: 0
        //     })
        // });

        x = pointT.x;
        y = pointT.y;

        tempFig = new RectFigure({
            left: x,
            top: y,
            width: 0,
            height: 0
        });
        this.MainCanvas.on('mouse:move', this.rectModeMouseMove);
        this.MainCanvas.on('mouse:up', this.rectModeMouseUp);
    }

    rectModeMouseMove = opt => {
        let [x, y] = [opt.e.offsetX, opt.e.offsetY];
        
        // x += utop(this.props.coords.x);
        // y += utop(this.props.coords.y);


        let point = new fabric.Point(x,y);
        let invM = fabric.util.invertTransform(this.MainCanvas.viewportTransform);
        let pointT = fabric.util.transformPoint(point, invM);

        x = pointT.x;
        y = pointT.y;

        let [dx, dy] = [x - tempFig.left, y - tempFig.top];

        tempFig.width = dx;
        tempFig.figure.width = dx;
        tempFig.height = dy;
        tempFig.figure.height = dy;
    }

    rectModeMouseUp = () => {
        this.props.dispatch({
            type: 'add-figure',
            payload: tempFig
        });
        this.MainCanvas.off('mouse:move');
        this.MainCanvas.off('mouse:up');
    }

    mainMouseDownHandler = e => {
        switch (this.props.userMode) {
            case 'move':
                console.log('mousedown when move');
                break;
            //Do move stuff
            case 'rect':
                console.log('rect');
                this.rectModeMouseDown(e);
                break;
            default: return;
        }
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

        this.MainCanvas.on('mouse:down', this.mainMouseDownHandler);
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

        Core.drawAdaptiveGrid(this.props.coords, this.GridCanvas.getContext('2d'));

    }

    componentDidUpdate() {
        this.MainCanvas.clear();
        this.props.figures.forEach(fig => {
            fig.figure.strokeWidth = fig.strokeWidth * this.props.coords.z;
            this.MainCanvas.add(fig.figure);
        });
        let coords = this.props.coords;
        let scaleFactor = 1 / coords.z;
        this.MainCanvas.viewportTransform[0] = scaleFactor;
        this.MainCanvas.viewportTransform[3] = scaleFactor;
        this.MainCanvas.viewportTransform[4] = utop(-coords.x) / coords.z;
        this.MainCanvas.viewportTransform[5] = utop(-coords.y) / coords.z;
        Core.clear(this.GridCanvas);
        Core.drawAdaptiveGrid(this.props.coords, this.GridCanvas.getContext('2d'));
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