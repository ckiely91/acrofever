import PropTypes from "prop-types";
import React, { PureComponent } from "react";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";

import { GlobalFeedComponent } from "../components/Feeds";
import { MomentFromNow } from "../components/Countdown";
import { OnlinePlayers } from "../components/OnlinePlayers";
import { UpcomingEvents } from "../components/Events";

import { profilePicture, displayName } from "../helpers";
import { Lobbies } from "../collections";
import { lobbySubs } from "../subsManagers";

class PlayerAvatar extends PureComponent {
  static propTypes = {
    user: PropTypes.object
  };

  componentDidMount() {
    $(this.popupImg).popup({
      inline: true
    });
  }

  render() {
    const thisStyle = {
      display: "inline-block",
      marginRight: "0.5em"
    };

    return (
      <div style={thisStyle}>
        <img
          ref={ref => (this.popupImg = ref)}
          className="ui mini circular image"
          src={profilePicture(this.props.user)}
        />
        <div className="ui popup">
          <div className="content">{displayName(this.props.user)}</div>
        </div>
      </div>
    );
  }
}

const PlayerAvatarContainer = withTracker(({ userId }) => {
  return {
    user: Meteor.users.findOne({ _id: userId })
  };
})(PlayerAvatar);

const LobbyRow = ({ lobby }) => (
  <tr
    className="lobbyRow"
    onClick={() =>
      FlowRouter.go(FlowRouter.path("lobby", { lobbyId: lobby._id }))
    }
  >
    <td>{lobby.displayName}</td>
    <td>
      <MomentFromNow time={lobby.lastUpdated} />
    </td>
    <td>
      {lobby.players.length > 0 ? (
        lobby.players.map((userId, index) => (
          <PlayerAvatarContainer key={userId} userId={userId} />
        ))
      ) : (
        <em>No players</em>
      )}
    </td>
  </tr>
);

LobbyRow.propTypes = {
  lobby: PropTypes.object
};

class PlayView extends PureComponent {
  static propTypes = {
    ready: PropTypes.bool.isRequired,
    lobbies: PropTypes.array.isRequired
  };

  componentWillMount() {
    //SEO stuff
    var title = "Find Lobbies - Acrofever";
    var description =
      "Acrofever is an Acrophobia clone for the modern web. If you never played Acrophobia, it's a fun, zany word game in which players create phrases from a randomly generated acronym, then vote for their favourites.";
    var metadata = {
      description: description,
      "og:description": description,
      "og:title": title,
      "og:image": "https://acrofever.com/images/fb-image.png",
      "twitter:card": "summary"
    };

    DocHead.setTitle(title);
    _.each(metadata, function(content, name) {
      DocHead.addMeta({ name: name, content: content });
    });
  }

  render() {
    let lobbyTable;

    if (this.props.ready) {
      lobbyTable = (
        <table className="ui selectable table" id="lobbyList">
          <thead>
            <tr>
              <th className="four wide">Name</th>
              <th className="four wide">Last active</th>
              <th className="eight wide">Players</th>
            </tr>
          </thead>
          <tbody>
            {this.props.lobbies.map((lobby, index) => (
              <LobbyRow key={index} lobby={lobby} />
            ))}
          </tbody>
        </table>
      );
    } else {
      lobbyTable = <div className="ui centered inline active loader" />;
    }

    return (
      <div>
        <h2 className="ui header">
          <i className="search icon" />
          <div className="content">
            Find a lobby
            <div className="sub header">Join a lobby to start playing</div>
          </div>
        </h2>
        <div className="ui hidden divider" />
        <div className="ui stackable grid">
          <div className="eight wide column">
            {lobbyTable}
            <div className="ui hidden divider" />
            <div className="ui raised segment">
              <UpcomingEvents />
            </div>
          </div>
          <div className="eight wide column">
            <div className="ui raised segment">
              <OnlinePlayers />
            </div>
            <GlobalFeedComponent />
          </div>
        </div>
      </div>
    );
  }
}

export const PlayViewContainer = withTracker(() => {
  lobbySubs.subscribe("lobbies");
  const data = {
    lobbies: Lobbies.find().fetch()
  };

  let players = data.lobbies.reduce((prev, cur) => {
    return prev.concat(cur.players);
  }, []);

  const handle = Meteor.subscribe("otherPlayers", _.uniq(players));
  data.ready = lobbySubs.ready() && handle.ready();

  return data;
})(PlayView);
