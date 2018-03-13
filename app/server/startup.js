import {CronJob} from 'cron';
import prerenderio from 'prerender-node';
import timesyncServer from 'timesync/server';

import AcrofeverGameManager from './imports/AcrofeverGameManager';
import LobbyManager from './imports/LobbyManager';
import {SendReminderEmails} from './imports/Emails';
import {UpdateRecurringEvents} from './imports/Events';
import {DecayUserSigmaForMonth} from './imports/Rankings';
import PostToTwitter from './imports/PostToTwitter';

import {Games, Lobbies, Categories, BannedIPs} from '../imports/collections';
import {defaultCategories} from '../imports/statics';

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

	//Prerender initialisation
	const prerenderSettings = Meteor.settings.prerenderio;
	if (prerenderSettings && prerenderSettings.token && prerenderSettings.host) {
		prerenderio.set('prerenderToken', prerenderSettings.token);
		prerenderio.set('host', prerenderSettings.host);
		prerenderio.set('protocol', 'https');
		WebApp.rawConnectHandlers.use(prerenderio);
	}
	
	_.each(DefaultLobbies, lobby => {
		Lobbies.upsert({name: lobby.name}, {$setOnInsert: lobby});
		
		const insertedLobby = Lobbies.findOne({name: lobby.name});
		
		if (!insertedLobby.currentGame) {
			//insert first game
			const gameId = Games.insert({
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
			const game = Games.findOne(insertedLobby.currentGame, {fields: {active: true}});
			const active = game && game.active;
			if (active) {
				Lobbies.update(insertedLobby._id, {$set: {players: []}});
                LobbyManager.addSystemMessage(insertedLobby._id, 'Sorry, the current game was cancelled because of a server restart.', 'warning', 'Please rejoin the lobby to start a new game.');
				AcrofeverGameManager.makeGameInactive(insertedLobby.currentGame);
			}
		}
	});

	// Insert all default categories if they don't exist
    const currentDate = new Date();
	_.each(defaultCategories, category => {
	     Categories.upsert({
	         category
         }, {
	         $setOnInsert: {
	             category,
                 custom: false,
                 active: true,
                 createdAt: currentDate
             }
         });
    });
});

// Block banned IPs
Meteor.onConnection(connection => {
	if (connection.clientAddress && BannedIPs.findOne({ ip: connection.clientAddress })) {
    console.log("CLOSING CONNECTION FROM " + connection.clientAddress);
		connection.close();
	}
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

const postToTwitterJob = new CronJob({
	cronTime: "0 */3 * * *", // every 3 hours
	onTick: Meteor.bindEnvironment(PostToTwitter),
	start: true,
	runOnInit: true
});

const decayRankingsJob = new CronJob({
	cronTime: '0 3 1 * *', // 3am, 1st of every month
	onTick: Meteor.bindEnvironment(DecayUserSigmaForMonth),
	start: true
});

WebApp.connectHandlers.use("/timesync", timesyncServer.requestHandler);
