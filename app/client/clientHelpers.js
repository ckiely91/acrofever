Template.registerHelper('lobby', () => {
	var lobbyId = FlowRouter.getParam('lobbyId');
	return Lobbies.findOne(lobbyId);
});

Template.registerHelper('game', (lobby) => {
	return Games.findOne(lobby.currentGame);
});

Template.registerHelper('getRoutePath', (routeName) => {
	return FlowRouter.path(routeName);
});

Template.registerHelper('isOnRoute', (routeName) => {
	return (FlowRouter.getRouteName() === routeName);
});

Template.registerHelper('arrayLength', (array) => {
	return array.length;
});

Template.registerHelper('username', (id, capitalise) => {
  return displayname(id, capitalise);
});

Template.registerHelper('profilePicture', (id, size) => {
	return profilePicture(id, size);
});

Template.registerHelper("isThisUser", (id) => {
	return (id === Meteor.userId());
});

Template.registerHelper('countdown', (endTime) => {
	return countdown(endTime);
});

Template.registerHelper('currentAcro', () => {
	var lobby = Lobbies.findOne(FlowRouter.getParam('lobbyId'));
	var game = Games.findOne(lobby.currentGame);
	var round = getCurrentRound(game);
	var acro = round.acronym;
	return acro.join('. ');
});

Template.registerHelper('joinAcro', (acro) => {
	return acro.join('. ');
});

Template.registerHelper('currentCategory', () => {
	var lobby = Lobbies.findOne(FlowRouter.getParam('lobbyId'));
	var game = Games.findOne(lobby.currentGame);
	var round = getCurrentRound(game);
	return round.category;
});

Template.registerHelper('currentRound', () => {
	var lobby = Lobbies.findOne(FlowRouter.getParam('lobbyId'));
	var game = Games.findOne(lobby.currentGame);
	var round = getCurrentRound(game);
	return round;
});

Template.registerHelper('isInRound', (round) => {
	return (round.players[Meteor.userId()]);
});

Template.registerHelper('greaterThanOne', (number) => {
	return (number > 1);
});

Template.registerHelper('replaceLinksAndEscape', (input) => {
	var autolinkedInput = Autolinker.link(input, {
		truncate: {
			length: 32,
			location: 'smart'
		},
		replaceFn(autolinker, match) {
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

countdown = (endTime) => {
	var diff = moment(endTime).diff(TimeSync.serverTime(null, 500) || mo.now.get());
	if (diff >= 0)
		return moment(diff).format('m:ss');
	else
		return '0:00';
};

getCurrentRound = (game) => {
	return game.rounds[game.currentRound - 1];
};

getRandomCategories = () => {
	return _.sample(DefaultCategories, 4);
};

notify = (title, body, image) => {
	if (typeof Notification === 'undefined')
		return;

	var user = Meteor.user();
	if (user.profile.notificationsEnabled === false)
		return;

	if (document.hidden && Notification.permission === "granted") {
		var n = new Notification(title, {
			icon: image || 'https://acrofever.com/apple-icon-180x180.png',
			body: body,
			lang: 'en-US'
		});
		setTimeout(n.close.bind(n), 4000);
	} else if (Notification.permission === "default") {
		console.log('default permission');
		Notification.requestPermission(function(result) {
			if (result === 'granted') {
				Meteor.call('toggleNotifications', true);
				analytics.track("allowNotifications");
			} else if (result === 'denied') {
				Meteor.call('toggleNotifications', false);
				analytics.track("denyNotifications");
			}
		});
	}
};

playSound = (filename, hiddenOnly) => {
	if ((hiddenOnly && !document.hidden) || Meteor.user().profile.soundsEnabled === false)
		return;

	var sound = new buzz.sound('/sounds/' + filename, {
		formats: ['ogg', 'mp3'],
		volume: 50
	});

	sound.play();
};

profilePicture = (id, size) => {
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
};

Meteor.startup(() => {
    // Resync server time every 10 minutes
	Meteor.setInterval(() => {
		TimeSync.resync();
	}, 600000);
});