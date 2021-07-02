import ko from 'knockout';

import template from 'raw-loader!./ko_GTApp_template.html';
import viewModel from './ko_GTApp_viewmodel';

ko.components.register('GTApp', {
    template: template,
    viewModel: viewModel
});