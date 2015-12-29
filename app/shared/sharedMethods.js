Meteor.methods({
	addLobbyChatMessage: function(lobbyId, message) {
		var userId = Meteor.userId();
		if (!userId)
			throw new Meteor.Error('403', 'You must be logged in to do that');

		check(message, checkValidChatString);

		var chat = {
			lobbyId: lobbyId,
            user: Meteor.userId(),
            time: new Date(),
            message: message
        };

        LobbyChat.insert(chat);
	}
});