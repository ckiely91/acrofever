/*
    This is super hard to structure in React so it isn't currently used. Perhabs when switching the nav to React
    it would be best to redo the navigation.
 */

const UserNavDropdown = React.createClass({
    mixins: [ReactMeteorData],
    getInitialState() {
        return {
            notificationsSupported: (typeof Notification !== 'undefined')
        };
    },
    getMeteorData() {
        var user = Meteor.user();
        return {
            profilePicture: profilePicture(user._id, 30),
            username: displayname(user._id),
            soundDisabled: (user.profile.soundsEnabled === false),
            notificationsEnabled: user.profile.notificationsEnabled
        }
    },
    render() {
        const itemStyle = {
            fontSize: "1.2em",
            paddingLeft: "10px",
            paddingRight: "10px"
        };

        const iconStyle = {marginRight: 0};
        const imgStyle = {marginRight: 0};

        const toggleNotifications = (
            <a className="hiddenOnMobile item" style={itemStyle} title="Toggle notifications">
                <i className={'alarm' + (this.data.notificationsEnabled ? ' slash' : '') + ' icon'} style={iconStyle}></i>
            </a>
        );

        const toggleNotificationsMobile = (
            <a className="showOnMobile item">
                <i className={'alarm' + (this.data.notificationsEnabled ? ' slash' : '') + ' icon'} style={iconStyle}></i> Turn {this.data.notificationsEnabled ? 'off' : 'on'} notifications
            </a>
        );

        return (
            <div>
                <a className="hiddenOnMobile item" style={itemStyle} title="Toggle audio">
                    <i className={'volume ' + (this.data.soundDisabled ? 'off' : 'up') + ' icon'} style={iconStyle}></i>
                </a>
                {this.state.notificationsSupported ? toggleNotifications : null}
                <div className="ui dropdown item">
                    <img className="ui avatar image" src={this.data.profilePicture} style={imgStyle} />
                    <span>{this.data.username}</span>
                    <i className="dropdown icon"></i>
                    <div className="menu">
                        <a className="showOnMobile item">
                            <i className={'volume ' + (this.data.soundDisabled ? 'off' : 'up') + ' icon'}></i> Turn {this.data.soundDisabled ? 'on' : 'off'} audio
                        </a>
                        {this.state.notificationsSupported ? toggleNotificationsMobile : null}
                        <a className="item">View profile</a>
                        <a href="/change-password" className="item">Change password</a>
                        <a className="item">Sign out</a>
                    </div>
                </div>
            </div>
        )
    }
});

const UserNavDropdownWrapper = React.createClass({
    render() {
        if (Meteor.userId()) {
            return <UserNavDropdown />;
        } else {
            return (
                <a href="/sign-in" className="item">
                    <i className="sign in icon"></i>
                    Sign in / Register
                </a>
            );
        }
    }
});

const NavComponent = React.createClass({
    mixins: [ReactMeteorData],
    getMeteorData() {
        FlowRouter.watchPathChange();
        return {
            currentRoute: FlowRouter.current().route.name
        }
    },
    playNow(evt) {
        evt.preventDefault();

        if (this.currentRoute === 'lobby')
            return;

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
        const rightMenuInlineStyle = {marginRight: 0};

        return (
            <div>
                <div className="ui inverted menu" id="desktopNav">
                    <div className="ui container">
                        <a href={FlowRouter.path('home')} id="brandHeader" className="header item">
                            Acrofever!
                        </a>
                        <a href="#" className="item" onClick={this.playNow}>
                            <i className="lightning icon"></i>
                            <span className="hiddenOnTablet">Play now</span>
                        </a>
                        <a href={FlowRouter.path('play')} className={'item' + (this.data.currentRoute === 'play' ? ' active' : '')}>
                            <i className="search icon"></i>
                            <span className="hiddenOnTablet">Find a lobby</span>
                        </a>
                        <a href={FlowRouter.path('halloffame')} className={'item' + (this.data.currentRoute === 'halloffame' ? ' active' : '')}>
                            <i className="trophy icon"></i>
                            <span className="hiddenOnTablet">Hall of Fame</span>
                        </a>
                        <a href="#" className="item" onClick={this.howToPlay}>
                            <i className="question icon"></i>
                            <span className="trophy">How to Play</span>
                        </a>
                        <a href={FlowRouter.path('blogIndex')} className={'item' + (this.data.currentRoute === 'blogIndex' ? ' active' : '')}>
                            <i className="rss icon"></i>
                            <span className="hiddenOnTablet">Blog</span>
                        </a>
                        <div  id="rightNav" className="right menu">
                            <UserNavDropdownWrapper />
                        </div>
                    </div>
                </div>
                <div id="mobileNav">
                    <div className="ui inverted menu">
                        <a href={FlowRouter.path('home')} id="brandHeader" className="header item">
                            Acrofever!
                        </a>
                        <div id="rightNav" className="right menu">
                            <h2 className="header item">
                                <i className="sidebar icon" style={rightMenuInlineStyle}></i>
                            </h2>
                        </div>
                    </div>
                    <div className="slideMenu">
                        <div className="ui inverted stackable menu">
                            <a href="#" className="item" onClick={this.playNow}>
                                <i className="lightning icon"></i>
                                <span className="hiddenOnTablet">Play now</span>
                            </a>
                            <a href={FlowRouter.path('play')} className={'item' + (this.data.currentRoute === 'play' ? ' active' : '')}>
                                <i className="search icon"></i>
                                <span className="hiddenOnTablet">Find a lobby</span>
                            </a>
                            <a href={FlowRouter.path('halloffame')} className={'item' + (this.data.currentRoute === 'halloffame' ? ' active' : '')}>
                                <i className="trophy icon"></i>
                                <span className="hiddenOnTablet">Hall of Fame</span>
                            </a>
                            <a href="#" className="item" onClick={this.howToPlay}>
                                <i className="question icon"></i>
                                <span className="trophy">How to Play</span>
                            </a>
                            <a href={FlowRouter.path('blogIndex')} className={'item' + (this.data.currentRoute === 'blogIndex' ? ' active' : '')}>
                                <i className="rss icon"></i>
                                <span className="hiddenOnTablet">Blog</span>
                            </a>
                            <div>
                                <UserNavDropdownWrapper />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});