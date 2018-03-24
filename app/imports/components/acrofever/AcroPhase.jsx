import PropTypes from "prop-types";
import React, { PureComponent } from "react";
import { Meteor } from "meteor/meteor";

import { CountdownHeader } from "../Countdown";

import { playSound, acrofeverAnalytics } from "../../helpers";

class SubmitAcroForm extends PureComponent {
  static propTypes = {
    chosenAcro: PropTypes.string,
    submitAcro: PropTypes.func.isRequired
  };

  componentDidMount() {
    const $forms = $([this.desktopForm, this.mobileForm]);

    $forms.form({
      fields: {
        acro: {
          identifier: "acro",
          rules: [
            {
              type: "empty",
              prompt: "You must submit an Acro!"
            },
            {
              type: "maxLength[100]",
              prompt: "Please submit an Acro under 100 characters"
            }
          ]
        }
      },
      onSuccess: (evt, fields) => {
        this.props.submitAcro(evt, fields);
      }
    });

    // make mobile textarea submit on enter, rather than new line
    const $mobileForm = $(this.mobileForm);
    $mobileForm.keypress(evt => {
      if (evt.which == "13") {
        $mobileForm.form("submit");
        return false;
      }
    });
  }

  render() {
    return (
      <div>
        {/* desktop version */}
        <form
          className="ui form hiddenOnMobile"
          ref={ref => (this.desktopForm = ref)}
        >
          <div className="ui fluid action input">
            <input
              type="text"
              name="acro"
              placeholder="Write your acro"
              defaultValue={this.props.chosenAcro}
              required="true"
            />
            <button className="ui primary button" type="submit">
              Go
            </button>
          </div>
          <div className="ui error message" />
        </form>

        {/* mobile version */}
        <form
          className="ui form showOnMobile"
          ref={ref => (this.mobileForm = ref)}
        >
          <div className="field">
            <textarea
              type="text"
              name="acro"
              placeholder="Write your acro"
              defaultValue={this.props.chosenAcro}
              rows="2"
              required="true"
            />
          </div>
          <button className="ui primary fluid button" type="submit">
            Go
          </button>
          <div className="ui error message" />
        </form>
      </div>
    );
  }
}

class SubmitAcro extends PureComponent {
  static propTypes = {
    round: PropTypes.object.isRequired,
    gameId: PropTypes.string.isRequired
  };

  constructor(props) {
    super(props);
    let chosenAcro,
      hasChosenAcro = false,
      userId = Meteor.userId();

    if (props.round.players[userId] && props.round.players[userId].submission) {
      chosenAcro = props.round.players[userId].submission.acro;
      hasChosenAcro = true;
    }

    this.state = { chosenAcro, hasChosenAcro };
  }

  changeAcro = evt => {
    evt.preventDefault();
    this.setState({ hasChosenAcro: false });
  };

  submitAcro = (evt, fields) => {
    evt.preventDefault();
    var form = $(evt.currentTarget),
      btn = form.find("button");

    btn.addClass("loading");

    Meteor.call("acrofeverSubmitAcro", this.props.gameId, fields.acro, err => {
      btn.removeClass("loading");
      if (err) {
        form.form("add errors", [err.reason]);
      } else {
        this.setState({
          hasChosenAcro: true,
          chosenAcro: fields.acro
        });
        playSound("select");
        acrofeverAnalytics.track("submitAcro", {
          acroLength: fields.acro.length
        });
      }
    });
  };

  render() {
    const submittedAcro = (
      <p>
        <strong>Submitted acro:</strong> {this.state.chosenAcro}
        <br />
        (<a href="#" onClick={this.changeAcro}>
          change?
        </a>)
      </p>
    );

    return (
      <div className="ui centered grid">
        <div className="sixteen-wide-tablet ten-wide-computer center aligned column">
          <h3 className="ui header">Write your Acro</h3>
          <div>
            {this.state.hasChosenAcro ? (
              submittedAcro
            ) : (
              <SubmitAcroForm
                chosenAcro={this.state.chosenAcro}
                submitAcro={this.submitAcro}
              />
            )}
          </div>
        </div>
      </div>
    );
  }
}

export const AcrofeverAcroPhase = ({ round, endTime, gameId }) => {
  const acro = round.acronym.join(". ");
  const isInRound = round.players[Meteor.userId()];

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
      <div>
        {isInRound ? (
          <SubmitAcro round={round} gameId={gameId} />
        ) : (
          <h3 className="ui center aligned disabled header">
            Players are writing their acros...
          </h3>
        )}
      </div>
      <div className="ui hidden divider" />
    </div>
  );
};

AcrofeverAcroPhase.propTypes = {
  round: PropTypes.object.isRequired,
  endTime: PropTypes.instanceOf(Date).isRequired,
  gameId: PropTypes.string.isRequired
};
