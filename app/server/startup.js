import {CronJob} from 'cron';

import GameManager from './imports/GameManager';
import LobbyManager from './imports/LobbyManager';
import {SendReminderEmails} from './imports/Emails';
import {UpdateRecurringEvents} from './imports/Events';

import {Games, Lobbies, Events} from '../imports/collections';

Meteor.startup(function() {
	//Loggly initialisation
	Logger = new Loggly({
		token: Meteor.settings.loggly.token,
		subdomain: Meteor.settings.loggly.subdomain,
		auth: {
			username: Meteor.settings.loggly.username,
			password: Meteor.settings.loggly.password
		},
		json: true
	});
	
	_.each(DefaultLobbies, function(lobby) {
		Lobbies.upsert({name: lobby.name}, {$setOnInsert: lobby});
		
		var insertedLobby = Lobbies.findOne({name: lobby.name});
		
		if (!insertedLobby.currentGame) {
			//insert first game
			var gameId = Games.insert({
				type: 'acrofever',
			    lobbyId: insertedLobby._id,
			    active: false,
			    currentPhase: 'category',
			    currentRound: 0,
			    endTime: null
			});
			Lobbies.update(insertedLobby._id, {$set: {currentGame: gameId}, $push: {games: gameId}});
		} else {
			//game may be in progress, we should end it so timeouts will work properly

			var active = Games.findOne(insertedLobby.currentGame, {fields: {active: true}}).active;
			if (active) {
				Lobbies.update(insertedLobby._id, {$set: {players: []}});
                LobbyManager.addSystemMessage(insertedLobby._id, 'Sorry, the current game was cancelled because of a server restart.', 'warning', 'Please rejoin the lobby to start a new game.');
				GameManager.makeGameInactive(insertedLobby.currentGame);
			}
		}
	});
});

//start cron jobs

const eventRemindersJob = new CronJob({
    cronTime: "*/15 * * * *", // every 15 minutes
    onTick: Meteor.bindEnvironment(SendReminderEmails),
    start: true,
    runOnInit: true
});

const updateRecurringEventsJob = new CronJob({
    cronTime: '1,16,31,46 * * * *', // one minute past every 15 min interval
    onTick: Meteor.bindEnvironment(UpdateRecurringEvents),
    start: true
});