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

FlowRouter.route('/halloffame', {
  name: 'halloffame',
  action: function() {
    BlazeLayout.render('masterLayout', {
      main: 'hallOfFame'
    });
  }
});

var adminRoutes = FlowRouter.group({
  prefix: '/admin',
  name: 'admin',
  triggersEnter: [AccountsTemplates.ensureSignedIn]
});

adminRoutes.route('/', {
  name: 'adminHome',
  action: function() {
    BlazeLayout.render('masterLayout', {
      main: 'adminMain',
      subTemplate: 'adminHome'
    });
  }
});

adminRoutes.route('/halloffame', {
  name: 'adminHallOfFame',
  action: function() {
    BlazeLayout.render('masterLayout', {
      main: 'adminMain',
      subTemplate: 'adminHallOfFame'
    });
  }
});

adminRoutes.route('/nags', {
  name: 'adminNags',
  action: function() {
    BlazeLayout.render('masterLayout', {
      main: 'adminMain',
      subTemplate: 'adminNags'
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