import $ from 'jquery';
import ko from 'knockout';

import Canvas from "./canvas";
import Store from "./store";
import BindEvents from "./event-controller";

require('./components/ko_GTApp/ko_GTApp');
const Init = function () {
    BindEvents();
    Canvas.resize(window.innerWidth, window.innerHeight);
    Store.publish('view-move');
};


$(function() {
    ko.applyBindings({});
    Init();
});

