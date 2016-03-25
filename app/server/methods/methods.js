import GameManager from '../imports/GameManager';
import LobbyManager from '../imports/LobbyManager';

import {displayName} from '../../imports/helpers';
import {Games, Lobbies, HallOfFame, Events} from '../../imports/collections';
import {checkValidEmail} from '../../imports/validators';
import {getUserEmail} from '../imports/ServerHelpers';

Meteor.methods({
    joinOrLeaveOfficialLobby(lobbyId, join) {
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
    hallOfFameAcroCount() {
        return HallOfFame.find({active: true}).count();
    },
    hallOfFameUserAcroCount(userId) {
        return HallOfFame.find({userId: userId, active: true}).count();
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

        return (getUserEmail(user) ? true : false);
    }
});