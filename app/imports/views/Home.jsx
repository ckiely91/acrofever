import React from 'react';

import {OnlinePlayers} from '../components/OnlinePlayers';
import {GlobalFeedComponent} from '../components/Feeds';

export const HomeView = React.createClass({
    componentWillMount() {
        lobbySubs.subscribe('lobbies');

        //SEO stuff
        const title = 'Acrofever';
        const description = 'Acrofever is an Acrophobia clone for the modern web. If you never played Acrophobia, it\'s a fun, zany word game in which players create phrases from a randomly generated acronym, then vote for their favourites.';
        const metadata = {
            'description': description,
            'og:description': description,
            'og:title': title,
            'og:image': 'https://acrofever.com/images/fb-image.png',
            'twitter:card': 'summary'
        };

        DocHead.setTitle(title);
        _.each(metadata, function(content, name) {
            DocHead.addMeta({name: name, content: content})
        });
    },
    playNow(evt) {
        evt.preventDefault();
        var dimmer = $('.ui.page.dimmer');
        dimmer.dimmer('show');
        Meteor.call('findPlayNowLobbyId', function(err, res) {
            dimmer.dimmer('hide');
            if (err)
                console.log(err);
            else
                FlowRouter.go(FlowRouter.path('lobby', {lobbyId: res}));
        });
        analytics.track("playNowButton");
    },
    howToPlay(evt) {
        evt.preventDefault();
        $('#howToPlayModal').modal('show');
        analytics.page('howToPlay');
    },
    render() {
        const buttonStyle = {
            clear: 'both'
        };

        return (
            <div className="ui stackable grid">
                <div className="sixteen wide center aligned column">
                    <h1 className="ui header" id="homeHeader">Acrofever!</h1>
                    <div className="row">
                        <button className="big ui primary labeled icon button mobileBottomMargin" style={buttonStyle} onClick={this.playNow}>
                            <i className="lightning icon"></i>
                            Play now
                        </button>
                        <a className="big ui labeled icon button" href={FlowRouter.path('play')}>
                            <i className="search icon"></i>
                            Find a lobby
                        </a>
                        <div className="ui hidden divider"></div>
                    </div>
                    <div className="row">
                        <a className="ui labeled icon button mobileBottomMargin" href={FlowRouter.path('halloffame')}>
                            <i className="trophy icon"></i>
                            Hall of Fame
                        </a>
                        <button className="ui labeled icon button" onClick={this.howToPlay}>
                            <i className="question icon"></i>
                            Learn to play
                        </button>
                    </div>
                    <div className="ui hidden divider"></div>
                </div>
                <div className="eight wide column">
                    <div className="ui raised segment">
                        <OnlinePlayers />
                    </div>
                    <div className="ui raised segment">
                        <h3 className="ui header">What is Acrofever?</h3>
                        <p>Acrofever is an Acrophobia clone for the modern web.</p>
                        <p>If you never played Acrophobia, it's a fun, zany word game in which players create phrases
                            from a randomly generated acronym, then vote for their favourites. The best Acro from each
                            round will score points, and the most popular Acros from a whole game might be immortalised
                            in the Hall of Fame!</p>
                    </div>
                    <div className="ui raised segment">
                        <h3 className="ui header">About</h3>
                        <p>Acrofever was created to be fast, user-friendly and playable on desktops and mobiles. This
                            version has been newly optimised and new features will be added soon. User-created content
                            is not currently moderated so leave any delicate sensibilities at the door!</p>
                        <p>For bug reports, feature requests, feedback or just to say 'I love you', please contact the
                            overlord at <a href="mailto:christian@acrofever.com">christian@acrofever.com</a>.</p>
                    </div>
                </div>
                <div className="eight wide column">
                    <GlobalFeedComponent />
                </div>
            </div>
        )
    }
});