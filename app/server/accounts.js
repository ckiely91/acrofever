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

Accounts.emailTemplates.from = 'no-reply@acrofever.com';
Accounts.emailTemplates.siteName = 'Acrofever'; 

Accounts.onCreateUser(function(options, user) {
	if (options.profile)
		user.profile = options.profile;
	else
		user.profile = {};

	var userDetails = getUserDetails(user);
	user.profile.profilePicture = userDetails.profilePicture;

	//if they have an email address, add user to MailChimp list
	if (userDetails.email && !Meteor.settings.development) {
		HTTP.call("POST", "https://" + Meteor.settings.mailchimp.dataCenter + ".api.mailchimp.com/3.0/lists/" + Meteor.settings.mailchimp.listId + "/members/", 
			{data: {
				"email_address": userDetails.email,
				"status": "subscribed",
				"merge_fields": {
					"FNAME": userDetails.firstName,
					"LNAME": userDetails.lastName
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

Accounts.onLogin(function(details) {
	if (!details.user.profile || !details.user.profile.profilePicture) {
		var userDetails = getUserDetails(details.user);
		Meteor.users.update(details.user._id, {$set: {'profile.profilePicture': userDetails.profilePicture}})
	}
});

function getUserDetails(user) {
	var obj = {
		email: null,
		firstName: null,
		lastName: null,
		profilePicture: {}
	};

	if (user.services.password) {
		// see if they have a gravatar
		obj.email = user.emails[0].address;
		obj.firstName = user.username;
		obj.lastName = '';
		obj.profilePicture.type = 'gravatar';
		obj.profilePicture.url = Gravatar.imageUrl(obj.email, {secure: true, default: 'mm'});
	} else if (user.services.facebook) {
		obj.email = user.services.facebook.email;
		obj.firstName = user.services.facebook.first_name;
		obj.lastName = user.services.facebook.last_name;
		obj.profilePicture.type = 'facebook';
		obj.profilePicture.url = 'https://graph.facebook.com/v2.3/' + user.services.facebook.id + '/picture';
	} else if (user.services.google) {
		obj.email = user.services.google.email;
		obj.firstName = user.services.google.given_name;
		obj.lastName = user.services.google.family_name;
		obj.profilePicture.type = 'google';
		obj.profilePicture.url = user.services.google.picture;
	} else if (user.services.twitter) {
		obj.email = user.services.twitter.email;
		obj.firstName = '';
		obj.lastName = '';
		obj.profilePicture.type = 'twitter';
		obj.profilePicture.url = user.services.twitter.profile_image_url_https;
	}
	return obj;
}