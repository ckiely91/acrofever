FlowRouter.route('/', {
	name: "home",
  action: function(params, queryParams) {
    BlazeLayout.render('masterLayout', {
      main: "home"
    });
  }
});

var lobbyRoutes = FlowRouter.group({
	prefix: '/play',
	name: 'lobbies'
});

lobbyRoutes.route('/', {
	name: 'play',
	action: function() {
		BlazeLayout.render('masterLayout', { 
      main: 'play' 
    });
	}
});

lobbyRoutes.route('/:lobbyId', {
	name: 'lobby',
  triggersEnter: [AccountsTemplates.ensureSignedIn],
	action: function() {
		BlazeLayout.render('masterLayout', { 
      main: 'lobby' 
    });
	}
});


FlowRouter.notFound = {
  action: function() {
    BlazeLayout.render('masterLayout', {
      main: "pageNotFound"
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