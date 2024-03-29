import { ptou } from "./util";

const Store = (function() {
    const store = {
        x: 0,
        y: 0,
        z: 1,
        mode: 'move'
    };

    const events = {};


    const publish = function(event, data = {}) {
        Object.assign(store, data);
        if (events.hasOwnProperty(event)) {
            events[event].forEach(callback => callback(store));
        }
    };

    const subscribe = function(event, callback) {
        if (!events.hasOwnProperty(event)) {
            events[event] = [];
        }
        return events[event].push(callback);

        //We allow for more than 1 handler per event

        // else
        //     console.error(`Event '${event}' already subscribed`);
    };
    
    return {
        publish: publish,
        subscribe: subscribe,

        get store() {
            return Object.assign({}, store);
        },

        virtual: {
            get x_mid() {
                return store.x + ptou(window.innerWidth/2);
            },

            get y_mid() {
                return store.y + ptou(window.innerHeight/2);
            }
        }
    };
})();

export default Store;