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


function GTApp() {


    const [coords, setCoords] = React.useState({
        x: 0,
        y: 0,
        z: 1
    });
    PubSub.subscribe('view-move', data => setCoords(data));

    return (
        <div className="GTApp">
            <GTAppContainer PubSub={PubSub} />
        </div>
    );
}

export default GTApp;