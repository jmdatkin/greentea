import AppMenuBar from '../AppMenuBar/AppMenuBar';
import GTCanvas from '../GTCanvas/GTCanvas';

import './GTAppContainer.css';

function GTAppContainer(props) {

    return (
        <div className="GTAppContainer">
            <AppMenuBar />
            <GTCanvas PubSub={props.PubSub}/>
        </div>
    );
}

export default GTAppContainer;