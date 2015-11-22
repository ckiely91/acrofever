Meteor.methods({
	addLobbyChatMessage: function(lobbyId, message) {
		var userId = Meteor.userId();
		if (!userId)
			throw new Meteor.Error('403', 'You must be logged in to do that');

		LobbyChat.update({lobbyId: lobbyId}, 
			{$push: 
				{chats: {
					"time":new Date(),
					"id":userId,
					"message":message}
				}
			}
		);
	}
});