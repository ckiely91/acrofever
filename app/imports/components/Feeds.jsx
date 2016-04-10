import React from 'react';
import {autolink} from 'react-autolink';
import {emojify} from 'react-emojione';
import EmojiPicker from 'emojione-picker';

import {MomentFromNow} from './Countdown';
import {playSound, profilePicture, displayName} from '../helpers';
import {GlobalFeed, LobbyFeed} from '../collections';

class ChatInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showEmojiPicker: false
        };
        this.watchForClicks = this.watchForClicks.bind(this);
    }

    handleSubmit(evt) {
        evt.preventDefault();
        if (Meteor.userId()) {
            var form = $(evt.currentTarget);
            var message = form.form('get values').message;

            if (this.props.lobbyId) {
                Meteor.call('addLobbyFeedChat', this.props.lobbyId, message);
                analytics.track("addLobbyChat", {
                    lobbyId: this.props.lobbyId,
                    message: message
                });
            } else {
                Meteor.call('addGlobalFeedChat', message);
                analytics.track("addGlobalChat", {
                    message: message
                });
                $('.feedChatDiv .feedInner').scrollTop(0);
            }

            form.trigger('reset');
        } else {
            FlowRouter.go('/sign-in');
        }
    }

    watchForClicks(evt) {
        if (!$(evt.target).closest('.emoji-dialog').length) {
            //console.log('clicked outside!');
            this.setState({showEmojiPicker: false});
            $(document).unbind('click', this.watchForClicks);
        }
    }

    toggleEmojiPicker(evt) {
        evt.preventDefault();
        if (this.state.showEmojiPicker) {
            this.setState({showEmojiPicker: false});
            $(document).unbind('click', this.watchForClicks);
        } else {
            this.setState({showEmojiPicker: true});
            $(document).bind('click', this.watchForClicks);
        }
    }

    pickEmoji(data) {
        this.setState({showEmojiPicker: false});
        $(document).unbind('click', this.watchForClicks);
        //console.log('Emoji chosen', JSON.stringify(data));
        
        const input = $(this.inputField);
        input.val(`${input.val().length > 0 ? input.val() + ' ' : ''}${data.shortname} `);
        input.focus();
    }

    render() {

        return (
            <div>
                <form id="chat-input-form" className="ui form" onSubmit={(evt) => this.handleSubmit(evt)}>
                    <div className="ui fluid icon input">
                        <input type="text" id="chat-input-box" name="message" placeholder="Type here to chat..." autoComplete="off" required="true" ref={(ref) => this.inputField = ref}/>
                        <i className="circular smile link icon" onClick={(evt) => this.toggleEmojiPicker(evt)}/>
                    </div>
                </form>
                {this.state.showEmojiPicker ? <EmojiPicker search={true} onChange={(data) => this.pickEmoji(data)} /> : null}
            </div>
        );
    }
}

ChatInput.propTypes = {
    lobbyId: React.PropTypes.string
};

const SingleEvent = React.createClass({
    mixins: [ReactMeteorData],
    propTypes: {
        user: React.PropTypes.string,
        icon: React.PropTypes.string,
        timestamp: React.PropTypes.instanceOf(Date).isRequired,
        summary: React.PropTypes.string,
        detail: React.PropTypes.string
    },
    getMeteorData() {
        return {
            username: displayName(this.props.user, true),
            profileImgSrc: profilePicture(this.props.user, 35)
        }
    },
    renderProfilePicOrIcon(user, icon) {
        if (user) {
            return (
                <a href={FlowRouter.path('profile', {userId: this.props.user})} target="_blank" className="userProfilePicture">
                    <img src={this.data.profileImgSrc} />
                </a>
            )
        } else {
            return <i className={(icon ? icon : 'info') + ' icon'}></i>;
        }
    },
    emojisAndLinks(string) {
        let arr = autolink(string, {
            target: '_blank',
            rel: 'nofollow'
        });

        arr = arr.map((obj) => {
            if (typeof obj === "string") {
                return emojify(obj, {styles: {backgroundImage: 'url(/emojione.sprites.png)'}});
            }
            return obj;
        });

        //newString = emojify(newString[0]);
        return arr;
    },
    render() {
        return (
            <div className="event">
                <div className="label">
                    {this.renderProfilePicOrIcon(this.props.user, this.props.icon)}
                </div>
                <div className={"content " + (this.props.user ? "userProfilePicture" : "")}>
                    <div className="summary">
                        {this.props.user ? <a href={FlowRouter.path('profile', {userId: this.props.user})} target="_blank"  className="userProfilePicture">{this.data.username}</a> : this.props.summary}
                        <div className="date">
                            <MomentFromNow time={this.props.timestamp} />
                        </div>
                    </div>
                    {this.props.detail ? <div className="detailed-content">{this.emojisAndLinks(this.props.detail)}</div> : null}
                </div>
            </div>
        );
    }
});

