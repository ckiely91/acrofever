import PropTypes from "prop-types";
import React from "react";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";

import { Nags } from "../collections";
import { acrofeverAnalytics } from "../helpers";

const closeNag = (evt, nagId) => {
  evt.preventDefault();
  $(evt.currentTarget)
    .closest(".message")
    .transition("fade", "300ms");

  Meteor.setTimeout(() => {
    //allow it to fade out first
    Meteor.call("markNagAsClosed", nagId);
  }, 300);

  acrofeverAnalytics.track("closeNag", { id: nagId });
};

const SingleNag = ({ nag }) => {
  const nagHtml = { __html: nag.message };

  return (
    <div className="sixteen-wide-tablet ten-wide-computer column">
      <div
        className={
          "ui " +
          (nag.icon ? "icon" : "") +
          " " +
          (nag.colour ? nag.colour : "") +
          " message"
        }
      >
        <i className="close icon" onClick={evt => closeNag(evt, nag._id)} />
        {nag.icon ? <i className={nag.icon + " icon"} /> : null}
        <div className="content">
          {nag.title ? <div className="header">{nag.title}</div> : null}
          <p dangerouslySetInnerHTML={nagHtml} />
        </div>
      </div>
    </div>
  );
};

SingleNag.propTypes = {
  nag: PropTypes.object.isRequired
};

const NagsComponent = ({ nags }) => {
  if (!nags || nags.length === 0) {
    return null;
  }

  return (
    <div className="ui centered grid">
      {nags.map(nag => <SingleNag key={nag._id} nag={nag} />)}
    </div>
  );
};

export const NagsComponentContainer = withTracker(() => {
  const user = Meteor.user();
  let closedNags = [];

  if (user) {
    if (user.profile && user.profile.closedNags) {
      Meteor.subscribe("nags", user.profile.closedNags);
      closedNags = user.profile.closedNags;
    } else {
      Meteor.subscribe("nags");
    }
  }

  return {
    nags: Nags.find(
      { active: true, _id: { $not: { $in: closedNags } } },
      { sort: { timestamp: -1 } }
    ).fetch()
  };
})(NagsComponent);
