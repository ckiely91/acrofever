Template.registerHelper('getRoutePath', function(routeName) {
	return FlowRouter.path(routeName);
});

Template.registerHelper('isOnRoute', function(routeName) {
	return (FlowRouter.getRouteName() === routeName);
});

Template.registerHelper('arrayLength', function(array) {
	return array.length;
});