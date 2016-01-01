Meteor.methods({
	addLobbyFeedEvent: function(lobbyId, summary, detail, eventType) {
		var feedEvent = {
			lobbyId: lobbyId,
            user: Meteor.userId(),
            timestamp: new Date(),
            summary: summary,
            detail: detail,
            eventType: eventType
        };

        LobbyFeed.insert(feedEvent);
	},
	addLobbyFeedChat: function(lobbyId, message) {
		var userId = Meteor.userId();
		if (!userId)
			throw new Meteor.Error('403', 'You must be logged in to do that');
		
		check(message, checkValidChatString);
		
		var displayName = displayname(userId, true);

		Meteor.call('addLobbyFeedEvent', lobbyId, displayName, message, 'CHAT_EVENT');
        Lobbies.findOne(lobbyId, {$currentDate: {lastUpdated: true}});
	}
});