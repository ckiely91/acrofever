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

Template.registerHelper('greaterThanOne', function(number) {
	return (number > 1);
});

Template.registerHelper('replaceLinksAndEscape', function(input) {
	var autolinkedInput = Autolinker.link(input, {
		truncate: {
			length: 32,
			location: 'smart'
		},
		replaceFn: function(autolinker, match) {
			switch(match.getType()) {
				case 'url':
					var tag = autolinker.getTagBuilder().build(match);
					tag.setAttr( 'rel', 'nofollow' );
					tag.addClass( 'external-link' );
					return tag;
				default:
					return true;
			}
		}
	});

	//escape except allowed tags
	autolinkedInput = '<div>' + autolinkedInput + '</div>';

	$autolinkedInput = $(autolinkedInput);
	var $elements = $autolinkedInput.find("*").not("a,img,br");
	for (var i = $elements.length - 1; i >= 0; i--) {
	    var e = $elements[i];
	    $(e).replaceWith(e.innerHTML);
	}
	return $autolinkedInput.html();
});

getCurrentRound = function(game) {
	return game.rounds[game.currentRound - 1];
}

getRandomCategories = function() {
	return _.sample(DefaultCategories, 4);
}

notify = function(title, body) {
	if (typeof Notification === 'undefined')
		return;

	var user = Meteor.user();
	if (user.profile.notificationsEnabled === false)
		return;

	if (document.hidden && Notification.permission === "granted") {
		var n = new Notification(title, {
			icon: 'https://acrofever.com/apple-icon-180x180.png',
			body: body,
			lang: 'en-US'
		});
		setTimeout(n.close.bind(n), 4000);
	} else if (Notification.permission !== "denied") {
		Notification.requestPermission();
	}
}

playSound = function(filename, hiddenOnly) {
	if (hiddenOnly && !document.hidden)
		return;

	var sound = new buzz.sound('/sounds/' + filename, {
		formats: ['ogg', 'mp3'],
		volume: 50
	});

	sound.play();
}