import $ from 'jquery';
import ko from 'knockout';

import Canvas from "./canvas";
import Store from "./store";
import BindEvents from "./event-controller";

require('./components/ko_AppBar/ko_AppBar');
require('./components/ko_GTCanvas/ko_GTCanvas');
require('./components/ko_GTApp/ko_GTApp');

$(function() {
    ko.applyBindings({});
});

const Init = function () {
    BindEvents();
    Canvas.resize(window.innerWidth, window.innerHeight);
    Store.publish('view-move');
};

Init();