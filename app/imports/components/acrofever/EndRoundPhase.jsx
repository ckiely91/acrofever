import PropTypes from "prop-types";
import React, { Component, PureComponent } from "react";
import { Meteor } from "meteor/meteor";

import { CountdownHeader } from "../Countdown";

import { profilePicture, displayName, findUserById } from "../../helpers";

class PointsPopup extends PureComponent {
  static propTypes = {
    totalPoints: PropTypes.number,
    votePoints: PropTypes.number,
    votedForWinnerPoints: PropTypes.number,
    notVotedNegativePoints: PropTypes.number,
    winnerPoints: PropTypes.number
  };

  static spanStyle = { display: "block", whiteSpace: "nowrap" };

  componentDidMount() {
    $(this.label).popup({
      inline: true,
      position: "left center"
    });
  }

  render() {
    return (
      <div className="points-popup">
        <a className="ui grey circular label" ref={ref => (this.label = ref)}>
          {this.props.totalPoints > 0
            ? "+" + this.props.totalPoints
            : this.props.totalPoints}
        </a>
        <div className="ui flowing popup">
          <div className="header">
            {(this.props.totalPoints > 0 ? "+" : "") + this.props.totalPoints}
          </div>
          <div className="content">
            {this.props.votePoints > 0 && (
              <span className="green" style={PointsPopup.spanStyle}>
                {this.props.votePoints} for votes received
              </span>
            )}
            {this.props.votedForWinnerPoints > 0 && (
              <span className="green" style={PointsPopup.spanStyle}>
                {this.props.votedForWinnerPoints} for voting for the winning
                Acro
              </span>
            )}
            {this.props.notVotedNegativePoints > 0 && (
              <span className="red" style={PointsPopup.spanStyle}>
                {this.props.notVotedNegativePoints} for not voting
              </span>
            )}
            {this.props.winnerPoints > 0 && (
              <span className="green" style={PointsPopup.spanStyle}>
                {this.props.winnerPoints} for winning the round
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }
}

const RoundResultsRow = ({ result, totalPoints, accolades, user }) => (
  <tr>
    <td>
      <a
        href={FlowRouter.path("profile", { userId: result.id })}
        target="_blank"
        className="userProfilePicture"
      >
        <h4 className="ui image header">
          <img
            src={profilePicture(user, 35)}
            className="ui mini circular image"
          />
          <div className="content">
            {displayName(user)}
            {accolades.length > 0 && (
              <div className="sub header">
                {accolades.map(a => <div key={a}>{a}</div>)}
              </div>
            )}
          </div>
        </h4>
      </a>
    </td>
    <td>{result.submission ? result.submission.acro : null}</td>
    <td>{result.votes}</td>
    <td>
      <PointsPopup
        totalPoints={totalPoints}
        votePoints={result.votePoints}
        votedForWinnerPoints={result.votedForWinnerPoints}
        notVotedNegativePoints={result.notVotedNegativePoints}
        winnerPoints={result.winnerPoints}
      />
    </td>
  </tr>
);

RoundResultsRow.propTypes = {
  result: PropTypes.object.isRequired,
  totalPoints: PropTypes.number.isRequired,
  accolades: PropTypes.array.isRequired,
  user: PropTypes.object
};

export class RoundResultsTable extends Component {
  static propTypes = {
    round: PropTypes.object.isRequired,
    users: PropTypes.array.isRequired
  };

  // All this just to implement that cool little fade on the scrollTable
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

  /* HELPERS */
  roundAcros = () => {
    const players = this.props.round.players;
    let roundAcros = [];

    for (var playerId in players) {
      let obj = players[playerId];
      obj.id = playerId;
      roundAcros.push(obj);
    }

    roundAcros = roundAcros.sort((a, b) => {
      return this.totalPoints(b) - this.totalPoints(a);
    });

    return roundAcros;
  };

  totalPoints = results => {
    return (
      results.votePoints +
      results.votedForWinnerPoints -
      results.notVotedNegativePoints +
      results.winnerPoints
    );
  };

  accolades = result => {
    let accolades = [];

    // round winner
    if (result.id === this.props.round.winner) accolades.push("Round winner");

    // fastest submitter
    if (result.submission) {
      const thisTimeLeft = result.submission.timeLeft;
      const players = this.props.round.players;
      let isFastest = true;

      for (let playerId in players) {
        if (
          playerId !== result.id &&
          players[playerId].submission &&
          players[playerId].submission.timeLeft > thisTimeLeft
        ) {
          isFastest = false;
          break;
        }
      }
      if (isFastest) accolades.push("Fastest submitter");
    }

    return accolades;
  };

  render() {
    const tableStyle = { minWidth: "500px" };
    return (
      <div
        className="scrollTable-outer"
        ref={ref => (this.scrollTableOuter = ref)}
      >
        <div className="scrollTable-fade" />
        <div className="scrollTable">
          <table
            className="ui very basic celled unstackable table"
            style={tableStyle}
          >
            <thead>
              <tr>
                <th>Player</th>
                <th>Acro</th>
                <th>Votes</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>
              {this.roundAcros().map((result, index) => (
                <RoundResultsRow
                  key={result.id}
                  result={result}
                  totalPoints={this.totalPoints(result)}
                  accolades={this.accolades(result)}
                  user={findUserById(this.props.users, result.id)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

export const AcrofeverEndRoundPhase = ({ round, endTime, users }) => {
  const acro = round.acronym.join(". ");

  return (
    <div>
      <div>
        <CountdownHeader
          endTime={endTime}
          header={acro}
          subheader={round.category}
        />
      </div>
      <div className="ui divider" style={{ marginBottom: "2em" }} />

      <h3 className="ui center aligned header">Round results</h3>

      <div className="ui basic segment">
        <RoundResultsTable round={round} users={users} />
      </div>

      <div className="ui hidden divider" />
    </div>
  );
};

AcrofeverEndRoundPhase.propTypes = {
  round: PropTypes.object.isRequired,
  endTime: PropTypes.instanceOf(Date).isRequired,
  users: PropTypes.array.isRequired
};
