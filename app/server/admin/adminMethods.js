import {HallOfFame, Nags, Events} from '../../imports/collections';
import {displayName} from '../../imports/helpers';
import Twitter from 'twitter';

Meteor.methods({
	isAdminUser: function() {
		return isAdminUser(this.userId);
	},
	adminEditHallOfFameEntry: function(id, options) {
		if (!isAdminUser(this.userId))
			throw new Meteor.Error('no-permission', 'You don\'t have permission to do that');

		if (options.deactivate) {
			HallOfFame.update(id, {$set: {active: false}});
		}
		else if (options.delete) {
			HallOfFame.remove(id);
		}
		else if (options.activate) {
			HallOfFame.update(id, {$set: {active: true}});
			postToTwitter(id);
		}
	},
	adminAddNag: function(fields) {
		if (!isAdminUser(this.userId))
			throw new Meteor.Error('no-permission', 'You don\'t have permission to do that');

		var nag = {
			timestamp: new Date()
		}

		if (fields.title.length > 0) nag.title = fields.title; 
		if (fields.message.length > 0) nag.message = fields.message; 
		if (fields.icon.length > 0) nag.icon = fields.icon;
		if (fields.colour.length > 0) nag.colour = fields.colour;
		if (fields.active) nag.active = true;

		Nags.insert(nag); 
	},
	adminEditNag: function(id, action) {
		if (!isAdminUser(this.userId))
			throw new Meteor.Error('no-permission', 'You don\'t have permission to do that');

		switch (action) {
			case 'activate':
				Nags.update(id, {$set: {active: true}});
				break;
			case 'deactivate':
				Nags.update(id, {$set: {active: false}});
				break;
			case 'delete':
				Nags.remove(id);
				break;
		}
	},
	adminAddEvent: function(fields) {
        if (!isAdminUser(this.userId))
            throw new Meteor.Error('no-permission', 'You don\'t have permission to do that');

        fields.creator = this.userId;
        Events.insert(fields);
	}


	//Migrations
	//Commenting out these methods once they have been run on production
	/*migrateUserBase: function() {
		if (!isAdminUser(this.userId))
			throw new Meteor.Error('no-permission', 'You don\'t have permission to do that');

		// this should only need to be run ONCE
		Meteor.users.find().forEach(function(user) {
			if (!user.profile || !user.profile.profilePicture) {
				var email,
					profilePicture = {};

				if (user.services.password && user.emails) {
					// see if they have a gravatar
					email = user.emails[0].address;
					profilePicture.type = 'gravatar';
					profilePicture.url = Gravatar.imageUrl(email, {secure: true, default: 'mm'});
				} else if (user.services.facebook) {
					email = user.services.facebook.email;
					profilePicture.type = 'facebook';
					profilePicture.url = 'https://graph.facebook.com/v2.3/' + user.services.facebook.id + '/picture';
				} else if (user.services.google) {
					email = user.services.google.email;
					profilePicture.type = 'google';
					profilePicture.url = user.services.google.picture;
				} else if (user.services.twitter) {
					profilePicture.type = 'twitter';
					profilePicture.url = user.services.twitter.profile_image_url_https;
				}

				Meteor.users.update(user._id, {$set: {'profile.profilePicture': profilePicture}});
				console.log('Fetched profile picture for ' + email + ' (' + user._id + ')');
			}
		});
	},
	migrateHallOfFame: function(array) {
		if (!isAdminUser(this.userId))
			throw new Meteor.Error('no-permission', 'You don\'t have permission to do that');

		_.each(array, function(item) {
			var obj = {
				userId: item.id,
				acro: item.acro,
				acronym: item.acronym,
				category: item.category,
				active: false,
				votes: [],
				created: new Date(item.date)
			};
			HallOfFame.insert(obj);
			console.log('inserted ' + item.acro);
		});
	}
	migrateUserStats: function() {
		if (!isAdminUser(this.userId))
			throw new Meteor.Error('no-permission', 'You don\'t have permission to do that');

		var gamesPlayed = {},
			gamesWon = {};

		var games = Games.find({gameWinner: {$exists: true}});
		console.log(games.count() + ' total games');

		games.forEach(function(game) {
			_.each(game.scores, function(score, player) {
				if (!gamesPlayed[player])
					gamesPlayed[player] = 0;

				gamesPlayed[player] = gamesPlayed[player] + 1;
			});

			if (!gamesWon[game.gameWinner])
				gamesWon[game.gameWinner] = 0;

			gamesWon[game.gameWinner] = gamesWon[game.gameWinner] + 1;
		});
		console.log(gamesPlayed);
		console.log('----------------------------');
		console.log(gamesWon);

		Meteor.users.find({}).forEach(function(user) {
			var totalGamesPlayed = gamesPlayed[user._id] || 0;
			var totalGamesWon = gamesWon[user._id] || 0;
			if (user.profile && user.profile.stats) {
				if (_.isObject(user.profile.stats.gamesPlayed)) {
					winner = 0;
					_.each(user.profile.stats.gamesPlayed, function(game) {
						if (game.winner) winner ++;
					});
					totalGamesPlayed += user.profile.stats.gamesPlayed.length;
					totalGamesWon += winner;
				}
			}

			Meteor.users.update(user._id, {$set: {'profile.stats': {
				gamesPlayed: totalGamesPlayed,
				gamesWon: totalGamesWon
			}}});
		});

		return {
			gamesPlayed: gamesPlayed,
			gamesWon: gamesWon
		};
	}*/
});

function isAdminUser(userId) {
	return (Meteor.settings.adminUsers.indexOf(userId) > -1);
}

function postToTwitter(hallOfFameId) {
	// construct a tweet with efficient use of characters

	const hofEntry = HallOfFame.findOne(hallOfFameId);

	let charsLeft = 107;

	const acronym = hofEntry.acronym.join('');
	charsLeft -= acronym.length;

	const acro = truncateString(hofEntry.acro, 50);
	charsLeft -= acro.len;

	const category = truncateString(hofEntry.category, charsLeft);
	charsLeft -= category.len;

	let username;
	if (charsLeft > 8) {
		username = truncateString(displayName(hofEntry.userId), charsLeft - 3);
	}

	let tweet = `Category: "${category.str}", Acronym: ${acronym}, Acro: "${acro.str}"`;
	if (username) {
		tweet += ' - ' + username.str;
	}

	console.log(tweet);

	const client = new Twitter({
		consumer_key: Meteor.settings.twitterPoster.consumerKey,
		consumer_secret: Meteor.settings.twitterPoster.consumerSecret,
		access_token_key: Meteor.settings.twitterPoster.accessTokenKey,
		access_token_secret: Meteor.settings.twitterPoster.accessTokenSecret
	});

	client.post('statuses/update', {status: tweet}, function(err, twt, res) {
		if (err)
			return console.error('Error posting to twitter', err);

		console.log('Posted tweet');
	});

	function truncateString(str, len) {
		if (str.length <= len)
			return {str, len: str.length};

		return {str: str.substring(0, len - 1) + '…', len: len};
	}
}