GameLog = {};

GameLog.log = function(gameId, log) {
	if (_.isArray(log)) {
		_.each(log, function(thisLog) {
			gameLog(thisLog);
		});
	} else {
		gameLog(log);
	}

	function gameLog(log) {
		log.message = log.message.replace(/@{(.+):(.+)}/, function(match, p1, p2) {
			return logHandlers[p1](p2);
		});
	}
}

var logHandlers = {
	userIdToDisplayName: function(id) {
		var user = Meteor.users.findOne(id);
		if (!user) {
			return;
		}

		if (user.profile) {
			var displayname = user.profile.name || user.username;
		} else {
			var displayname = user.username;
		}
		
		return displayname;
	}
}