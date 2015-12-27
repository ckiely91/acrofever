Template.registerHelper('lobby', function() {
	var lobbyId = FlowRouter.getParam('lobbyId');
	return Lobbies.findOne(lobbyId);
});

Template.registerHelper('game', function(lobby) {
	return Games.findOne(lobby.currentGame);
});

Template.registerHelper('getRoutePath', function(routeName) {
	return FlowRouter.path(routeName);
});

Template.registerHelper('isOnRoute', function(routeName) {
	return (FlowRouter.getRouteName() === routeName);
});

Template.registerHelper('arrayLength', function(array) {
	return array.length;
});

Template.registerHelper("username", function(id, capitalise) {
  return displayname(id, capitalise);
});

Template.registerHelper("friendlytime", function(time) {
  return moment(time).fromNow();
});

Template.registerHelper('countdown', function(endTime) {
	var diff = moment(endTime).diff(mo.now.get());
	return moment(diff).format('m:ss');
});

Template.registerHelper('currentAcro', function() {
	var lobby = Lobbies.findOne(FlowRouter.getParam('lobbyId'));
	var game = Games.findOne(lobby.currentGame);
	var round = getCurrentRound(game);
	var acro = round.acronym;
	return acro.join('. ');
});

Template.registerHelper('currentCategory', function() {
	var lobby = Lobbies.findOne(FlowRouter.getParam('lobbyId'));
	var game = Games.findOne(lobby.currentGame);
	var round = getCurrentRound(game);
	return round.category;
});

displayname = function(id, capitalise) {
	var user = Meteor.users.findOne(id);
	if (!user) {
		return;
	}

	if (user.profile) {
		var displayname = user.profile.name;
	} else {
		var displayname = user.username;
	}
	
	if (capitalise == true) {
		return s(displayname).capitalize().value();
	}
	return displayname;
}

getCurrentRound = function(game) {
	return game.rounds[game.currentRound - 1];
}

getRandomCategories = function() {
	return _.sample(DefaultCategories, 4);
}