Meteor.startup(function() {
	// login service configuration
	ServiceConfiguration.configurations.update(
		{ "service": "facebook" },
		{
			$set: {
				"appId": Meteor.settings.facebook.appId,
				"secret": Meteor.settings.facebook.appSecret
			}
		},
		{ upsert: true }
    );

    ServiceConfiguration.configurations.update(
    	{ service : "twitter" },
    	{
    		$set: {
    			consumerKey: Meteor.settings.twitter.consumerKey,
    			secret: Meteor.settings.twitter.secret
    		}
    	},
    	{ upsert: true }
    );

    ServiceConfiguration.configurations.update(
    	{ service : "google" },
    	{
    		$set: {
    			clientId: Meteor.settings.google.clientId,
    			secret: Meteor.settings.google.secret
    		}
    	},
    	{ upsert: true }
    );
});

Accounts.onCreateUser(function(options, user) {
	if (options.profile)
		user.profile = options.profile;
	else
		user.profile = {};

	var email,
		firstName,
		lastName,
		profilePicture = {};

	if (user.services.password) {
		// see if they have a gravatar
		email = user.emails[0].address;
		firstName = user.username;
		lastName = '';
		profilePicture.type = 'gravatar';
		profilePicture.url = Gravatar.imageUrl(email, {secure: true, default: 'mm'});
	} else if (user.services.facebook) {
		email = user.services.facebook.email;
		firstName = user.services.facebook.first_name;
		lastName = user.services.facebook.last_name;
		profilePicture.type = 'facebook';
		profilePicture.url = 'https://graph.facebook.com/v2.3/' + user.services.facebook.id + '/picture';
	} else if (user.services.google) {
		email = user.services.google.email;
		firstName = user.services.google.given_name;
		lastName = user.services.google.family_name;
		profilePicture.type = 'google';
		profilePicture.url = user.services.google.picture;
	} else if (user.services.twitter) {
		email = user.services.twitter.email;
		firstName = '';
		lastName = '';
		profilePicture.type = 'twitter';
		profilePicture.url = user.services.twitter.profile_image_url_https;
	}

	user.profile.profilePicture = profilePicture;

	//if they have an email address, add user to MailChimp list
	if (email && !Meteor.settings.development) {
		HTTP.call("POST", "https://" + Meteor.settings.mailchimp.dataCenter + ".api.mailchimp.com/3.0/lists/" + Meteor.settings.mailchimp.listId + "/members/", 
			{data: {
				"email_address": email,
				"status": "subscribed",
				"merge_fields": {
					"FNAME": firstName,
					"LNAME": lastName,
				}
			},
			auth: Meteor.settings.mailchimp.username + ":" + Meteor.settings.mailchimp.apiKey },
			function(error, result) {
				if (error) {
					console.log("Error adding user to MailChimp list");
					console.log(error);
				} else {
					console.log("Successfully added user to MailChimp list");
				}
			});
	}

	return user;
});