Template.lobby.helpers({
	ready: function() {
		return lobbySubs.ready();
	},
	lobby: function() {
		return Lobbies.findOne(FlowRouter.getParam('lobbyId'));
	},
	inLobby: function() {
		return (this.players && this.players.indexOf(Meteor.userId()) > -1);
	}
});

Template.lobby.events({
	'click #joinLobby': function(event) {
		var lobbyId = FlowRouter.getParam('lobbyId');
		$(event.currentTarget).addClass('loading');
		Meteor.call('joinOrLeaveOfficialLobby', lobbyId, true);
	},
	'click #leaveLobby': function(event) {
		var lobbyId = FlowRouter.getParam('lobbyId');
		$(event.currentTarget).addClass('loading');
		Meteor.call('joinOrLeaveOfficialLobby', lobbyId, false);
	}
})

Template.lobby.onCreated(function() {
	var self = this;
	self.autorun(function() {
		lobbySubs.subscribe('lobbies');
	});
});

Template.game.helpers({
	ready: function() {
		return Template.instance().ready.get();
	},
	game: function() {
		var currentGame = Lobbies.findOne(FlowRouter.getParam('lobbyId')).currentGame;
		return Games.findOne(currentGame);
	},
	gamePhase: function(game) {
		return game.type + '-' + game.currentPhase;
	}
});

Template.game.onCreated(function() {
	var self = this;
	self.ready = new ReactiveVar();
	self.autorun(function() {
		var lobbyId = FlowRouter.getParam('lobbyId'),
			currentGame = Lobbies.findOne(lobbyId).currentGame;
		var	handle = Meteor.subscribe('currentGame', currentGame);
		self.ready.set(handle.ready());
	});
});

Template.lobbyChat.onCreated(function() {
	Meteor.subscribe('lobbyChat', FlowRouter.getParam('lobbyId'));
});

Template.lobbyChat.events({
	'submit #chat-input-form' : function (evt, template) {
		evt.preventDefault();
		var message = $("#chat-input-box").val();
		var lobbyId = FlowRouter.getParam('lobbyId');
		Meteor.call('addLobbyChatMessage', lobbyId, message);
		$("#chat-input-form").trigger('reset');
	}
});

Template.lobbyChat.helpers({
	ready: function() {
		return Template.instance().ready.get();
	},
	chats : function() {
		return LobbyChat.find().fetch()[0].chats.reverse();
	}
});