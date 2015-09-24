Meteor.startup(function() {
	_.each(OfficialLobbyDefaults, function(lobby) {
		OfficialLobbies.upsert({name: lobby.name}, {$set: lobby});
	});
});