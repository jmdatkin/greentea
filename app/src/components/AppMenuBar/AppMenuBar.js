// import './kamui_logo_white.png';
import { connect } from 'react-redux';
import settings from '../../settings';
import './logo_white.png';
import './AppMenuBar.scss';

import { RectFigure } from '../../figure';

function mapStateToProps(state) {
    return {
        coords: state.coords
    };
}

function action() {
    return {
        left: 0,
        top: 0,
        width: 100,
        height: 100,
        stroke: 'black',
        fill: `rgba(${settings.colors["blue"].r},${settings.colors["blue"].g},${settings.colors["blue"].b},1.0)`,
        strokeWidth: 3
    };
}

function AppMenuBar(props) {


    return (
        <div className="AppMenuBar">
            <div className="AppMenuBar-item AppMenuBar-logo">
            </div>
            <div className="AppMenuBar-item AppMenuBar-title">
                Kamui
            </div>
            <div className="AppMenuBar-item AppMenuBar-component">
                <span id="coord-indicator">x: {props.coords.x.toFixed(2)}, y: {props.coords.y.toFixed(2)}, z: {props.coords.z.toFixed(2)}</span>
            </div>
            <div className="AppMenuBar-item AppMenuBar-component">
                <button onClick={() => { props.dispatch({ type: 'add-figure', payload: new RectFigure(action()) }) }}>Add Figure</button>
            </div>
            <div className="AppMenuBar-item AppMenuBar-component">
                <button onClick={() => { props.dispatch({type: 'user-change-mode',payload: 'move'})}}>Move Mode</button>
            </div>
            <div className="AppMenuBar-item AppMenuBar-component">
                <button onClick={() => { props.dispatch({type: 'user-change-mode',payload: 'rect'})}}>Rect Mode</button>
            </div>
        </div>
    );
}

export default connect(mapStateToProps)(AppMenuBar);