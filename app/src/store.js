const Store = (function() {
    const store = {
        x: 0,
        y: 0,
        z: 1
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
            return events[event].push(callback);
        }
        else
            console.error(`Event '${event}' already subscribed`);
    };
    
    return {
        publish: publish,
        subscribe: subscribe,

        get store() {
            return Object.assign({}, store);
        }
    };
})();

export default Store;