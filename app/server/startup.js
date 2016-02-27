import GameManager from './imports/GameManager';
import LobbyManager from './imports/LobbyManager';

Meteor.startup(function() {
	//Loggly initialisation
	Logger = new Loggly({
		token: Meteor.settings.loggly.token,
		subdomain: Meteor.settings.loggly.subdomain,
		auth: {
			username: Meteor.settings.loggly.username,
			password: Meteor.settings.loggly.password
		},
		json: true
	});
	
	_.each(DefaultLobbies, function(lobby) {
		Lobbies.upsert({name: lobby.name}, {$setOnInsert: lobby});
		
		var insertedLobby = Lobbies.findOne({name: lobby.name});
		
		if (!insertedLobby.currentGame) {
			//insert first game
			var gameId = Games.insert({
				type: 'acrofever',
			    lobbyId: insertedLobby._id,
			    active: false,
			    currentPhase: 'category',
			    currentRound: 0,
			    endTime: null
			});
			Lobbies.update(insertedLobby._id, {$set: {currentGame: gameId}, $push: {games: gameId}});
		} else {
			//game may be in progress, we should end it so timeouts will work properly

			var active = Games.findOne(insertedLobby.currentGame, {fields: {active: true}}).active;
			if (active) {
				Lobbies.update(insertedLobby._id, {$set: {players: []}});
                LobbyManager.addSystemMessage(insertedLobby._id, 'Sorry, the current game was cancelled because of a server restart.', 'warning', 'Please rejoin the lobby to start a new game.');
				GameManager.makeGameInactive(insertedLobby.currentGame);
			}
		}
	});
});
