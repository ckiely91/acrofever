var GlobalChatInput = React.createClass({
    handleSubmit(evt) {
        evt.preventDefault();
        if (Meteor.userId()) {
            var form = $(evt.currentTarget);
            var message = form.form('get values').message;

            Meteor.call('addGlobalFeedChat', message);

            form.trigger('reset');

            $('.feedChatDiv .feedInner').scrollTop(0);

            analytics.track("addGlobalChat", {
                message: message
            });
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

var SingleEvent = React.createClass({
   propTypes: {
       user: React.PropTypes.string,
       icon: React.PropTypes.string,
       timestamp: React.PropTypes.instanceOf(Date).isRequired,
       summary: React.PropTypes.string,
       detail: React.PropTypes.string
   },
   profileImgSrc(user, size) {
       return profilePicture(user, size);
   },
   renderProfilePicOrIcon(user, icon) {
     if (user) {
         return (
             <a href="#" className="userProfilePicture" data-userid={user}>
                <img src={this.profileImgSrc(user, 35)} />
             </a>
         )
     } else {
         return <i className={(icon ? icon : 'info') + ' icon'}></i>;
     }
   },
   username(id) {
     return displayname(id, true);
   },
   moFromNow(timestamp) {
       return moment(timestamp).fromNow();
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
                       {this.props.user ? <a href="#" className="userChatContent" data-userid={this.props.user}>{this.username(this.props.user)}</a> : this.props.summary}
                       <div className="date">
                           {this.moFromNow(this.props.timestamp)}
                       </div>
                   </div>
                   {this.props.detail ? <div className="detailed-content" dangerouslySetInnerHTML={this.detailHtml(this.props.detail)}></div> : null}
               </div>
           </div>
       );
   }
});

var GlobalFeedComponent = React.createClass({
    mixins: [ReactMeteorData],
    getMeteorData() {
       if (!Session.get('globalFeedLimit'))
            Session.set('globalFeedLimit', 20);

       const handle = Meteor.subscribe('globalFeed', Session.get('globalFeedLimit'))

       const data = {
           globalFeedLimit: Session.get('globalFeedLimit'),
           waiting: new ReactiveVar(),
           events: GlobalFeed.find({},{sort: {timestamp:-1}}).fetch()
       };

       data.waiting.set(handle.ready());
       console.log(data);

       if (handle.ready()) {
           const playerIds = [];
           GlobalFeed.find().forEach(function(event) {
               if (event.user)
                   playerIds.push(event.user);
           });
           Meteor.subscribe('otherPlayers', playerIds);
       }

       return data;
    },
    renderEvent(event, index) {
        return <SingleEvent key={index} {...event} />;
    },
    showGetMoreDiv(events) {
       return (events.length === this.data.globalFeedLimit);
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
            console.log(getMoreDiv.isOnScreen());
            if (getMoreDiv.length && getMoreDiv.isOnScreen()) {
                var limit = Session.get('globalFeedLimit');
                limit += 20;
                if (limit <= 200) {
                    Session.set('globalFeedLimit', limit);
                }
            }
        });
    },
	render() {
		return (
            <div>
                <div><GlobalChatInput /></div>
                <div className="feedChatDiv">
                    <div className="fade upper"></div>
                    <div className="fade lower"></div>
                    <div className="feedInner">
                        <div className="ui small feed">
                            {this.data.events.map(this.renderEvent)}
                        </div>
                        {!this.data.waiting ? <div className="ui inline active centered loader"></div> : null}
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