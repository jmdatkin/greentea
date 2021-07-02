import ko from "knockout";

import template from 'raw-loader!./ko_GTCanvas_template.html';
import viewModel from './ko_GTCanvas_viewmodel';

const canvas = $("canvas#GT_Canvas");
const ctx = canvas.getContext("2d");


ko.components.register('GTCanvas', {
    template: template,
    viewModel: viewModel
});