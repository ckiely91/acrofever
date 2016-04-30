import React from 'react';

import {profilePicture, displayName} from '../helpers';

const SingleFriend = React.createClass({
    mixins: [ReactMeteorData],
    propTypes: {
        user: React.PropTypes.object.isRequired
    },
    getMeteorData() {
        return {
            displayName: displayName(this.props.user._id),
            profilePicture: profilePicture(this.props.user._id, 28)
        }
    },
    onlineLabel() {
        if (this.props.user.status && this.props.user.status.online) {
            return <div className="ui small basic green label">Online</div>;
        } else {
            return <div className="ui small basic red label">Offline</div>;
        }
    },
    render() {
        return (
            <a className="item" href={FlowRouter.path('profile', {userId: this.props.user._id})}>
                <img className="ui avatar image" src={this.data.profilePicture} />
                <div className="content">
                    <div className="header">{this.data.displayName} {this.onlineLabel()}</div>
                </div>
            </a>
        )
    }
});

export const FriendsView = React.createClass({
    mixins: [ReactMeteorData],
    getMeteorData() {
        const user = Meteor.user(),
            data = {user, ready: false};

        if (user && user.profile && user.profile.friends) {
            const handle = Meteor.subscribe('otherPlayers', user.profile.friends);
            data.ready = handle.ready();
            data.friends = Meteor.users.find({_id: {$in: user.profile.friends}}).fetch();
        } else {
            data.ready = true;
        }

        return data;
    },

    render() {
        return (
            <div className="ui text container">
                <h2 className="ui header">
                    <i className="smile icon" />
                    <div className="content">
                        Your friends
                    </div>
                </h2>
                {(() => {
                    if (this.data.ready) {
                        if (this.data.friends && this.data.friends.length > 0) {
                            return (
                                <div className="ui middle aligned animated selection list">
                                    {this.data.friends.map((friend, index) => <SingleFriend user={friend} key={index} />)}
                                </div>
                            );
                        } else {
                            return <div>You don't have any friends :(</div>;
                        }
                    } else {
                        return <div className="ui active inline loader"></div>;
                    }
                })()}
            </div>
        );
    }
});