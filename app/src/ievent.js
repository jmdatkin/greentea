// export default IEvent = (function() {
const IEvent = (function() {

    function Handler(el,type,inner,options) {
        this.el = el;               //DOM element event listener bound to
        this.type = type;           //Event type
        this.inner = inner;         //Regular callback function supplied by user
        this.enabled = false;       //Is handler enabled
        this.IEvent = null;         //Reference to owning parent
        this.options = options;     //Arguments as supplied to addEventListener()
        this.cb = (e) => {          //"Real" callback function bound to element
            this.inner(e, null);
        };
    }

    //Binds handler to parent IEvent -- required before event is enabled
    Handler.prototype.attach = function(IEventObj) {
        this.IEvent = IEventObj;

        let self = this;

        let interface = {       //Object passed into inner callback, used to interface with parent IEvent
            handlers: self.IEvent.handlers,
            store: {
                get: function(x) {
                    if (x === undefined)
                        return Object.assign({},self.IEvent.store);
                    return self.IEvent.store[x];
                },
                put: function(x) {
                    Object.assign(self.IEvent.store,x);
                }
            }
        };

        this.cb = (e) => {  //Wrap callback with reference to store belonging to attached iEvent
            this.inner(e, interface);
        };
    };
    Handler.prototype.activate = function() {
        this.enabled = true;
        this.el.addEventListener(this.type, this.cb, this.options);
    };
    Handler.prototype.deactivate = function() {
        this.enabled = false;
        this.el.removeEventListener(this.type, this.cb, this.options);
    };


    function _IEvent(store) {
        this.handlers = {};     //Object holding event handlers
        this.store = {};        //Object holding shared data between event handlers
        if (typeof store !== "undefined")   //If store argument supplied, init store object
            this.init(store);
    };

    //Initialize store
    _IEvent.prototype.init = function(store) {
        Object.assign(this.store,store);
    };

    //Add new event listener to IEvent
    _IEvent.prototype.addEvent = function(el,type,cb, activated=true, options=false) {
        let handlerObj = new Handler(el,type,cb,options);       //Handler object wrapping event listener
        if (!this.handlers.hasOwnProperty(el))          //If no key supplied for this DOM element...
            this.handlers[el] = {};

        //Bind new Handler to this parent IEvent 
        handlerObj.attach(this);

        //Only activate event at creation unless specified otherwise by user
        if (activated)
            handlerObj.activate();

        //Add handler to list
        this.handlers[el][type] = handlerObj;
    };

    return _IEvent;
})();

module.exports = IEvent;