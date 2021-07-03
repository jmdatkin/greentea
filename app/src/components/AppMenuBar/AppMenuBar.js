// import './kamui_logo_white.png';
import './logo_white.png';
import './AppMenuBar.scss';


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
                    <button id="move-mode">Move</button>
                    <button id="rect-mode">Rect</button>
                    <button id="home">Home</button>
                </div>
        </div>
    );
}

export default AppMenuBar;