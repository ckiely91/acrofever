import PropTypes from "prop-types";
import React from "react";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";

import { profilePicture, displayName } from "../helpers";

const PlayerUsername = ({
  id,
  displayName,
  beforeText,
  afterText,
  linkToProfile
}) => (
  <span>
    {beforeText}
    <a href={FlowRouter.path("profile", { userId: id })}>{displayName}</a>
    {afterText}
  </span>
);

export const PlayerUsernameWrapper = withTracker(({ id }) => {
  return {
    displayName: displayName(id)
  };
})(PlayerUsername);

const PlayerImage = ({ profilePicture }) => <img src={profilePicture} />;

export const PlayerImageContainer = withTracker(({ id, size }) => {
  return {
    profilePicture: profilePicture(id, size || 50)
  };
})(PlayerImage);

const userFlag = user => {
  if (user.profile && user.profile.country) {
    return <i className={user.profile.country + " flag"} />;
  }
};

export const PlayerLabel = ({ user, isFriend, hideCountry, size }) => {
  if (!user) {
    return (
      <div className="ui label">
        <div className="ui inline active mini loader" />
      </div>
    );
  }

  const labelClass = `ui ${isFriend ? "green" : ""} ${
    size ? size : ""
  } image label userProfilePicture`;

  return (
    <a
      href={FlowRouter.path("profile", { userId: user._id })}
      className={labelClass}
    >
      <img src={profilePicture(user, 50)} />
      {displayName(user)}&nbsp;
      {hideCountry ? null : userFlag(user)}
    </a>
  );
};

PlayerLabel.propTypes = {
  user: PropTypes.object,
  isFriend: PropTypes.bool,
  hideCountry: PropTypes.bool,
  size: PropTypes.string
};

export const PlayerLabelContainer = withTracker(({ id }) => {
  Meteor.subscribe("otherPlayers", [id]);
  return {
    user: Meteor.users.findOne(id)
  };
})(PlayerLabel);

const isFriend = (userId, thisUser) => {
  if (thisUser && thisUser.profile && thisUser.profile.friends) {
    return thisUser.profile.friends.indexOf(userId) > -1;
  }

  return false;
};

const OnlinePlayers = ({ ready, onlinePlayers, thisUser }) => {
  if (!ready) {
    return <div className="ui active inline centered loader" />;
  }

  const playerCount = onlinePlayers.length;

  return (
    <div>
      <h3 className="ui header">
        {playerCount +
          (playerCount === 1 ? " player " : " players ") +
          " online"}
      </h3>
      {onlinePlayers.map((player, index) => (
        <PlayerLabel
          key={player._id}
          user={player}
          isFriend={isFriend(player._id, thisUser)}
        />
      ))}
    </div>
  );
};

OnlinePlayers.propTypes = {
  ready: PropTypes.bool.isRequired,
  onlinePlayers: PropTypes.array.isRequired,
  thisUser: PropTypes.object
};

export const OnlinePlayersContainer = withTracker(() => {
  const handle = Meteor.subscribe("allOnlinePlayers");

  return {
    ready: handle.ready(),
    onlinePlayers: Meteor.users.find({ "status.online": true }).fetch(),
    thisUser: Meteor.user()
  };
})(OnlinePlayers);
