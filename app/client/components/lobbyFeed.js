Template.lobbyFeed.helpers({
	ready: function() {
		return Template.instance().ready.get();
	},
	events: function() {
		return LobbyFeed.find({lobbyId: this._id},{sort: {timestamp:-1}});
	},
	showGetMoreDiv: function(events) {
		return (events.count() === Session.get('lobbyChatLimit'));
	}
});

Template.lobbyFeed.onCreated(function() {
	var self = this;
	self.ready = new ReactiveVar();
	Session.set('lobbyChatLimit', 20);
	self.autorun(function() {
		var lobbyId = FlowRouter.getParam('lobbyId');
		var handle = Meteor.subscribe('lobbyFeed', lobbyId, Session.get('lobbyChatLimit'));
		self.ready.set(handle.ready());
		if (handle.ready()) {
			var playerIds = [];
			LobbyFeed.find({lobbyId: lobbyId}).forEach(function(event) {
				if (event.user)
					playerIds.push(event.user);
			});
			console.log(playerIds);
			Meteor.subscribe('otherPlayers', playerIds);
		}
	});
});

Template.lobbyFeed.onRendered(function() {
	var self = this;
	$(window).scroll(function() {
		var getMoreDiv = self.$('.getMoreDiv');
		if (getMoreDiv.length && getMoreDiv.isOnScreen()) {
			var limit = Session.get('lobbyChatLimit');
			limit += 20;
			if (limit <= 200)
				Session.set('lobbyChatLimit', limit);
		}
	});
});

Template.lobbyChatInput.events({
	'submit #chat-input-form' : function (evt, template) {
		evt.preventDefault();
		var message = $("#chat-input-box").val();
		var lobbyId = FlowRouter.getParam('lobbyId');
		Meteor.call('addLobbyFeedChat', lobbyId, message);
		$("#chat-input-form").trigger('reset');
	}
});