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

    //Callback to get references to child canvas objects
    getContext(name, ctx) {
        this[name] = ctx;
    }

    gridCanvRefAcquired() {
        return this.hasOwnProperty('GridCanvas');
    }

    mainCanvRefAcquired() {
        return this.hasOwnProperty('MainCanvas');
    }

    bothCanvRefsAcquired() {
        return this.gridCanvRefAcquired() && this.mainCanvRefAcquired();
    }

    drawGrid() {
        Core.Grid.draw(this.props.coords);
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

    moveModeMouseDown = opt => {
        let [cx, cy] = [opt.e.offsetX, opt.e.offsetY];
        let data = {
            cx: cx,
            cy: cy,
            mouseDownWorldCoords: this.props.coords,
        };
        this.doMoveModeMousemove(data);
    }

    doMoveModeMousemove = data => {
        let {cx,cy,mouseDownWorldCoords} = data;

        const innerMouseMove = opt => {
            let dx = opt.e.offsetX - cx;
            let dy = opt.e.offsetY - cy;
            
            this.props.dispatch({
                type: 'viewport-move',
                payload: {
                    x: mouseDownWorldCoords.x - ptou(dx)*mouseDownWorldCoords.z,
                    y: mouseDownWorldCoords.y - ptou(dy)*mouseDownWorldCoords.z,
                    z: mouseDownWorldCoords.z
                }
            });
        };
        this.MainCanvas.on('mouse:move', innerMouseMove);
        this.MainCanvas.on('mouse:up', this.generalMouseUp);
    }

    generalMouseUp = () => {
        this.MainCanvas.off('mouse:move');
        this.MainCanvas.off('mouse:up');
    }

    rectModeMouseDown(opt) {
        let [cx, cy] = [opt.e.offsetX, opt.e.offsetY];

        let point = new fabric.Point(cx,cy);      //Cursor pos
        let invM = fabric.util.invertTransform(this.MainCanvas.viewportTransform);  //Inverse viewport transform
        let pointT = fabric.util.transformPoint(point, invM);   //Pos in world space

        let x = pointT.x;
        let y = pointT.y;

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
        this.generalMouseUp();
        // this.MainCanvas.off('mouse:move');
        // this.MainCanvas.off('mouse:up');
    }

    mainMouseDownHandler = e => {
        switch (this.props.userMode) {
            case 'move':
                this.moveModeMouseDown(e);
                break;
            case 'rect':
                this.rectModeMouseDown(e);
                break;
            default: return;
        }
    }

    componentDidMount = () => {
        //Check if canvases are bound
        if (!this.bothCanvRefsAcquired()) {
            console.error("Error: at least one canvas not bound");
            return;
        }
        Core.BindMainCanvas(this.MainCanvas);   //Embed references to dom elements in GTCanvas.core module
        Core.BindGridCanvas(this.GridCanvas);

        Core.Init();

        window.addEventListener('resize', () => {
            Core.resize(window.innerWidth, window.innerHeight);
            this.drawGrid();
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

        this.drawGrid();
    }



    componentDidUpdate() {
        this.MainCanvas.clear();
        this.props.figures.forEach(fig => {
            fig.figure.strokeWidth = fig.strokeWidth * this.props.coords.z;
            this.MainCanvas.add(fig.figure);
        });

        if (this.props.userMode === 'move') {
            this.MainCanvas.set('selection',false);
        } else {
            this.MainCanvas.set('selection',true);
        }

        Core.Main.setViewportTransform(this.props.coords);
        Core.Grid.clear();
        Core.Grid.draw(this.props.coords);
        this.MainCanvas.renderAll();
    }

    componentWillUnmount() {
        //Unbind all events
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