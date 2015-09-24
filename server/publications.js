Meteor.publish('globalChat', function() {
	if (!this.userId)
		return [];

	return GlobalChat.find({}, {sort: {created: -1}, limit: 100});
});

Meteor.publish('lobbyChat', function(lobbyId) {
	if (!this.userId)
		return [];
	
	return LobbyChat.find({lobbyId: lobbyId});
});

Meteor.publish('officialLobbiesList', function() {
	if (!this.userId)
		return [];
	
	return OfficialLobbies.find({}, {fields: {
		//TODO: specify fields to return or not return
	}});
});

Meteor.publish('customLobbiesList', function(limit) {
	if (!this.userId)
		return [];
	
	return CustomLobbies.find({}, {sort: {created: -1}, limit: limit});
});

Meteor.publish('singleLobby', function(lobbyId) {
	if (!this.userId)
		return [];

	if (OfficialLobbies.findOne(lobbyId)) {
		return OfficialLobbies.find({_id: lobbyId});
	} else if (CustomLobbies.findOne(lobbyId)) {
		return CustomLobbies.find({_id: lobbyId});
	}

	return [];
});


//Acro specific stuff