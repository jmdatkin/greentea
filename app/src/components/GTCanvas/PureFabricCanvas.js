import React from 'react';
import { fabric } from 'fabric';

class PureFabricCanvas extends React.Component {

    constructor(props) {
        super(props);
    }


    shouldComponentUpdate() {
        return false;
    }

    render() {
        return (
            <canvas className="GTCanvas-canvas" ref={node => node ? this.props.contextRef('MainCanvas',new fabric.Canvas(node)) : null} />
        );
    }
}

export default PureFabricCanvas;