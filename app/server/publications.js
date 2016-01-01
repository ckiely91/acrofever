Meteor.publish('globalChat', function() {
	return GlobalChat.find({}, {sort: {created: -1}, limit: 100});
});

Meteor.publish('lobbyFeed', function(lobbyId, limit) {
	var maxFeedResults = 200;

	if (!this.userId)
		return [];

	if (limit > maxFeedResults)
		limit = maxFeedResults;

	return LobbyFeed.find({ lobbyId: lobbyId }, { sort: { timestamp: -1	}, limit: limit	});
});

Meteor.publish('lobbies', function() {
	return Lobbies.find({}, {fields: {
		players: true,
		displayName: true,
		official: true,
		type: true,
		currentGame: true,
		config: true,
		newGameStarting: true,
		endTime: true,
		lastUpdated: true
	}});
});

Meteor.publish('otherPlayers', function(playerIdList) {
	return Meteor.users.find({_id: {$in: playerIdList}}, {fields: {
		username: true,
		profile: true
	}});
});

Meteor.publish('currentGame', function(currentGame) {
	if (!this.userId || !currentGame)
		return [];

	return Games.find({_id: currentGame});
});

Meteor.publish('hallOfFame', function(limit) {
	return HallOfFame.find({ active: true }, { sort: { created: -1 }, limit: limit });
});

//Acro specific stuff
