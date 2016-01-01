Template.lobbyFeed.onCreated(function() {
	var self = this;
	self.ready = new ReactiveVar();
	self.limit = new ReactiveVar(25);
	self.autorun(function() {
		var handle = Meteor.subscribe('lobbyFeed', FlowRouter.getParam('lobbyId'), self.limit.get());
		self.ready.set(handle.ready());
	});
});

Template.lobbyFeed.helpers({
	ready: function() {
		return Template.instance().ready.get();
	},
	events: function() {
		return LobbyFeed.find();
	},
	hasNotReachedLimit: function() {
		return Template.instance().limit.get() >= 30;
	}
});

Template.lobbyFeed.events({
	'click #getMore': function(evt, template) {
		evt.preventDefault();
		var limit = template.limit.get();
		limit += 10;
		template.limit.set(limit);
	}
});