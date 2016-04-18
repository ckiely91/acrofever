/*
export function replaceLinksAndEscape(input) {
    var autolinkedInput = Autolinker.link(input, {
        truncate: {
            length: 32,
            location: 'smart'
        },
        replaceFn(autolinker, match) {
            switch(match.getType()) {
                case 'url':
                    var tag = autolinker.getTagBuilder().build(match);
                    tag.setAttr( 'rel', 'nofollow' );
                    tag.addClass( 'external-link' );
                    return tag;
                default:
                    return true;
            }
        }
    });

    //escape except allowed tags
    autolinkedInput = '<div>' + autolinkedInput + '</div>';

    $autolinkedInput = $(autolinkedInput);
    var $elements = $autolinkedInput.find("*").not("a,img,br");
    for (var i = $elements.length - 1; i >= 0; i--) {
        var e = $elements[i];
        $(e).replaceWith(e.innerHTML);
    }
    return $autolinkedInput.html();
}
*/

export function notify(title, body, image) {
    if (typeof Notification === 'undefined')
        return;

    var user = Meteor.user();
    if (user.profile.notificationsEnabled === false)
        return;

    if (document.hidden && Notification.permission === "granted") {
        var n = new Notification(title, {
            icon: image || 'https://acrofever.com/apple-icon-180x180.png',
            body: body,
            lang: 'en-US'
        });
        setTimeout(n.close.bind(n), 4000);
    } else if (Notification.permission === "default") {
        console.log('default permission');
        Notification.requestPermission(function(result) {
            if (result === 'granted') {
                Meteor.call('toggleNotifications', true);
                acrofeverAnalytics.track("allowNotifications");
            } else if (result === 'denied') {
                Meteor.call('toggleNotifications', false);
                acrofeverAnalytics.track("denyNotifications");
            }
        });
    }
}

export function playSound(filename, hiddenOnly) {
    if ((hiddenOnly && !document.hidden) || Meteor.user().profile.soundsEnabled === false)
        return;

    var sound = new buzz.sound('/sounds/' + filename, {
        formats: ['ogg', 'mp3'],
        volume: 50
    });

    sound.play();
}

export function profilePicture(id, size) {
    var user = Meteor.users.findOne(id);

    if (!user || !user.profile || !user.profile.profilePicture)
        return '/images/no-profile-pic.png';

    if (!size)
        var size = 100;

    var type = user.profile.profilePicture.type,
        url = user.profile.profilePicture.url,
        newUrl;

    switch (type) {
        case 'gravatar':
            newUrl = URI(url).addSearch({ size: size}).toString();
            break;
        case 'facebook':
            newUrl = URI(url).addSearch({height: size, width: size}).toString();
            break;
        case 'google':
            newUrl = URI(url).addSearch({sz: size}).toString();
            break;
        case 'twitter':
            if (size <= 24) {
                size = "_mini";
            } else if (size <= 48) {
                size = "_normal";
            } else if (size <= 73) {
                size = "_bigger";
            } else {
                //risky - this file could be massive!
                size = "";
            }
            newUrl = url.replace("_normal",size);
            break;
        default:
            newUrl = '/images/no-profile-pic.png';
    }
    return newUrl;
}

export function displayName(id, capitalise) {
    var user = Meteor.users.findOne(id);
    if (!user) {
        return;
    }

    if (user.profile && user.profile.name) {
        var displayname = user.profile.name.split(' ')[0];
    } else {
        var displayname = user.username;
    }

    if (capitalise == true) {
        return s(displayname).capitalize().value();
    }
    return displayname;
}

export const acrofeverAnalytics = {
    track(event, obj) {
        if (typeof analytics === "object")
            analytics.track(event, obj);
    },
    page(page, obj) {
        if (typeof analytics === "object")
            analytics.page(page, obj);
    }
};