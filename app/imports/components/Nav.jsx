import React from 'react';

import {profilePicture, displayName, acrofeverAnalytics} from '../helpers';

const BrandHeader = () => <a href={FlowRouter.path('home')} id="brandHeader" className="header item">Acrofever!</a>;

const HeaderItem = (props) => {
    return (
        <a href={props.href || FlowRouter.path(props.path)} className={'item ' + ((props.path && FlowRouter.getRouteName() === props.path) ? 'active': '')} onClick={props.onClick}>
            <i className={props.icon + ' icon'} />
            <span className="hiddenOnTablet">{props.children}</span>
        </a>
    )
};

const UserNavDropdown = React.createClass({
    mixins: [ReactMeteorData],
    getMeteorData() {
        return {
            profilePicture: profilePicture(this.props._id, 30),
            displayName: displayName(this.props._id)
        };
    },
    componentDidMount() {
        $(this.dropdown).dropdown();

        if (typeof Notification !== 'undefined')
            setTimeout(this.startComputation(), 0);
    },
    startComputation() {
        this.tracker = Tracker.autorun(() => {
            let permission = this.props.profile.notificationsEnabled;
            if (permission === true && Notification.permission !== 'granted') {
                Meteor.call('toggleNotifications', false);
            } else if (typeof permission === 'undefined' && Notification.permission === 'granted') {
                Meteor.call('toggleNotifications', true);
            }
        });
    },
    componentWillUnmount() {
        if (this.tracker)
            this.tracker.stop();
    },
    notificationsSupported() {
        return (typeof Notification !== 'undefined');
    },
    toggleAudio(evt) {
        evt.preventDefault();
        if (this.props.profile.soundsEnabled === false) {
            Meteor.call('toggleSounds', true);
            acrofeverAnalytics.track('turnOnSounds');
        } else {
            Meteor.call('toggleSounds', false);
            acrofeverAnalytics.track('turnOffSounds');
        }
    },
    toggleNotifications(evt) {
        evt.preventDefault();
        if (this.props.profile.notificationsEnabled) {
            Meteor.call('toggleNotifications', false);
            acrofeverAnalytics.track('turnOffNotifications');
        } else {
            acrofeverAnalytics.track('turnOnNotifications');
            if (Notification.permission === 'granted') {
                Meteor.call('toggleNotifications', true);
                return;
            }

            if (Notification.permission === 'denied') {
                $('#notificationInfoModal').modal('show');
                return;
            }

            Notification.requestPermission(function(result) {
                if (result === 'granted') {
                    Meteor.call('toggleNotifications', true);
                    acrofeverAnalytics.track('allowNotifications');
                } else if (result === 'denied') {
                    Meteor.call('toggleNotifications', false);
                    acrofeverAnalytics.track('denyNotifications');
                }
            });
        }
    },
    logout(evt) {
        evt.preventDefault();
        Meteor.logout();
    },
    render() {
        const menuItemStyle = {fontSize: '1.2em', paddingLeft: '10px', paddingRight: '10px'},
            menuIconStyle = {marginRight:0},
            picStyle = {marginRight: '10px'};

        const notificationsItem = (mobile) => (
            <a className={'item ' + (mobile ? 'showOnMobile' : 'hiddenOnMobile')} style={menuItemStyle} title="Toggle notifications" onClick={(evt) => this.toggleNotifications(evt)}>
                <i className={'alarm ' + (this.props.profile.notificationsEnabled ? '' : 'slash ') + 'icon'} />
                {mobile ? 'Turn ' + (this.props.profile.notificationsEnabled ? 'off' : 'on') + ' notifications' : ''}
            </a>
        );

        return (
            <div id={this.props.desktop ? 'rightNav' : ''} className={this.props.desktop ? 'right menu' : ''}>
                <a className="hiddenOnMobile item" style={menuItemStyle} title="Toggle audio" onClick={(evt) => this.toggleAudio(evt)}>
                    <i className={'volume ' + (this.props.profile.soundsEnabled === false ? 'off' : 'up') + ' icon'} style={menuIconStyle} />
                </a>
                {this.notificationsSupported() ? notificationsItem(false) : null}
                <div className="ui dropdown item"  ref={(ref) => this.dropdown = ref}>
                    <img className="ui avatar image" src={this.data.profilePicture} style={picStyle} />
                    <span>{this.data.displayName}</span>
                    <i className="dropdown icon" />
                    <div className="menu">
                        <a className="showOnMobile item" onClick={(evt) => this.toggleAudio(evt)}>
                            <i className={'volume ' + (this.props.profile.soundsEnabled === false ? 'off' : 'up') + ' icon'} />
                            Turn {this.props.profile.soundsEnabled === false ? 'on' : 'off'} audio
                        </a>
                        {this.notificationsSupported() ? notificationsItem(true) : null}
                        <a href={FlowRouter.path('profile', {userId: this.props._id})} className="item">View profile</a>
                        <a href={FlowRouter.path('friends')} className="item">Friends</a>
                        <a href="/change-password" className="item">Change password</a>
                        <a className="item" onClick={(evt) => this.logout(evt)}>Sign out</a>
                    </div>
                </div>
            </div>
        );
    }
});

