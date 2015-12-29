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

Template.registerHelper('username', function(id, capitalise) {
  return displayname(id, capitalise);
});

Template.registerHelper('profilePicture', function(id, size) {
	var user = Meteor.users.findOne(id);

	if (!user || !user.profile || !user.profile.profilePicture)
		return '/images/no-profile-pic.png';

	if (!size)
		var size = 100;

	var type = user.profile.profilePicture.type,
		url = user.profile.profilePicture.url,
		newUrl;

	switch (type) {
		case 'gravatar':
			newUrl = URI(url).addSearch({ size: size}).toString();
			break;
		case 'facebook':
			newUrl = URI(url).addSearch({height: size, width: size}).toString();
			break;
		case 'google':
			newUrl = URI(url).addSearch({sz: size}).toString();
			break;
		case 'twitter':
			if (size <= 24) {
                size = "_mini";
            } else if (size <= 48) {
                size = "_normal";
            } else if (size <= 73) {
                size = "_bigger";
            } else {
                //risky - this file could be massive!
                size = "";
            };
            newUrl = url.replace("_normal",size);
            break;
        default:
        	newUrl = '/images/no-profile-pic.png';
	}
	return newUrl;
});

Template.registerHelper("isThisUser", function(id) {
	return (id === Meteor.userId());
});

Template.registerHelper("friendlytime", function(time) {
  return moment(time).fromNow();
});

Template.registerHelper('countdown', function(endTime) {
	var diff = moment(endTime).diff(mo.now.get());
	if (diff >= 0)
		return moment(diff).format('m:ss');
	else
		return '0:00';
});

Template.registerHelper('currentAcro', function() {
	var lobby = Lobbies.findOne(FlowRouter.getParam('lobbyId'));
	var game = Games.findOne(lobby.currentGame);
	var round = getCurrentRound(game);
	var acro = round.acronym;
	return acro.join('. ');
});

Template.registerHelper('joinAcro', function(acro) {
	return acro.join('. ');
});

Template.registerHelper('currentCategory', function() {
	var lobby = Lobbies.findOne(FlowRouter.getParam('lobbyId'));
	var game = Games.findOne(lobby.currentGame);
	var round = getCurrentRound(game);
	return round.category;
});

Template.registerHelper('currentRound', function() {
	var lobby = Lobbies.findOne(FlowRouter.getParam('lobbyId'));
	var game = Games.findOne(lobby.currentGame);
	var round = getCurrentRound(game);
	return round;
});

Template.registerHelper('isInRound', function(round) {
	return (round.players[Meteor.userId()]);
});

getCurrentRound = function(game) {
	return game.rounds[game.currentRound - 1];
}

getRandomCategories = function() {
	return _.sample(DefaultCategories, 4);
}