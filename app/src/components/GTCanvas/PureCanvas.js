import React from 'react';

class PureCanvas extends React.Component {
    
    shouldComponentUpdate() {
        return false;
    }

    render() {
        return (
            <canvas className="GTCanvas-canvas" ref={node => node ? this.props.contextRef('GridCanvas',node) : null} />
        );
    }
}

export default PureCanvas;