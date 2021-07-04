import AppMenuBar from '../AppMenuBar/AppMenuBar';
import GTCanvas from '../GTCanvas/GTCanvas';

import './GTAppContainer.css';

function GTAppContainer(props) {

    return (
        <div className="GTAppContainer">
            <AppMenuBar coords={props.coords}/>
            <GTCanvas d={props.d} PubSub={props.PubSub}/>
        </div>
    );
}

export default GTAppContainer;