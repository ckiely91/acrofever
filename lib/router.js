FlowRouter.route('/', {
	name: 'home',
	action: function() {
		BlazeLayout.render('global', { main: 'home' });
	}
});

var lobbyRoutes = FlowRouter.group({
	prefix: '/play/',
	name: 'lobbies'
});

lobbyRoutes.route('/', {
	name: 'play',
	action: function() {
		BlazeLayout.render('global', { main: 'play' });
	}
});

lobbyRoutes.route('/:lobbyId', {
	name: 'lobby',
	action: function() {
		BlazeLayout.render('global', { main: 'lobby' });
	}
});