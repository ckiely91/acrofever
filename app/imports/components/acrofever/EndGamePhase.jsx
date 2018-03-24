import PropTypes from "prop-types";
import React, { Component } from "react";
import { Meteor } from "meteor/meteor";

import { CountdownHeader } from "../Countdown";
import { RoundResultsTable } from "./EndRoundPhase";

import {
  profilePicture,
  displayName,
  acrofeverAnalytics,
  findUserById
} from "../../helpers";
import { Lobbies } from "../../collections";

class BestAcroCard extends React.Component {
  static propTypes = {
    result: PropTypes.object.isRequired,
    gameId: PropTypes.string.isRequired
  };

  state = {
    hasVotedForHOF: false
  };

  componentDidMount() {
    if (this.voteLabel) {
      $(this.voteLabel).popup({ inline: true });
    }
    $(this.description).popup({ inline: true });
  }

  isOwnAcro = () => {
    return this.props.result.id === Meteor.userId();
  };

  voteForHOF = evt => {
    evt.preventDefault();

    if (this.state.hasVotedForHOF) return;

    this.setState({ hasVotedForHOF: true });

    Meteor.call("voteForHallOfFame", this.props.gameId, this.props.result);
    acrofeverAnalytics.track("voteForHallOfFame");
  };

  render() {
    let headerContent;

    if (this.isOwnAcro()) {
      headerContent = (
        <div className="content">
          <div className="header">{this.props.result.acronym.join(". ")}</div>
        </div>
      );
    } else {
      headerContent = (
        <div className="content">
          <a
            className={
              "ui right corner " +
              (this.state.hasVotedForHOF ? "green" : "yellow") +
              " label"
            }
            href="#"
            onClick={this.voteForHOF}
            ref={ref => (this.voteLabel = ref)}
          >
            <i className="trophy icon" />
          </a>
          <div className="ui tiny popup">
            Vote to add this to the Hall of Fame
          </div>
          <div className="header">{this.props.result.acronym.join(". ")}</div>
        </div>
      );
    }

    return (
      <div className="ui fluid card acroCard">
        {headerContent}
        <div className="content">
          <div className="meta">{this.props.result.category}</div>
          <div className="description" ref={ref => (this.description = ref)}>
            {this.props.result.acro}
          </div>
          <div className="ui mini popup">{this.props.result.votes} votes</div>
        </div>
      </div>
    );
  }
}

const GameResultsRow = ({ result, user, gameId }) => (
  <tr>
    <td>
      <a
        href={FlowRouter.path("profile", { userId: result.id })}
        target="_blank"
        className="userProfilePicture"
      >
        <h4 className="ui image header">
          <img src={profilePicture(user, 80)} className="ui circular image" />
          <div className="content">
            {result.winner && <i className="star icon noRightMargin" />}
            {result.id === Meteor.userId() && (
              <i className="user icon noRightMargin" />
            )}
            {displayName(user)}
            <div className="sub header">
              {result.winner && <div>Game winner</div>}
              {result.fastestSubmitter && <div>Fastest average time</div>}
            </div>
          </div>
        </h4>
      </a>
      <div className="clear" />
      <div className="ui mini grey statistic">
        <div className="value">{result.totalVotes}</div>
        <div className="label">Votes</div>
      </div>
      <div className="ui mini grey statistic">
        <div className="value">{result.score}</div>
        <div className="label">Score</div>
      </div>
    </td>
    <td>
      {result.bestAcro && (
        <BestAcroCard result={result.bestAcro} gameId={gameId} />
      )}
    </td>
  </tr>
);

GameResultsRow.propTypes = {
  result: PropTypes.object.isRequired,
  gameId: PropTypes.string.isRequired,
  user: PropTypes.object
};

class GameResultsTable extends Component {
  static propTypes = {
    scores: PropTypes.object.isRequired,
    rounds: PropTypes.array.isRequired,
    winner: PropTypes.string,
    users: PropTypes.array.isRequired,
    gameId: PropTypes.string.isRequired
  };

  componentDidMount() {
    this.$scrollTableOuter = $(this.scrollTableOuter);
    this.$scrollTable = this.$scrollTableOuter.find(".scrollTable");

    this.$scrollTable.scroll(() => {
      var scrollLeft = this.$scrollTable.scrollLeft();
      var tableWidth = this.$scrollTable.find("table").width();
      var divWidth = this.$scrollTable.width();
      this.$scrollTableOuter.find(".scrollTable-fade").css({
        opacity: 1 - scrollLeft / (tableWidth - divWidth)
      });
    });
  }

