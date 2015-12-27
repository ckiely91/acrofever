Meteor.publish('globalChat', function() {
	return GlobalChat.find({}, {sort: {created: -1}, limit: 100});
});

Meteor.publish('lobbyChat', function(lobbyId) {
	if (!this.userId)
		return [];

	return LobbyChat.find({lobbyId: lobbyId}, {sort: {created: -1}, limit: 50});
});

Meteor.publish('lobbies', function() {
	return Lobbies.find({}, {fields: {
		players: true,
		displayName: true,
		official: true,
		type: true,
		currentGame: true,
		config: true
	}});
});

Meteor.publish('otherPlayers', function(playerIdList) {
	return Meteor.users.find({_id: {$in: playerIdList}}, {fields: {
		username: true,
		avatar: true
	}});
});

Meteor.publish('currentGame', function(currentGame) {
	if (!this.userId || !currentGame)
		return [];

	return Games.find({_id: currentGame});
});

//Acro specific stuff
