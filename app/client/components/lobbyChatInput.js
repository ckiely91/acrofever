Template.lobbyChatInput.events({
	'submit #chat-input-form' : function (evt, template) {
		evt.preventDefault();
		var message = $("#chat-input-box").val();
		var lobbyId = FlowRouter.getParam('lobbyId');
		Meteor.call('addLobbyFeedChat', lobbyId, message);
		$("#chat-input-form").trigger('reset');
	}
});