  componentDidUpdate() {
    if (this.$scrollTable.prop("scrollWidth") <= this.$scrollTable.width()) {
      this.$scrollTableOuter.find(".scrollTable-fade").css({
        opacity: 0
      });
    }
  }

  gameResults = () => {
    let results = [];
    const scores = this.props.scores,
      rounds = this.props.rounds;

    for (let playerId in scores) {
      if (scores.hasOwnProperty(playerId)) {
        let obj = {
          id: playerId,
          score: scores[playerId],
          totalVotes: 0
        };

        if (playerId === this.props.winner) obj.winner = true;

        let avgTimeLeft = 0,
          submissions = 0,
          highestVotes = 1,
          bestAcros = [];

        for (let i = 0; i < rounds.length; i++) {
          const round = rounds[i],
            player = round.players[playerId];

          if (player) {
            obj.totalVotes += player.votes;
            const thisBestAcro = {
              id: playerId,
              acro: player.submission ? player.submission.acro : "",
              category: round.category,
              acronym: round.acronym,
              votes: player.votes
            };

            if (player.votes > highestVotes) {
              bestAcros = [thisBestAcro];
              highestVotes = player.votes;
            } else if (player.votes === highestVotes) {
              bestAcros.push(thisBestAcro);
            }

            if (player.submission) {
              avgTimeLeft += player.submission.timeLeft;
              submissions++;
            }
          }
        }

        if (submissions !== 0) obj.avgTimeLeft = avgTimeLeft / submissions;

        if (bestAcros.length > 1) obj.bestAcro = _.sample(bestAcros);
        else obj.bestAcro = bestAcros[0];

        results.push(obj);
      }
    }

    let fastestSubmitter,
      fastestTime = 0;

    for (let i = 0; i < results.length; i++) {
      if (results[i].avgTimeLeft > fastestTime) {
        fastestSubmitter = results[i].id;
        fastestTime = results[i].avgTimeLeft;
      }
    }

    for (let i = 0; i < results.length; i++) {
      if (results[i].id === fastestSubmitter) {
        results[i].fastestSubmitter = true;
        break;
      }
    }

    results = results.sort((a, b) => {
      return b.score - a.score;
    });

    return results;
  };

  render() {
    return (
      <div
        className="scrollTable-outer"
        ref={ref => (this.scrollTableOuter = ref)}
      >
        <div className="scrollTable-fade" />
        <div className="scrollTable">
          <table
            className="ui very basic celled unstackable table"
            id="endGameTable"
            style={{ minWidth: "500px" }}
          >
            <thead>
              <tr>
                <th>Player</th>
                <th>Best Acro</th>
              </tr>
            </thead>
            <tbody>
              {this.gameResults().map((result, index) => (
                <GameResultsRow
                  key={result.id}
                  result={result}
                  user={findUserById(this.props.users, result.id)}
                  gameId={this.props.gameId}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

export const AcrofeverEndGamePhase = ({
  scores,
  rounds,
  currentRound,
  winner,
  endTime,
  users,
  gameId
}) => {
  return (
    <div>
      <div>
        <CountdownHeader
          endTime={endTime}
          header={displayName(findUserById(users, winner)) + " won the game!"}
          subheader="New game starting soon..."
        />
      </div>

      <div className="ui divider" style={{ marginBottom: "2em" }} />

      <h3 className="ui center aligned header">Last round results</h3>

      <div className="ui basic segment">
        <RoundResultsTable round={rounds[currentRound - 1]} users={users} />
      </div>

      <div className="ui divider" />

      <h3 className="ui center aligned header">Game results</h3>
      <div className="ui basic segment">
        <GameResultsTable
          scores={scores}
          rounds={rounds}
          winner={winner}
          users={users}
          gameId={gameId}
        />
      </div>
    </div>
  );
};

AcrofeverEndGamePhase.propTypes = {
  scores: PropTypes.object.isRequired,
  rounds: PropTypes.array.isRequired,
  currentRound: PropTypes.number.isRequired,
  winner: PropTypes.string,
  endTime: PropTypes.instanceOf(Date).isRequired,
  gameId: PropTypes.string.isRequired
};
