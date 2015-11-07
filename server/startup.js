Meteor.startup(function() {
	// _.each(OfficialDefaultLobbiesyDefaults, function(lobby) {
	// 	OfficialLobbies.upsert({name: lobby.name}, {$set: lobby});
	// });
	_.each(DefaultLobbies, function(lobby) {
		Lobbies.upsert({name: lobby.name}, {$setOnInsert: lobby});
	});
});