export const GlobalFeedComponent = React.createClass({
    mixins: [ReactMeteorData],
    getMeteorData() {
        if (!Session.get('globalFeedLimit'))
            Session.set('globalFeedLimit', 20);

        var handle = Meteor.subscribe('globalFeed', Session.get('globalFeedLimit'));

        var data = {
            globalFeedLimit: Session.get('globalFeedLimit'),
            subsReady: handle.ready(),
            events: GlobalFeed.find({},{sort: {timestamp:-1}}).fetch()
        };

        if (handle.ready()) {
            let playerIds = [];

            data.events.forEach((event) => {
                if (event.user && event.user !== Meteor.userId())
                    playerIds.push(event.user);
            });

            if (playerIds.length > 0) {
                playerIds = _.uniq(playerIds);
                Meteor.subscribe('otherPlayers', playerIds);
            }
        }

        return data;
    },
    componentDidMount() {
        var feedOuter = $('.feedChatDiv');
        var feed = feedOuter.find('.feedInner');
        feed.scroll(function() {
            var fadeUpper = feedOuter.find('.fade.upper');
            var fadeLower = feedOuter.find('.fade.lower');
            var scroll = feed.scrollTop();
            if (scroll > 50) {
                fadeUpper.css('opacity', 1);
            } else {
                fadeUpper.css('opacity', scroll / 50);
            }

            var innerFeed = feed.find('.feed');
            var bottomScroll = innerFeed.height() - scroll - feedOuter.height();

            if (bottomScroll > 50) {
                fadeLower.css('opacity', 1);
            } else {
                fadeLower.css('opacity', bottomScroll / 50);
            }

            var getMoreDiv = $('.getMoreDiv');
            if (getMoreDiv.length && getMoreDiv.isOnScreen()) {
                var limit = Session.get('globalFeedLimit');
                limit += 20;
                if (limit <= 200) {
                    Session.set('globalFeedLimit', limit);
                }
            }
        });
    },
    renderEvent(event, index) {
        return <SingleEvent key={index} {...event} />;
    },
    showGetMoreDiv(events) {
        return (events.length === this.data.globalFeedLimit);
    },
    render() {
        return (
            <div>
                <div><ChatInput /></div>
                <div className="feedChatDiv">
                    <div className="fade upper"></div>
                    <div className="fade lower"></div>
                    <div className="feedInner">
                        <div className="ui small feed">
                            {this.data.events.map(this.renderEvent)}
                        </div>
                        {this.data.subsReady ? null : <div className="ui inline active centered loader"></div>}
                        {this.showGetMoreDiv(this.data.events) ? <div className="getMoreDiv"></div> : null}
                    </div>
                </div>
            </div>
        );
    }
});

export const LobbyFeedComponent = React.createClass({
    mixins: [ReactMeteorData],
    propTypes: {
        lobbyId: React.PropTypes.string.isRequired
    },
    getMeteorData() {
        if (!Session.get('lobbyFeedLimit'))
            Session.set('lobbyFeedLimit', 20);

        var handle = Meteor.subscribe('lobbyFeed', this.props.lobbyId, Session.get('lobbyFeedLimit'));

        var data = {
            lobbyFeedLimit: Session.get('lobbyFeedLimit'),
            subsReady: handle.ready(),
            events: LobbyFeed.find({lobbyId: this.props.lobbyId},{sort: {timestamp:-1}}).fetch()
        };

        if (handle.ready()) {
            let playerIds = [];

            data.events.forEach((event) => {
                if (event.user && event.user !== Meteor.userId())
                    playerIds.push(event.user);
            });

            if (playerIds.length > 0) {
                playerIds = _.uniq(playerIds);
                Meteor.subscribe('otherPlayers', playerIds);
            }
        }

        return data;
    },
    componentDidMount() {
        $(window).scroll(function() {
            var getMoreDiv = $('.getMoreDiv');
            if (getMoreDiv.length && getMoreDiv.isOnScreen()) {
                var limit = Session.get('lobbyFeedLimit');
                limit += 20;
                if (limit <= 200)
                    Session.set('lobbyFeedLimit', limit);
            }
        });

        setTimeout(this.startComputation, 0);
    },
    componentWillUnmount() {
        this.tracker.stop();
    },
    startComputation() {
        this.tracker = Tracker.autorun(() => {
            LobbyFeed.find({lobbyId: this.props.lobbyId}).observeChanges({
                added: (id, doc) => {
                    if (this.data.subsReady && doc.user) {
                        playSound('chat');
                    }
                }
            });
        });
    },
    renderEvent(event, index) {
        return <SingleEvent key={index} {...event} />;
    },
    showGetMoreDiv(events) {
        return (events.length === this.data.lobbyFeedLimit);
    },
    render() {
        return (
            <div>
                <div><ChatInput lobbyId={this.props.lobbyId} /></div>
                <div className="ui small feed">
                    {this.data.events.map(this.renderEvent)}
                    {this.data.subsReady ? null : <div className="ui inline active centered loader"></div>}
                    {this.showGetMoreDiv(this.data.events) ? <div className="getMoreDiv"></div> : null}
                </div>
            </div>
        );
    }
});