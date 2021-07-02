import ko from 'knockout';

import template from 'raw-loader!./ko_AppBar_template.html';
import viewModel from './ko_AppBar_viewmodel';

ko.components.register('AppBar', {
    template: template,
    viewModel: viewModel
});