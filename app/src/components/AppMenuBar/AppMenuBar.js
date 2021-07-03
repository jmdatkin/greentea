import './logo_white.png';
import './AppMenuBar.scss';


function AppMenuBar() {


    return (
        <div className="AppMenuBar">
                <div className="AppMenuBar-item AppMenuBar-logo">
                </div>
                <div className="AppMenuBar-item AppMenuBar-title">
                    GreenTea
                </div>
                <div className="AppMenuBar-item AppMenuBar-component">
                    <span id="coord-indicator">x: 0, y: 0</span>
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