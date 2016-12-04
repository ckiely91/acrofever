import React from 'react';

import {profilePicture, displayName} from '../helpers';

export const PlayerUsername = React.createClass({
    mixins: [ReactMeteorData],
    propTypes: {
        id: React.PropTypes.string.isRequired,
        beforeText: React.PropTypes.string,
        afterText: React.PropTypes.string,
        linkToProfile: React.PropTypes.bool
    },
    getMeteorData() {
        const data = {
            displayName: displayName(this.props.id)
        };

        return data;
    },
    render() {
        if (!this.data.displayName) {
            return false;
        } else {
            return <span>
                {this.props.beforeText}
                <a href={FlowRouter.path('profile', {userId: this.props.id})}>{this.data.displayName}</a>
                {this.props.afterText}
            </span>
        }
    }
});

export const PlayerImage = React.createClass({
    mixins: [ReactMeteorData],
    propTypes: {
        id: React.PropTypes.string.isRequired,
        size: React.PropTypes.number
    },
    getMeteorData() {
        const data = {
            profilePicture: profilePicture(this.props.id, this.props.size || 50)
        };

        return data;
    },
    render() {
        return <img src={this.data.profilePicture} />
    }
});

export const PlayerLabel = React.createClass({
    mixins: [ReactMeteorData],
    propTypes: {
        id: React.PropTypes.string.isRequired,
        size: React.PropTypes.string,
        hideCountry: React.PropTypes.bool
    },
    getMeteorData() {
        const data = {
            profilePicture: profilePicture(this.props.id, 50),
            displayName: displayName(this.props.id),
            ready: false
        };

        const user = Meteor.users.findOne(this.props.id);

        if (user) {
            data.ready = true;
            data.online = user.status ? user.status.online : false;
            data.profile = user.profile;
        } else {
            Meteor.subscribe('otherPlayers', [this.props.id]);
            data.ready = false;
        }

        return data;
    },
    userFlag() {
        if (this.data.profile && this.data.profile.country) {
            return <i className={this.data.profile.country + ' flag'}></i>;
        }
    },
    render() {
        if (this.data.ready) {
            const labelClass = `ui ${this.props.isFriend ? "green" : ""} ${this.props.size ? this.props.size : ""} image label userProfilePicture`;

            return (
                <a href={FlowRouter.path('profile', {userId: this.props.id})} className={labelClass} ref={(ref) => this.label = ref}>
                    <img src={this.data.profilePicture} />
                    {this.data.displayName}&nbsp;
                    {this.props.hideCountry ? null : this.userFlag()}
                </a>
            );
        } else {
            return <div className="ui label"><div className="ui inline active mini loader"></div></div>;
        }
    }
});

export const OnlinePlayers = React.createClass({
   mixins: [ReactMeteorData],
   getMeteorData() {
       var handle = Meteor.subscribe('allOnlinePlayers');

       var data = {
           ready: handle.ready(),
           onlinePlayers: Meteor.users.find({'status.online':true}).fetch(),
           thisUser: Meteor.user()
       };

       data.playerCount = data.onlinePlayers.length;

       return data;
   },
   isFriend(id) {
       if (this.data.thisUser && this.data.thisUser.profile && this.data.thisUser.profile.friends) {
           return (this.data.thisUser.profile.friends.indexOf(id) > -1);
       } else {
           return false;
       }
   },
   render() {
       if (this.data.ready) {
           return (
               <div>
                   <h3 className="ui header">{this.data.playerCount + ((this.data.playerCount === 1) ? ' player ' : ' players ') + ' online'}</h3>
                   {this.data.onlinePlayers.map((player, index) => <PlayerLabel key={index} id={player._id} isFriend={this.isFriend(player._id)} />)}
               </div>
           )
       } else {
           return <div className="ui active inline centered loader"></div>
       }
   }
});