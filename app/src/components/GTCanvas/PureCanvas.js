import React from 'react';

class PureCanvas extends React.Component {

    constructor(props) {
        super(props);
    }

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