import PropTypes from "prop-types";
import React, { PureComponent } from "react";
import { Meteor } from "meteor/meteor";

import { AdminCategoriesContainer, AdminHallOfFameContainer } from "./Admin";

const ModeratorHome = () => (
  <div>
    <a href={FlowRouter.path("moderatorHallOfFame")} className="ui button">
      Manage Hall of Fame
    </a>
    <a href={FlowRouter.path("moderatorCategories")} className="ui button">
      Manage categories
    </a>
  </div>
);

export class ModeratorMain extends PureComponent {
  state = {
    loading: true,
    isModerator: false
  };

  componentWillMount() {
    Meteor.call("isModerator", (err, res) => {
      this.setState({ loading: false, isModerator: res });
    });
  }

  render() {
    if (this.state.loading) {
      return <div>Loading...</div>;
    } else if (this.state.isModerator !== true) {
      return <div>You don't have permission to access this page.</div>;
    } else {
      switch (this.props.subComponentString) {
        case "categories":
          return <AdminCategoriesContainer />;
          break;
        case "halloffame":
          return <AdminHallOfFameContainer />;
          break;
        default:
          return <ModeratorHome />;
      }
    }
  }
}
