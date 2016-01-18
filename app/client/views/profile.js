Template.profile.helpers({
	ready: function() {
		return Template.instance().subscriptionsReady();
	},
	user: function() {
		return Meteor.users.findOne(FlowRouter.getParam('userId'));
	}
});

Template.profile.onCreated(function() {
	var self = this;
	self.autorun(function() {
		var userId = FlowRouter.getParam('userId');
		self.subscribe('otherPlayers', [userId]);
	});
});