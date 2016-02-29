const ChatInput = React.createClass({
    propTypes: {
        lobbyId: React.PropTypes.string
    },
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
    },
    render() {
        return (
            <form id="chat-input-form" className="ui form" onSubmit={this.handleSubmit}>
                <div className="ui fluid action input">
                    <input type="text" id="chat-input-box" name="message" className="ui input" placeholder="Type here to chat..." autoComplete="off" required />
                    <button className="ui button" type="submit">Send</button>
                </div>
            </form>
        );
    }
});

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
           username: displayname(this.props.user, true),
           profileImgSrc: profilePicture(this.props.user, 35)
       }
   },
   openProfilePopup(evt) {
       evt.preventDefault();
       Session.set('selectedProfileUserId', this.props.user);
       $('#profileModal').modal('show');
   },
   renderProfilePicOrIcon(user, icon) {
     if (user) {
         return (
             <a href="#" className="userProfilePicture" onClick={this.openProfilePopup}>
                <img src={this.data.profileImgSrc} />
             </a>
         )
     } else {
         return <i className={(icon ? icon : 'info') + ' icon'}></i>;
     }
   },
   detailHtml(html) {
       return {
           __html: replaceLinksAndEscape(html)
       }
   },
   render() {
       return (
           <div className="event">
               <div className="label">
                   {this.renderProfilePicOrIcon(this.props.user, this.props.icon)}
               </div>
               <div className={"content " + (this.props.user ? "userProfilePicture" : "")}>
                   <div className="summary">
                       {this.props.user ? <a href="#" className="userProfilePicture" onClick={this.openProfilePopup}>{this.data.username}</a> : this.props.summary}
                       <div className="date">
                           <MomentFromNow time={this.props.timestamp} />
                       </div>
                   </div>
                   {this.props.detail ? <div className="detailed-content" dangerouslySetInnerHTML={this.detailHtml(this.props.detail)}></div> : null}
               </div>
           </div>
       );
   }
});

GlobalFeedComponent = React.createClass({
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

Template.registerHelper('GlobalFeedComponent', () => {
    return GlobalFeedComponent;
});

const LobbyFeedComponent = React.createClass({
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
    componentWillMount() {
        var self = this;
        this.notifications = LobbyFeed.find({lobbyId: this.props.lobbyId}).observeChanges({
            added(id, doc) {
                if (self.data.subsReady && doc.user) {
                    notify(displayname(doc.user, true), doc.detail, profilePicture(doc.user, 250));
                    playSound('chat');
                }
            }
        });
    },
    componentDidMount() {
        $(window).scroll(function() {
            var getMoreDiv = $('.getMoreDiv');
            if (getMoreDiv.length && getMoreDiv.isOnScreen()) {
                var limit = Session.get('lobbyFeedLimit');
                limit += 20;
                if (limit <= 200)
                    Session.set('lobbyFeedLimit', limit);
            }        });
    },
    componentWillUnmount() {
        this.notifications.stop();
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

Template.registerHelper('LobbyFeedComponent', () => LobbyFeedComponent);