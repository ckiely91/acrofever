FlowRouter.route('/', {
	name: "home",
  action: function(params, queryParams) {
    BlazeLayout.render('masterLayout', {
      footer: "footer",
      main: "home",
      nav: "nav",
    });
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


FlowRouter.notFound = {
  action: function() {
    BlazeLayout.render('masterLayout', {
      footer: "footer",
      main: "pageNotFound",
      nav: "nav",
    });
  }
};

//Routes
AccountsTemplates.configureRoute('changePwd');
AccountsTemplates.configureRoute('forgotPwd');
AccountsTemplates.configureRoute('resetPwd');
AccountsTemplates.configureRoute('signIn');
AccountsTemplates.configureRoute('signUp');
AccountsTemplates.configureRoute('verifyEmail');