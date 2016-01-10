Meteor.methods({
	addLobbyFeedChat: function(lobbyId, message) {
		var userId = this.userId;
		if (!userId)
			throw new Meteor.Error('403', 'You must be logged in to do that');
		
		check(message, checkValidChatString);

		LobbyFeed.insert({
			lobbyId: lobbyId,
			user: userId,
			timestamp: new Date(),
			detail: message
		});

        Lobbies.findOne(lobbyId, {$currentDate: {lastUpdated: true}});
	},
	addGlobalFeedChat: function(message) {
		var userId = this.userId;
		if (!userId)
			throw new Meteor.Error('403', 'You must be logged in to do that');
		
		check(message, checkValidChatString);

		GlobalFeed.insert({
			user: userId,
			timestamp: new Date(),
			detail: message
		});
	},
	markNagAsClosed: function(id) {
		if (this.userId)
			Meteor.users.update(this.userId, {$addToSet: {'profile.closedNags': id}});
	},
	toggleNotifications: function(state) {
		if (this.userId) {
			check(state, Boolean);
			Meteor.users.update(this.userId, {$set: {'profile.notificationsEnabled': state}});
		}
	},
	toggleSounds: function(state) {
		if (this.userId) {
			check(state, Boolean);
			Meteor.users.update(this.userId, {$set: {'profile.soundsEnabled': state}});
		}
	}
});