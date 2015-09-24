Router.configure({
	layoutTemplate: 'standard',
	loadingTemplate: 'loading'
});

Router.route('/', {
	action: function() {
		this.render('home');
	}
});

Router.route('/play/', {
	waitOn: function() {
		return [Meteor.subscribe('officialLobbiesList'), Meteor.subscribe('customLobbiesList', 20)];
	},
	action: function() {
		this.render('lobbyBrowser');
	}
});

Router.route('/play/:lobbyId', {
	waitOn: function() {
		return Meteor.subscribe('singleLobby', this.params.lobbyId);
	},
	action: function() {
		this.render('gameLobby');
	},
	data: function() {
		var data = {
			lobbyId: this.params.lobbyId
		};
		return data;
	}
});