const UserNavWrapper = React.createClass({
    mixins: [ReactMeteorData],
    getMeteorData() {
        return {
            user: Meteor.user()
        }
    },
    render() {
        const signInItem = <HeaderItem href="/sign-in" icon="sign in">Sign in / Register</HeaderItem>;
        let signIn = signInItem;
        if (this.props.desktop)
            signIn = <div id="rightNav" className="right menu">{signInItem}</div>;

        return (this.data.user ? <UserNavDropdown desktop={this.props.desktop} {...this.data.user} /> : signIn);
    }
});

export const NavComponent = React.createClass({
    componentDidMount() {
        $('#mobileNav a').click(() => {
            const $slideMenu = $(this.slideMenu);
            if ($slideMenu.css('display') === 'block')
                $slideMenu.transition('slide down');
        });
    },
    playNow(evt) {
        evt.preventDefault();

        if (FlowRouter.getRouteName() === 'lobby')
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
        acrofeverAnalytics.track('playNowButton');
    },
    howToPlay(evt) {
        evt.preventDefault();
        $('#howToPlayModal').modal('show');
        acrofeverAnalytics.page('/howToPlay');
    },
    blog(evt) {
        evt.preventDefault();
        location.assign('https://acrofever.com/blog');
    },
    toggleMobileMenu(evt) {
        evt.preventDefault();
        $(this.slideMenu).transition('slide down');
    },
    render() {
        const sidebarStyle = {marginRight: 0};

        return (
            <div>
                <div className="ui inverted menu" id="desktopNav">
                    <div className="ui container">
                        <BrandHeader />
                        <HeaderItem href="#" icon="lightning" onClick={(evt) => this.playNow(evt)}>Play now</HeaderItem>
                        <HeaderItem path="play" icon="search">Find a lobby</HeaderItem>
                        <HeaderItem path="halloffame" icon="trophy">Hall of Fame</HeaderItem>
                        <HeaderItem href="#" icon="question" onClick={(evt) => this.howToPlay(evt)}>How to Play</HeaderItem>
                        <HeaderItem href="/blog" icon="rss" onClick={(evt) => this.blog(evt)}>Blog</HeaderItem>
                        <UserNavWrapper desktop={true} />
                    </div>
                </div>

                <div id="mobileNav">
                    <div className="ui inverted menu">
                        <BrandHeader />
                        <div id="rightNav" className="right menu">
                            <h2 className="header item">
                                <i className="sidebar icon" style={sidebarStyle} onClick={(evt) => this.toggleMobileMenu(evt)} />
                            </h2>
                        </div>
                    </div>
                    <div className="slideMenu" ref={(ref) => this.slideMenu = ref}>
                        <div className="ui inverted stackable menu">
                            <HeaderItem href="#" icon="lightning" onClick={(evt) => this.playNow(evt)}>Play now</HeaderItem>
                            <HeaderItem path="play" icon="search">Find a lobby</HeaderItem>
                            <HeaderItem path="halloffame" icon="trophy">Hall of Fame</HeaderItem>
                            <HeaderItem href="#" icon="question" onClick={(evt) => this.howToPlay(evt)}>How to Play</HeaderItem>
                            <HeaderItem href="/blog" icon="rss" onClick={(evt) => location.assign('/blog')}>Blog</HeaderItem>
                            <UserNavWrapper desktop={false}/>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});