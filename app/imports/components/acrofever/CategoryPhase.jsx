import PropTypes from "prop-types";
import React, { PureComponent } from "react";
import { Meteor } from "meteor/meteor";

import { CountdownHeader } from "../Countdown";

import {
  playSound,
  displayName,
  acrofeverAnalytics,
  findUserById
} from "../../helpers";

class ChooseCategory extends PureComponent {
  static propTypes = {
    gameId: PropTypes.string.isRequired
  };

  state = {
    hasPickedCategory: false,
    randomCategories: null
  };

  componentWillMount() {
    Meteor.call("getRandomCategories", 4, (err, res) => {
      if (err) {
        console.error(err);
        this.setState({ randomCategories: [] });
      } else {
        this.setState({ randomCategories: res });
      }
    });
  }

  componentDidMount() {
    const form = $(this.form);
    form.form({
      fields: {
        customCategory: {
          identifier: "customCategory",
          rules: [
            {
              type: "empty",
              prompt: "Enter a custom category"
            },
            {
              type: "maxLength[100]",
              prompt: "Enter at most 100 characters"
            }
          ]
        }
      },
      onSuccess: (evt, fields) => {
        this.pickCategory(evt, fields.customCategory, true);
      }
    });
  }

  pickCategory = (evt, category, isCustom) => {
    evt.preventDefault();
    this.setState({ hasPickedCategory: true });
    playSound("select");
    Meteor.call("acrofeverChooseCategory", this.props.gameId, category, err => {
      if (err) {
        console.error(err);
        this.setState({ hasPickedCategory: false });
      }

      acrofeverAnalytics.track("chooseCategory", {
        category: category,
        custom: isCustom
      });
    });
  };

  render() {
    const gridStyle = { position: "relative" };
    if (this.state.hasPickedCategory) {
      return <div className="ui active centered inline loader" />;
    } else {
      return (
        <div>
          <h3 className="ui center aligned header">
            You're picking the category!
          </h3>
          <div className="ui basic segment">
            <div
              className="ui stackable two column very relaxed grid"
              style={gridStyle}
            >
              <div className="column">
                {(() => {
                  if (this.state.randomCategories) {
                    return (
                      <div className="ui relaxed celled list">
                        {this.state.randomCategories.map((cat, index) => (
                          <a
                            key={index}
                            href="#"
                            className="item categoryListItem"
                            onClick={evt =>
                              this.pickCategory(evt, cat.category, false)
                            }
                          >
                            {cat.category}
                          </a>
                        ))}
                      </div>
                    );
                  } else {
                    return <div className="ui active centered inline loader" />;
                  }
                })()}
              </div>
              <div className="column">
                <form className="ui form" ref={ref => (this.form = ref)}>
                  <div className="ui fluid action input">
                    <input
                      type="text"
                      name="customCategory"
                      placeholder="Category"
                      required="true"
                    />
                    <button className="ui primary button" type="submit">
                      Go
                    </button>
                  </div>
                  <div className="ui error message" />
                </form>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }
}

export const AcrofeverCategoryPhase = ({
  round,
  endTime,
  gameId,
  config,
  users
}) => {
  const categoryChooserDisplayName = displayName(
    findUserById(users, round.categoryChooser)
  );
  const acro = round.acronym.join(". ");
  const showAcro = !(config && config.hideAcroInCategoryPhase);

  return (
    <div>
      <div>
        <CountdownHeader
          endTime={endTime}
          header={showAcro ? acro : "Acro hidden"}
        />
      </div>
      <div className="ui divider" style={{ marginBottom: "2em" }} />
      <div>
        {round.categoryChooser === Meteor.userId() ? (
          <ChooseCategory gameId={gameId} />
        ) : (
          <h3 className="ui center aligned disabled header">
            {categoryChooserDisplayName} is picking a category...
          </h3>
        )}
      </div>
      <div className="ui hidden divider" />
    </div>
  );
};
