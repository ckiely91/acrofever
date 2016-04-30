import React from 'react';

import {profilePicture, displayName} from '../helpers';

export const PlayerLabel = React.createClass({
    mixins: [ReactMeteorData],
    propTypes: {
        id: React.PropTypes.string.isRequired
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
        } else {
            Meteor.subscribe('otherPlayers', [this.props.id]);
            data.ready = false;
        }

        return data;
    },
    render() {
        if (this.data.ready) {
            return (
                <a href={FlowRouter.path('profile', {userId: this.props.id})} className={this.props.isFriend ? 'ui green image label userProfilePicture' : 'ui image label userProfilePicture'} ref={(ref) => this.label = ref}>
                    <img src={this.data.profilePicture} />
                    {this.data.displayName}
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
       return (this.data.thisUser && this.data.thisUser.profile && this.data.thisUser.profile.friends.indexOf(id) > -1);
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