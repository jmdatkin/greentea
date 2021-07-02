import $ from 'jquery';
import ko from "knockout";

import template from 'raw-loader!./ko_GTCanvas_template.html';
import viewModel from './ko_GTCanvas_viewmodel';

ko.components.register('GTCanvas', {
    template: template,
    viewModel: {
        createViewModel: function (params, componentInfo) {

            // const canvas = document.createElement("canvas");//$("canvas#GT_Canvas");
            // const ctx = canvas[0].getContext("2d");

            console.log(componentInfo.element);


            return new viewModel(params);
        }
    }
});