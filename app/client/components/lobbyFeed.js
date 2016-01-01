Template.lobbyFeed.onCreated(function() {
	var self = this;
	self.autorun(function() {
		Meteor.subscribe('lobbyFeed', FlowRouter.getParam('lobbyId'));
	});
});

Template.lobbyFeed.helpers({
	ready: function() {
		return Template.instance().ready.get();
	},
	events : function() {
		return LobbyFeed.find();
	}
});