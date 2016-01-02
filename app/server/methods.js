Meteor.methods({
	joinOrLeaveOfficialLobby: function(lobbyId, join) {
		var userId = Meteor.userId();
		if (!userId)
			throw new Meteor.Error('403', 'You must be logged in to do that');

		var lobby = Lobbies.findOne(lobbyId);
		if (!lobby || !lobby.official)
			throw new Meteor.Error('No valid lobby');

		if (join) {
			//user is joining the lobby
			Lobbies.update(lobbyId, {$addToSet: {players: userId}});
			var username = displayname(userId, true);
			LobbyManager.addSystemMessage(lobbyId, username + ' joined the lobby.');
			LobbyManager.addSystemMessage(null, username + ' joined the lobby ' + lobby.displayName);

			//refresh lobby
			lobby = Lobbies.findOne(lobbyId);
			var game = Games.findOne(lobby.currentGame);

			if (!game.active && lobby.players.length >= Meteor.settings[game.type].minimumPlayers) {
				//game is inactive but we now have the minimum players. Start the game!
				
				GameManager.makeGameActive(lobby.currentGame);
			}

		} else {
			//user is leaving the lobby
			Lobbies.update(lobbyId, {$pull: {players: userId}});
			var username = displayname(userId, true);
			LobbyManager.addSystemMessage(lobbyId, username + ' left the lobby.');
			LobbyManager.addSystemMessage(null, username + ' left the lobby ' + lobby.displayName);
			//lobby should only be made inactive at the end of the round
		}
	},
	hallOfFameAcroCount: function() {
		return HallOfFame.find({active: true}).count();
	}
});