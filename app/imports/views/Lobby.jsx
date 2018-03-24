import PropTypes from "prop-types";
import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import classNames from "classnames";

import { LobbyFeedComponentContainer } from "../components/Feeds";
import { CountdownSpan } from "../components/Countdown";

import { AcrofeverCategoryPhase } from "../components/acrofever/CategoryPhase";
import { AcrofeverAcroPhase } from "../components/acrofever/AcroPhase";
import { AcrofeverVotingPhase } from "../components/acrofever/VotingPhase";
import { AcrofeverEndRoundPhase } from "../components/acrofever/EndRoundPhase";
import { AcrofeverEndGamePhase } from "../components/acrofever/EndGamePhase";

import {
  notify,
  playSound,
  profilePicture,
  displayName,
  acrofeverAnalytics,
  isUserBanned,
  findUserById
} from "../helpers";
import { Games, Lobbies } from "../collections";
import { lobbySubs } from "../subsManagers";

class GameWindowInner extends Component {
  static propTypes = {
    game: PropTypes.object.isRequired,
    endTime: PropTypes.instanceOf(Date),
    users: PropTypes.array.isRequired,
    config: PropTypes.object
  };

  componentDidMount() {
    setTimeout(this.startComputation.bind(this), 0);
  }

  componentWillUnmount() {
    this.tracker.stop();
  }

  startComputation() {
    this.tracker = Tracker.autorun(() => {
      Games.find({ _id: this.props.game._id }).observeChanges({
        changed: (id, fields) => {
          if (fields.currentRound) {
            playSound("action");
            notify("New round started", "Acrofever");
          }

          if (fields.currentPhase) {
            if (fields.currentPhase === "endround") {
              const game = Games.findOne(this.props.game._id);
              let currentRound = game.rounds[game.currentRound - 1];

              if (currentRound.winner === Meteor.userId()) {
                playSound("roundwin");
                notify("You won the round!", "Acrofever");
              } else {
                playSound("roundend");
                notify(
                  displayName(currentRound.winner, true) + " won the round.",
                  "Acrofever"
                );
              }
            } else if (fields.currentPhase === "endgame") {
              const game = Games.findOne(this.props.game._id);
              if (game.gameWinner === Meteor.userId()) {
                playSound("gamewin");
                notify("You won the game!", "Acrofever");
              } else {
                playSound("gameend");
                notify(
                  displayName(game.gameWinner, true) + " won the game.",
                  "Acrofever"
                );
              }
            }
          }
        }
      });
    });
  }

  render() {
    switch (this.props.game.type) {
      case "acrofever":
        switch (this.props.game.currentPhase) {
          case "category":
            return (
              <AcrofeverCategoryPhase
                round={this.props.game.rounds[this.props.game.currentRound - 1]}
                endTime={this.props.endTime}
                gameId={this.props.game._id}
                config={this.props.config}
                users={this.props.users}
              />
            );

          case "acro":
            return (
              <AcrofeverAcroPhase
                round={this.props.game.rounds[this.props.game.currentRound - 1]}
                endTime={this.props.endTime}
                gameId={this.props.game._id}
              />
            );

          case "voting":
            return (
              <AcrofeverVotingPhase
                round={this.props.game.rounds[this.props.game.currentRound - 1]}
                endTime={this.props.endTime}
                gameId={this.props.game._id}
              />
            );

          case "endround":
            return (
              <AcrofeverEndRoundPhase
                round={this.props.game.rounds[this.props.game.currentRound - 1]}
                endTime={this.props.endTime}
                users={this.props.users}
              />
            );

          case "endgame":
            return (
              <AcrofeverEndGamePhase
                scores={this.props.game.scores}
                rounds={this.props.game.rounds}
                currentRound={this.props.game.currentRound}
                winner={this.props.game.gameWinner}
                endTime={this.props.endTime}
                users={this.props.users}
                gameId={this.props.game._id}
              />
            );
        }
    }
  }
}

const LobbyPlayerCard = ({ user }) => (
  <a
    href={FlowRouter.path("profile", { userId: user._id })}
    target="_blank"
    className="userProfilePicture card"
  >
    <div className="image">
      <img src={profilePicture(user, 400)} />
    </div>
    <div className="content">{displayName(user)}</div>
  </a>
);

class GameWindow extends React.Component {
  static propTypes = {
    game: PropTypes.object,
    newGameStarting: PropTypes.bool,
    playerIds: PropTypes.array,
    users: PropTypes.array.isRequired,
    endTime: PropTypes.instanceOf(Date),
    lobbyEndTime: PropTypes.instanceOf(Date),
    config: PropTypes.object
  };

  getPlayerUsers() {
    if (!this.props.playerIds) {
      return [];
    }

    return this.props.playerIds.map(playerId =>
      findUserById(this.props.users, playerId)
    );
  }

