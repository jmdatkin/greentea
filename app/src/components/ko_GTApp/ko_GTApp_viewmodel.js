import ko from 'knockout';

const GTAppViewModel = function() {
    this.x = ko.observable(0);
    this.y = ko.observable(0);
    this.z = ko.observable(1);
};

export default GTAppViewModel;