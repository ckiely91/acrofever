import React from 'react';

import {profilePicture, displayName} from '../helpers';

const PlayerLabel = React.createClass({
    mixins: [ReactMeteorData],
    propTypes: {
        id: React.PropTypes.string.isRequired
    },
    getMeteorData() {
        return {
            profilePicture: profilePicture(this.props.id, 50),
            displayName: displayName(this.props.id)
        }
    },
    openProfilePopup(evt) {
        evt.preventDefault();
        Session.set('selectedProfileUserId', this.props.id);
        $('#profileModal').modal('show');
    },
    render() {
        return (
            <a className="ui image label userProfilePicture" onClick={this.openProfilePopup}>
                <img src={this.data.profilePicture} />
                {this.data.displayName}
            </a>
        )
    }
});

export const OnlinePlayers = React.createClass({
   mixins: [ReactMeteorData],
   getMeteorData() {
       var handle = Meteor.subscribe('allOnlinePlayers');

       var data = {
           ready: handle.ready(),
           onlinePlayers: Meteor.users.find({'status.online':true}).fetch()
       };

       data.playerCount = data.onlinePlayers.length;

       return data;
   },
   render() {
       if (this.data.ready) {
           return (
               <div>
                   <h3 className="ui header">{this.data.playerCount + ((this.data.playerCount === 1) ? ' player ' : ' players ') + ' online'}</h3>
                   {this.data.onlinePlayers.map((player, index) => <PlayerLabel key={index} id={player._id} />)}
               </div>
           )
       } else {
           return <div className="ui active inline centered loader"></div>
       }
   }
});