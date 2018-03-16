import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import PropTypes from "prop-types";
import React, { Component } from "react";

import { profilePicture, displayName } from "../helpers";

const SingleFriend = ({ user }) => {
  const onlineLabel =
    user.status && user.status.online ? (
      <div className="ui small basic green label">Online</div>
    ) : (
      <div className="ui small basic red label">Offline</div>
    );

  return (
    <a className="item" href={FlowRouter.path("profile", { userId: user._id })}>
      <img className="ui avatar image" src={profilePicture(user._id, 28)} />
      <div className="content">
        <div className="header">
          {displayName(user._id)} {onlineLabel}
        </div>
      </div>
    </a>
  );
};

const FriendsView = ({ user, ready, friends }) => (
  <div className="ui text container">
    <h2 className="ui header">
      <i className="smile icon" />
      <div className="content">Your friends</div>
    </h2>
    {(() => {
      if (ready) {
        if (friends && friends.length > 0) {
          return (
            <div className="ui middle aligned animated selection list">
              {friends.map(friend => (
                <SingleFriend user={friend} key={friend._id} />
              ))}
            </div>
          );
        } else {
          return <div>You don't have any friends :(</div>;
        }
      } else {
        return <div className="ui active inline loader" />;
      }
    })()}
  </div>
);

export const FriendsViewContainer = withTracker(() => {
  const user = Meteor.user(),
    data = { user, ready: false };

  if (user && user.profile && user.profile.friends) {
    const handle = Meteor.subscribe("otherPlayers", user.profile.friends);
    data.ready = handle.ready();
    data.friends = Meteor.users
      .find({ _id: { $in: user.profile.friends } })
      .fetch();
  } else {
    data.ready = true;
  }

  return data;
})(FriendsView);
