Meteor.startup(function() {
	// _.each(OfficialDefaultLobbiesyDefaults, function(lobby) {
	// 	OfficialLobbies.upsert({name: lobby.name}, {$set: lobby});
	// });
	_.each(DefaultLobbies, function(lobby) {
		Lobbies.upsert({name: lobby.name}, {$setOnInsert: lobby});
		
		var insertedLobby = Lobbies.findOne({name: lobby.name});
		
		if (!insertedLobby.currentGame) {
			//insert first game
			var gameId = Games.insert({
				type: 'Acrofever',
			    lobbyId: insertedLobby._id,
			    active: false,
			    currentPhase: 'category',
			    currentRound: 0,
			    endTime: null
			});
			Lobbies.update(insertedLobby._id, {$set: {currentGame: gameId}, $push: {games: gameId}});
		}
	});
});