  render() {
    if (this.props.game.active) {
      return (
        <GameWindowInner
          game={this.props.game}
          endTime={this.props.endTime}
          config={this.props.config}
          users={this.props.users}
        />
      );
    }

    let headerText;
    if (this.props.newGameStarting) {
      headerText = (
        <div>
          New game starting in{" "}
          <CountdownSpan endTime={this.props.lobbyEndTime} />
        </div>
      );
    } else {
      headerText = <div>Waiting for more players...</div>;
    }

    const playerUsers = this.getPlayerUsers();

    return (
      <div>
        <h3 className="ui center aligned icon header">
          <i className="wait icon" />
          {headerText}
        </h3>
        <div className="ui divider" />
        {playerUsers.length > 0 ? (
          <div className="ui four doubling cards">
            {playerUsers.map(user => (
              <LobbyPlayerCard key={user._id} user={user} />
            ))}
          </div>
        ) : (
          <h3 className="ui center aligned disabled header">
            No players in lobby
          </h3>
        )}
      </div>
    );
  }
}

const ScoresTableRow = ({ score }) => (
  <tr className={score.active ? null : "disabled"}>
    <td>
      <a
        href={FlowRouter.path("profile", { userId: score.user._id })}
        target="_blank"
        className="userProfilePicture"
      >
        <h4 className="ui image header">
          <img
            src={profilePicture(score.user)}
            className="ui mini circular image"
          />
          <div className="content">{displayName(score.user)}</div>
        </h4>
      </a>
    </td>
    <td>{score.score}</td>
  </tr>
);

ScoresTableRow.propTypes = {
  score: PropTypes.shape({
    id: PropTypes.string.isRequired,
    score: PropTypes.number.isRequired,
    active: PropTypes.bool.isRequired,
    user: PropTypes.object.isRequired
  })
};

const ScoresTable = ({ scores, users, playerIds }) => {
  const sortedScores = Object.keys(scores).map(userId => ({
    id: userId,
    score: scores[userId],
    active: playerIds.indexOf(userId) > -1,
    user: findUserById(users, userId)
  }));

  sortedScores.sort((a, b) => b.score - a.score);

  return (
    <table className="ui unstackable table">
      <tbody>
        {sortedScores.length > 0 ? (
          sortedScores.map(score => (
            <ScoresTableRow key={score.id} score={score} />
          ))
        ) : (
          <div className="ui active inline loader" />
        )}
      </tbody>
    </table>
  );
};

ScoresTable.propTypes = {
  scores: PropTypes.object,
  users: PropTypes.array,
  playerIds: PropTypes.array
};

const beggarStyle = {
  maxWidth: "300px",
  width: "100%",
  border: "none"
};

const Beggar = () => (
  <form
    action="https://www.paypal.com/cgi-bin/webscr"
    method="post"
    target="_blank"
  >
    <input type="hidden" name="cmd" value="_s-xclick" />
    <input type="hidden" name="hosted_button_id" value="8QLLAQ44QPZ3C" />
    <input
      type="image"
      src="/images/donate-mediumrect.jpg"
      style={beggarStyle}
      name="submit"
      alt="PayPal — The safer, easier way to pay online."
    />
  </form>
);

const LobbySettings = ({
  timeouts,
  acronymTimeout,
  votingTimeout,
  winnerPoints,
  votedPoints,
  votedForWinnerPoints,
  notVotedNegativePoints,
  endGamePoints
}) => {
  return (
    <div className="ui relaxed divided list">
      <div className="item">
        <div className="content">
          <div className="header">Acro phase time</div>
          <div className="description">
            {(() => {
              if (timeouts) {
                return "Auto";
                //return `${moment(timeouts.acroBase).format('m:ss')} + (${moment(timeouts.acroMultiplier).format('m:ss')} × letters)`;
              } else {
                return moment(acronymTimeout).format("m:ss");
              }
            })()}
          </div>
        </div>
      </div>
      <div className="item">
        <div className="content">
          <div className="header">Voting phase time</div>
          <div className="description">
            {(() => {
              if (timeouts) {
                return "Auto";
                //return `${moment(timeouts.votingBase).format('m:ss')} + (${moment(timeouts.votingMultiplier).format('m:ss')} × entries)`;
              } else {
                return moment(votingTimeout).format("m:ss");
              }
            })()}
          </div>
        </div>
      </div>
      <div className="item">
        <div className="content">
          <div className="header">Points for round winner</div>
          <div className="description">{winnerPoints}</div>
        </div>
      </div>
      <div className="item">
        <div className="content">
          <div className="header">Points for each vote received</div>
          <div className="description">{votedPoints}</div>
        </div>
      </div>
      <div className="item">
        <div className="content">
          <div className="header">Points for voting for winning Acro</div>
          <div className="description">{votedForWinnerPoints}</div>
        </div>
      </div>
      <div className="item">
        <div className="content">
          <div className="header">Penalty for submitting without voting</div>
          <div className="description">-{notVotedNegativePoints}</div>
        </div>
      </div>
      <div className="item">
        <div className="content">
          <div className="header">Points needed to win game</div>
          <div className="description">{endGamePoints}</div>
        </div>
      </div>
    </div>
  );
};

