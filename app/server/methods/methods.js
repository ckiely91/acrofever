import GameManager from '../imports/AcrofeverGameManager';
import LobbyManager from '../imports/LobbyManager';

import {displayName} from '../../imports/helpers';
import {Games, Lobbies, HallOfFame, Events} from '../../imports/collections';
import {checkValidEmail} from '../../imports/validators';
import {countryTags} from '../../imports/statics';
import {getUserEmail} from '../imports/ServerHelpers';
import {SendInviteEmail} from '../imports/Emails';
import {IsRankedGameForUser} from '../imports/Rankings';

Meteor.methods({
    joinOrLeaveOfficialLobby(lobbyId, join) {
        check(lobbyId, String);
        if (typeof join !== "undefined")
            check(join, Boolean);

        var userId = Meteor.userId();
        if (!userId)
            throw new Meteor.Error('403', 'You must be logged in to do that');

        var lobby = Lobbies.findOne(lobbyId);
        if (!lobby || !lobby.official)
            throw new Meteor.Error('No valid lobby');

        if (join) {
            //user is joining the lobby
            Lobbies.update(lobbyId, {$addToSet: {players: userId}});
            let username = displayName(userId, true);
            LobbyManager.addSystemMessage(lobbyId, username + ' joined the lobby.');
            LobbyManager.addSystemMessage(null, username + ' joined the lobby ' + lobby.displayName);

            //refresh lobby
            lobby = Lobbies.findOne(lobbyId);
            var game = Games.findOne(lobby.currentGame);

            if (!game.active && !lobby.newGameStarting && lobby.players.length >= Meteor.settings[game.type].minimumPlayers) {
                //game is inactive but we now have the minimum players. Start the game!

                GameManager.makeGameActive(lobby.currentGame);
            }

        } else {
            //user is leaving the lobby
            Lobbies.update(lobbyId, {$pull: {players: userId}});
            let username = displayName(userId, true);
            LobbyManager.addSystemMessage(lobbyId, username + ' left the lobby.');
            LobbyManager.addSystemMessage(null, username + ' left the lobby ' + lobby.displayName);
            //lobby should only be made inactive at the end of the round
        }
    },
    hallOfFameAcroCount(userId) {
        if (userId) {
            check(userId, String);
            return HallOfFame.find({userId: userId, active: true}).count();
        } else {
            return HallOfFame.find({active: true}).count();   
        }
    },
    changeEmailAddress(email) {
        if (!this.userId)
            throw new Meteor.Error(403, 'You don\'t have permission to do that.');

        check(email, checkValidEmail);

        const user = Meteor.users.findOne(this.userId);
        let oldEmail;

        if (user.emails && user.emails.length > 0) {
            oldEmail = user.emails[0].address;
            try {
                Accounts.removeEmail(this.userId, oldEmail);
            } catch(e) {
                console.log(`Error removing email address: ${e}`);
                throw new Meteor.Error('unknown-error', 'Internal server error');
            }
        }

        try {
            Accounts.addEmail(this.userId, email);
        } catch(e) {
            console.log(`Error adding email address: ${e}`);
            throw new Meteor.Error('email-in-use', 'That email address is already in use.');
        }
    },
    registerForReminder(eventId, deregister) {
        check(eventId, String);
        if (typeof deregister !== "undefined")
            check(deregister, Boolean);

        if (!this.userId)
            throw new Meteor.Error(403, 'You don\'t have permission to do that.');

        const event = Events.findOne(eventId);

        if (!event)
            throw new Meteor.Error('no-event', 'That event does not exist');

        const user = Meteor.users.findOne(this.userId);

        if (!((user.emails && user.emails.length > 0) || user.services.facebook || user.services.google))
            throw new Meteor.Error('no-email-address', 'You must have an email address set to do that');

        if (deregister === true) {
            Events.update(eventId, {$pull: {users: this.userId}});
        } else {
            Events.update(eventId, {$addToSet: {users: this.userId}});
        }
    },
    isEmailAddressSet() {
        if (!this.userId)
            throw new Meteor.Error(403, 'You don\'t have permission to do that.');

        const user = Meteor.users.findOne(this.userId);

        return !!getUserEmail(user);
    },
    getUserStat(userId, statType) {
        check(userId, String);
        check(statType, String);

        switch(statType) {
            case 'gamesPlayed':
                var stats = {};

                var selector = {};
                selector['scores.' + userId] = {$exists: true};
                selector.gameWinner = {$exists: true};

                var games = Games.find(selector, {
                    sort: {created: 1},
                    fields: {
                        created: true,
                        gameWinner: true,
                        rounds: true
                    }}).fetch();
                
                if (games.length === 0) {
                    return;
                }

                _.each(games, game => {
                    // Determine if a ranked game
                    if (!IsRankedGameForUser(game.rounds, userId)) return;

                    const day = moment(game.created).format('YYYY-MM-DD');

                    if (stats[day]) {
                        stats[day].played++;
                        if (game.gameWinner === userId)
                            stats[day].won++;
                    } else {
                        const keys = Object.keys(stats);
                        stats[day] = {};
                        if (keys.length > 0) {
                            const prevStats = stats[keys[keys.length - 1]];
                            stats[day].played = prevStats.played + 1;
                            if (game.gameWinner === userId)
                                stats[day].won = prevStats.won + 1;
                            else
                                stats[day].won = prevStats.won;
                        } else {
                            stats[day].played = 1;
                            if (game.gameWinner === userId)
                                stats[day].won = 1;
                            else
                                stats[day].won = 0;
                        }
                    }
                });

                const formattedStats = {};
                _.each(stats, function(value, key) {
                    const newKey = moment(key, 'YYYY-MM-DD').valueOf();
                    if (value.won > 0) {
                        value.winRate = Math.round(value.won / value.played * 100);
                    } else {
                        value.winRate = 0;
                    }

                    formattedStats[newKey] = value;
                });

                return formattedStats;
            case 'averageScoreAndRating':
                const scoresArr = [],
                    averageArr = [];

                var selector = {};
                selector['scores.' + userId] = {$gt: 0};
                selector.gameWinner = {$exists: true};

                var games = Games.find(selector, {sort: {created: 1}, fields: {created: true, scores: true}});

                if (games.count() === 0) {
                    return;
                }

                let gamesCount = 0,
                    scoreSum = 0;

                games.forEach((game) => {
                    const score = game.scores[userId],
                        time = moment(game.created).valueOf();
                    scoreSum += score;
                    gamesCount++;
                    scoresArr.push([time, score]);
                    const avg = Math.round(scoreSum / gamesCount * 100) / 100;
                    averageArr.push([time, avg]);
                });

                const user = Meteor.users.findOne(userId, {fields: {trueskillHistory: true}});

                return {scoresArr, averageArr, ratingArr: user.trueskillHistory};
            case 'ranking':
                const cursor = Meteor.users.find({
                    'profile.trueskill.rankedGames': {$gte: Meteor.settings.public.leaderboardMinimumGamesToBeVisible}
                }, {
                    sort: {'profile.trueskill.skillEstimate': -1},
                    fields: {
                        _id: true
                    }
                });
                const total = cursor.count();

                const users = cursor.fetch();

                let i = 0;
                for (; i < total; i++) {
                    if (users[i]._id === userId)
                        return {total, rank: i + 1};
                }

                return false;
            default:
                throw new Meteor.Error('invalid-stat-type', 'Invalid stat type requested');
        }
    },
    inviteToPlay(userId, lobbyId) {
        check(userId, String);
        check(lobbyId, String);
        if (!this.userId)
            throw new Meteor.Error(403, 'You must be logged in to do that');

        if (userId === this.userId)
            throw new Meteor.Error('cant-invite-self', 'You can\'t invite yourself');

        const inviter = Meteor.users.findOne(this.userId),
            user = Meteor.users.findOne(userId),
            lobby = Lobbies.findOne(lobbyId);

        if (!user)
            throw new Meteor.Error('user-not-found', 'User not found');

        if (!lobby)
            throw new Meteor.Error('lobby-not-found', 'Lobby not found');

        if (user.invitesSent && user.invitesSent[this.userId]) {
            const thresh = moment().subtract(1, 'h');
            if (moment(user.invitesSent[this.userId]).isAfter(thresh)) {
                throw new Meteor.Error('too-many-invites', 'You\'ve already sent an invite to this user.');
            }
        }

        // Send user an email
        SendInviteEmail(user, lobby, this.userId);

        // Update invitesSent on invited user
        const modifier = {};
        modifier['invitesSent.' + this.userId] = true;

        Meteor.users.update(userId, {$currentDate: modifier});

    },
    changeUsername(username) {
        check(username, String);
        if (!this.userId)
            throw new Meteor.Error(403, 'You must be logged in to do that');

        if (username.length > 20)
            throw new Meteor.Error('username-too-long', 'Username cannot be longer than 20 characters');

        username = username.trim();

        if (Meteor.users.find({_id: {$ne: this.userId}, username: username}).count() > 0)
            throw new Meteor.Error('username-taken', 'Username is already taken');

        Meteor.users.update(this.userId, {$set: {username: username}});
    },
    changeCountry(country) {
        check(country, String);
        if (!this.userId)
            throw new Meteor.Error(403, 'You must be logged in to do that');

        if (country === "") {
            // Remove user's country
            Meteor.users.update(this.userId, {$unset: {'profile.country': ""}});
        } else {
            // Check if it's in the list of countries
            if (countryTags.filter(c => c.code === country).length > 0) {
                Meteor.users.update(this.userId, {$set: {'profile.country': country}});
            } else {
                throw new Meteor.Error('invalid-data', 'Invalid country');
            }
        }
    },
    addFriend(userId) {
        check(userId, String);
        if (!this.userId)
            throw new Meteor.Error(403, 'You must be logged in to do that');
        
        if (userId === this.userId)
            throw new Meteor.Error('cannot-add-self', 'You can\'t be friends with yourself');

        if (Meteor.users.find({_id: userId}).count() === 0)
            throw new Meteor.Error('user-doesnt-exist', 'User doesn\'t exist');

        Meteor.users.update(this.userId, {$addToSet: {'profile.friends': userId}});
    },
    removeFriend(userId) {
        check(userId, String);
        if (!this.userId)
            throw new Meteor.Error(403, 'You must be logged in to do that');

        const thisUser = Meteor.users.findOne(this.userId, {fields: {'profile.friends': true}});

        if (thisUser.profile && thisUser.profile.friends && thisUser.profile.friends.indexOf(userId) === -1)
            throw new Meteor.Error('not-friends', 'Not friends with that user');

        Meteor.users.update(this.userId, {$pull: {'profile.friends': userId}});
    },
    getSampleHofEntries(size) {
        if (!size || size > 5)
            size = 5;

        // Get a sample of 5 HOF entries
        return HallOfFame.aggregate([
            {$match: {active: true}},
            {$sample: {size}}
        ]);
    },
    getTotalRankedCount() {
        return Meteor.users.find({
            'profile.trueskill.rankedGames': {$gte: Meteor.settings.public.leaderboardMinimumGamesToBeVisible}
        }).count();
    }
});