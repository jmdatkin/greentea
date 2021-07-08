import AppMenuBar from '../AppMenuBar/AppMenuBar';
import AppSideBar from '../AppSideBar/AppSideBar';
import GTCanvas from '../GTCanvas/GTCanvas';

import './GTAppContainer.css';

function GTAppContainer(props) {

    return (
        <div className="GTAppContainer">
            <AppMenuBar />
            <GTCanvas dispatch={props.dispatch} PubSub={props.PubSub}/>
        </div>
    );
}

export default GTAppContainer;