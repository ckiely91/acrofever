Template.lobbyChat.onCreated(function() {
	var self = this;
	self.autorun(function() {
		Meteor.subscribe('lobbyChat', FlowRouter.getParam('lobbyId'));
	});
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
		return LobbyChat.find();
	}
});