class LobbyView extends Component {
  static propTypes = {
    lobbyId: PropTypes.string.isRequired,
    lobby: PropTypes.object,
    users: PropTypes.array.isRequired,
    game: PropTypes.object
  };

  componentWillMount() {
    this.notifications = Lobbies.find({
      _id: this.props.lobbyId
    }).observeChanges({
      changed: function(id, fields) {
        if (fields.newGameStarting === true) {
          playSound("relax");
          notify("New game starting soon", "Acrofever");
        }

        if (fields.currentGame) {
          playSound("action");
          notify("New game started", "Acrofever");
        }
      }
    });

    //SEO stuff
    var title = "Lobby - Acrofever";
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

  componentWillUnmount() {
    this.notifications.stop();
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.lobby &&
      (!this.props.lobby ||
        this.props.lobby.displayName !== nextProps.lobby.displayName)
    ) {
      DocHead.setTitle(nextProps.lobby.displayName + " Lobby - Acrofever");
    }
  }

  /* HELPERS */
  isInLobby() {
    return (
      this.props.lobby &&
      this.props.lobby.players &&
      this.props.lobby.players.indexOf(Meteor.userId()) > -1
    );
  }

  isBanned() {
    return isUserBanned(Meteor.userId());
  }

  /* EVENTS */
  joinOrLeaveLobby = evt => {
    const btn = $(evt.currentTarget),
      isInLobby = this.isInLobby();

    btn.addClass("loading");
    Meteor.call(
      "joinOrLeaveOfficialLobby",
      this.props.lobbyId,
      !isInLobby,
      err => {
        btn.removeClass("loading");
        if (err) console.error(err);

        if (isInLobby) {
          acrofeverAnalytics.track("leaveLobby", {
            lobbyId: this.props.lobbyId
          });
        } else {
          acrofeverAnalytics.track("joinLobby", {
            lobbyId: this.props.lobbyId
          });
        }
      }
    );
  };

  render() {
    if (!this.props.lobby || !this.props.game) {
      return <div className="ui active loader" />;
    }

    return (
      <div className="ui stackable grid">
        <div className="five wide column">
          <h2 className="ui header">{this.props.lobby.displayName}</h2>
          <div className="ui raised segments">
            <div className="ui segment">
              <button
                className={classNames(
                  "ui",
                  "fluid",
                  "button",
                  { primary: !this.isInLobby() },
                  { disabled: this.isBanned() }
                )}
                onClick={this.joinOrLeaveLobby}
              >
                {this.isInLobby() ? "Leave" : "Join"} lobby
              </button>
            </div>
            <div className="ui segment">
              <h3 className="ui header">
                Current round:{" "}
                <span className="normalWeight">
                  {this.props.game.currentRound}
                </span>
              </h3>
            </div>
            <div className="ui segment">
              <h3 className="ui header">Scores</h3>
              <div>
                <ScoresTable
                  scores={this.props.game.scores}
                  playerIds={this.props.lobby.players}
                  users={this.props.users}
                />
              </div>
            </div>
            <div className="ui segment hiddenOnMobile">
              <h3 className="ui header">Lobby settings</h3>
              <LobbySettings {...this.props.lobby.config} />
            </div>
          </div>
          <div className="ui segment hiddenOnMobile">
            <Beggar />
          </div>
        </div>
        <div className="eleven wide column">
          <div className="ui raised segment">
            <GameWindow
              game={this.props.game}
              newGameStarting={this.props.lobby.newGameStarting}
              playerIds={this.props.lobby.players}
              users={this.props.users}
              endTime={this.props.game.endTime}
              lobbyEndTime={this.props.lobby.endTime}
              config={this.props.lobby.config}
            />
          </div>
          <div className="ui hidden divider" />
          <div className="semiTransparentWhiteBG">
            <LobbyFeedComponentContainer lobbyId={this.props.lobbyId} />
          </div>
        </div>
      </div>
    );
  }
}

export const LobbyViewContainer = withTracker(({ lobbyId }) => {
  lobbySubs.subscribe("lobbies");

  const data = {
    lobby: Lobbies.findOne(lobbyId),
    users: []
  };

  if (data.lobby) {
    Meteor.subscribe("currentGame", data.lobby.currentGame);
    data.game = Games.findOne(data.lobby.currentGame);

    if (data.game) {
      let playerIds = data.lobby.players || [];
      if (data.game.scores) {
        playerIds = playerIds.concat(_.keys(data.game.scores));
      }
      Meteor.subscribe("otherPlayers", playerIds);
      data.users = Meteor.users.find({ _id: { $in: playerIds } }).fetch();
    }
  }

  return data;
})(LobbyView);
