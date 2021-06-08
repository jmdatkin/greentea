const Store = (function() {
    const store = {
        x: 0,
        y: 0,
        z: 0
    };

    const events = {};

    const mutations = {};

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

    const commit = function(mutationKey, payload) {
        if (typeof mutations[mutationKey] !== 'function') {
            console.log(`Mutation ${mutationKey} does not exist`);
            return false;
        }

        let newStore = mutations[mutationKey](store, payload);

        store = Object.assign(store, newStore);

        return true;
    };

    const addMutator = function(mutatorName, callback) {

    }
    
    return {
        publish: publish,
        subscribe: subscribe,

        get store() {
            return Object.assign({}, store);
        }
    };
})();

export default Store;