import AppMenuBar from '../AppMenuBar/AppMenuBar';
import AppSideBar from '../AppSideBar/AppSideBar';
import GTCanvas from '../GTCanvas/GTCanvas';

import './GTAppContainer.css';

function GTAppContainer(props) {

    const sidebarStyle = {
        width: 50
    };

    const getCanvasWidth = function() {
        return window.innerWidth - sidebarStyle.width;
    };

    return (
        <div className="GTAppContainer">
            <AppMenuBar offset={sidebarStyle.width} coords={props.coords}/>
            <AppSideBar style={sidebarStyle}/>
            <GTCanvas width={getCanvasWidth()} coords={props.coords} PubSub={props.PubSub}/>
        </div>
    );
}

export default GTAppContainer;