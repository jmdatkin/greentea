import React from 'react';

import './GTApp.css';

import GTAppContainer from '../GTAppContainer/GTAppContainer';

const events = {};
const subscribe = function (evt, cb) {
    console.log('pushing');
    if (!events.hasOwnProperty(evt))
        events[evt] = [];
    return events[evt].push(cb);
};

const emit = function (evt, data = {}) {
    console.log(`received emit ${evt}`);
    console.log(events);
    if (events.hasOwnProperty(evt))
        events[evt].forEach(cb => cb(data));
};

const PubSub = {
    emit: emit,
    subscribe: subscribe
};


class GTApp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            coords: {
                x: 0,
                y: 0,
                z: 1
            }
        };
    }

    // const [coords, setCoords] = React.useState({
    //     x: 0,
    //     y: 0,
    //     z: 1
    // });
    componentDidMount() {

        PubSub.subscribe('view-move', data => this.setState({coords: data}));
    }

    render() {
        return (
            <div className="GTApp">
                <GTAppContainer coords={this.state.coords} PubSub={PubSub} />
            </div>
        );
    }
}

export default GTApp;