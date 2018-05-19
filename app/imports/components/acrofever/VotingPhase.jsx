import PropTypes from "prop-types";
import React from "react";
import { Meteor } from "meteor/meteor";

import { CountdownHeader } from "../Countdown";

import { playSound, acrofeverAnalytics } from "../../helpers";

const handleVote = (evt, id, gameId) => {
  evt.preventDefault();
  Meteor.call("acrofeverVoteForAcro", gameId, id);
  playSound("select");
  acrofeverAnalytics.track("voteForAcro");
};

const AcroVotingSelectionItem = ({ id, gameId, acro, votedForThis }) => (
  <div
    className={`item ${votedForThis ? "active" : ""}`}
    onClick={evt => handleVote(evt, id, gameId)}
  >
    <div className="content">
      {acro} {votedForThis ? <i className="check icon" /> : null}
    </div>
  </div>
);

const AcroVoting = ({ round, gameId }) => {
  const roundAcros = [];
  const roundPlayers = Object.keys(round.players);
  const userId = Meteor.userId();
  for (let i = 0; i < roundPlayers.length; i++) {
    const playerId = roundPlayers[i];
    if (
      playerId !== userId &&
      round.players[playerId] &&
      round.players[playerId].submission
    ) {
      roundAcros.push({
        id: playerId,
        acro: round.players[playerId].submission.acro
      });
    }
  }

  const isInRound = !!round.players[userId];

  const votedForThisAcro = id => {
    return round.players[userId].vote === id;
  };

  return (
    <div className="ten wide center aligned column">
      <h3 className={isInRound ? "ui header" : "ui disabled header"}>
        {isInRound
          ? "Vote for your favourite Acro"
          : "Players are voting for their favourite Acros..."}
      </h3>
      {isInRound ? (
        <div
          style={{ textAlign: "center" }}
          className="ui middle aligned selection list"
        >
          {roundAcros.map(acro => (
            <AcroVotingSelectionItem
              key={acro.id}
              id={acro.id}
              acro={acro.acro}
              gameId={gameId}
              votedForThis={votedForThisAcro(acro.id)}
            />
          ))}
        </div>
      ) : (
        <div className="ui relaxed list">
          {roundAcros.map(acro => (
            <div key={acro.id} className="item">
              {acro.acro}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

AcroVoting.propTypes = {
  round: PropTypes.object.isRequired,
  gameId: PropTypes.string.isRequired
};

export const AcrofeverVotingPhase = ({ round, endTime, gameId }) => {
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
      <div className="ui ten column centered grid">
        <AcroVoting round={round} gameId={gameId} />
      </div>
      <div className="ui hidden divider" />
    </div>
  );
};
