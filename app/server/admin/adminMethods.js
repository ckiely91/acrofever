import {HallOfFame, Nags, Events} from '../../imports/collections';
import {displayName} from '../../imports/helpers';
import Twitter from 'twitter';

Meteor.methods({
	isAdminUser() {
		return isAdminUser(this.userId);
	},
	adminEditHallOfFameEntry(id, options) {
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
	adminAddNag(fields) {
		if (!isAdminUser(this.userId))
			throw new Meteor.Error('no-permission', 'You don\'t have permission to do that');

		var nag = {
			timestamp: new Date()
		};

		if (fields.title.length > 0) nag.title = fields.title; 
		if (fields.message.length > 0) nag.message = fields.message; 
		if (fields.icon.length > 0) nag.icon = fields.icon;
		if (fields.colour.length > 0) nag.colour = fields.colour;
		if (fields.active) nag.active = true;

		Nags.insert(nag); 
	},
	adminEditNag(id, action) {
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
	adminAddEvent(fields) {
        if (!isAdminUser(this.userId))
            throw new Meteor.Error('no-permission', 'You don\'t have permission to do that');

        fields.creator = this.userId;
        Events.insert(fields);
	},
	adminDeleteEvent(eventId) {
		if (!isAdminUser(this.userId))
			throw new Meteor.Error('no-permission', 'You don\'t have permission to do that');

		Events.remove(eventId);
	},
	adminAddSpecialTag(userId, specialTag) {
		if (!isAdminUser(this.userId))
			throw new Meteor.Error('no-permission', 'You don\'t have permission to do that');

		check(userId, String);
		check(specialTag, {
			tag: String,
			color: String
		});

		Meteor.users.update(userId, {$addToSet: {'profile.specialTags': specialTag}});
	}
});

function isAdminUser(userId) {
	return (Meteor.settings.adminUsers.indexOf(userId) > -1);
}

function postToTwitter(hallOfFameId) {
	// construct a tweet with efficient use of characters

	const hofEntry = HallOfFame.findOne(hallOfFameId);

	let charsLeft = 127;

	const acronym = hofEntry.acronym.join('');
	charsLeft -= acronym.length;

	const acro = truncateString(hofEntry.acro, 70);
	charsLeft -= acro.len;

	const category = truncateString(hofEntry.category, charsLeft);
	charsLeft -= category.len;

	let username;
	if (charsLeft > 8) {
		username = truncateString(displayName(hofEntry.userId), charsLeft - 5);
	}

	// Who should be the next pres? (ACRO) - "Donal Trump Obvs", by Christian
	let tweet = `${category.str} (${acronym}) - "${acro.str}"`;
	if (username) {
		tweet += ', by ' + username.str;
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