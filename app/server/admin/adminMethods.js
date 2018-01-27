import {HallOfFame, Nags, Events, Categories, Games, Lobbies, BannedIPs} from '../../imports/collections';
import {displayName} from '../../imports/helpers';
import LobbyManager from '../imports/LobbyManager';
import {SendShadowBannedNotification} from '../imports/Emails';
import * as Rankings from '../imports/Rankings';

Meteor.methods({
  isAdminUser() {
    return isAdminUser(this.userId);
  },
  isModerator() {
    return isModerator(this.userId);
  },
  isAdminUserOrModerator() {
    return (isAdminUser(this.userId) || isModerator(this.userId));
  },
  adminEditHallOfFameEntry(id, options) {
    if (!isAdminUser(this.userId) && !isModerator(this.userId))
      throw new Meteor.Error('no-permission', 'You don\'t have permission to do that');

    if (options.deactivate) {
      HallOfFame.update(id, {$set: {active: false, deactivatedBy: this.userId}});
    } else if (options.delete) {
      HallOfFame.update(id, {$set: {deleted: true, deletedBy: this.userId}});
    } else if (options.activate) {
      HallOfFame.update(id, {$set: {active: true, activatedBy: this.userId}});
    }
  },
  adminEditCategory(id, options) {
    if (!isAdminUser(this.userId) && !isModerator(this.userId))
      throw new Meteor.Error('no-permission', 'You don\'t have permission to do that');

    if (options.deactivate) {
      Categories.update(id, {$set: {active: false, deactivatedBy: this.userId}});
    } else if (options.delete) {
      Categories.update(id, {$set: {deleted: true, deletedBy: this.userId}});
    } else if (options.activate) {
      Categories.update(id, {$set: {active: true, activatedBy: this.userId}});
    } else if (options.edit) {
      Categories.update(id, {$set: {category: options.category, editedBy: this.userId}});
    }
  },
  adminAddCategory(category) {
    if (!isAdminUser(this.userId) && !isModerator(this.userId))
      throw new Meteor.Error('no-permission', 'You don\'t have permission to do that');

    if (category.length > 0) {
      Categories.upsert(
        {category},
        {
          $setOnInsert: {
            custom: true,
            active: true,
            userId: this.userId,
            createdAt: new Date()
          }
        }
      );
    }
  },
  adminAddNag(fields) {
    if (!isAdminUser(this.userId))
      throw new Meteor.Error('no-permission', 'You don\'t have permission to do that');

    const nag = {
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
    });
  },
  adminShadowbanUser(userId, ban, reason) {
    if (!(isAdminUser(this.userId) || isModerator(this.userId)))
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

    const username = displayName(userId, true);

    // Remove them from all active lobbies
    Lobbies.find({ players: userId }, { fields: { _id: true }}).forEach((lobby) => {
      Lobbies.update(lobby._id, { $pull: { players: userId }});
      LobbyManager.addSystemMessage(lobby._id, username + ' was banned for abuse');
    });

    SendShadowBannedNotification(userId, this.userId, reason, ban);
  },
  adminMakeModerator(userId, isModerator, addSpecialTag) {
    if (!isAdminUser(this.userId))
      throw new Meteor.Error('no-permission', 'You don\'t have permission to do that');

    const setObj = {};

    if (isModerator === true) {
      setObj["$set"] = {
        'profile.moderator': true
      };

      if (addSpecialTag === true) {
        setObj["$addToSet"] = {
          'profile.specialTags': {
            tag: 'Mod',
            color: 'grey'
          }
        };
      }
    } else {
      setObj["$unset"] = {
        'profile.moderator': true
      };
    }

    Meteor.users.update(userId, setObj);
  },
  adminBanIp(ipAddr) {
    if (!isAdminUser(this.userId))
      throw new Meteor.Error('no-permission', 'You don\'t have permission to do that');

    BannedIPs.upsert({ ip: ipAddr }, { $set: { ip: ipAddr } });
  },
  adminVerifyAllEmails() {
    if (!isAdminUser(this.userId))
      throw new Meteor.Error('no-permission', 'You don\'t have permission to do that');

    Meteor.users.update({
      'emails.0': { $exists: true },
      'profile.shadowbanned': { $ne: true},
      'profile.permabanned': { $ne: true }
    }, {
      $set: {
        'emails.0.verified': true
      }
    }, {
      multi: true
    });
  }
});

function isAdminUser(userId) {
  return (Meteor.settings.adminUsers.indexOf(userId) > -1);
}

function isModerator(userId) {
  const user = Meteor.users.findOne(userId, {fields: {profile: true}});
  return _.get(user, 'profile.moderator', false) === true;
}