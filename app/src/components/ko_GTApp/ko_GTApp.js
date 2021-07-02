import ko from 'knockout';

import template from 'raw-loader!./ko_GTApp_template.html';
import viewModel from './ko_GTApp_viewmodel';

require('../ko_AppBar/ko_AppBar');
require('../ko_GTCanvas/ko_GTCanvas');

ko.components.register('GTApp', {
    template: template,
    viewModel: viewModel
});