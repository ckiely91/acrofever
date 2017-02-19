import {HallOfFame, Nags, Events, Categories, Games} from '../../imports/collections';
import * as Rankings from '../imports/Rankings';

Meteor.methods({
	isAdminUser() {
		return isAdminUser(this.userId);
	},
	adminEditHallOfFameEntry(id, options) {
		if (!isAdminUser(this.userId))
			throw new Meteor.Error('no-permission', 'You don\'t have permission to do that');

		if (options.deactivate) {
			HallOfFame.update(id, {$set: {active: false}});
		} else if (options.delete) {
			HallOfFame.remove(id);
		} else if (options.activate) {
			HallOfFame.update(id, {$set: {active: true}});
		}
	},
    adminEditCategory(id, options) {
        if (!isAdminUser(this.userId))
            throw new Meteor.Error('no-permission', 'You don\'t have permission to do that');

        if (options.deactivate) {
            Categories.update(id, {$set: {active: false}});
        } else if (options.delete) {
            Categories.remove(id);
        } else if (options.activate) {
            Categories.update(id, {$set: {active: true}});
        } else if (options.edit) {
        	Categories.update(id, {$set: {category: options.category}});
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
	},
    adminClearAllRankings() {
        if (!isAdminUser(this.userId))
            throw new Meteor.Error('no-permission', 'You don\'t have permission to do that');

        Rankings.ClearAllRankings();
    },
    adminRecalculateAllRankings() {
        if (!isAdminUser(this.userId))
            throw new Meteor.Error('no-permission', 'You don\'t have permission to do that');

	    Rankings.RecalculateAllRankings();
    },
	adminRecalculateUserStats() {
        if (!isAdminUser(this.userId))
            throw new Meteor.Error('no-permission', 'You don\'t have permission to do that');

        const curs = Meteor.users.find({});
        const total = curs.count();

        let curUser= 0;
        curs.forEach(user => {
        	const selector = {gameWinner: {$exists: true}};
        	selector['scores.' + user._id] = {$exists: true};
        	const playedGames = Games.find(selector).count();
        	const wonGames = Games.find({gameWinner: user._id}).count();

        	Meteor.users.update(user._id, {$set: {'profile.stats': {gamesPlayed: playedGames, gamesWon: wonGames}}});

        	curUser++;
        	console.log("recalculated for user " + curUser + " of " + total);
		});
	},
	adminShadowbanUser(userId, ban) {
        if (!isAdminUser(this.userId))
            throw new Meteor.Error('no-permission', 'You don\'t have permission to do that');

        if (ban === true) {
        	Meteor.users.update(userId, {
        		$set: {
        			'profile.shadowbanned': true
				}
			});
		} else {
        	Meteor.users.update(userId, {
        		$unset: {
        			'profile.shadowbanned': true
				}
			});
		}
	}
});

function isAdminUser(userId) {
	return (Meteor.settings.adminUsers.indexOf(userId) > -1);
}