import PropTypes from "prop-types";
import React, { PureComponent } from "react";
import { withTracker } from "meteor/react-meteor-data";
import { NavComponent } from "../components/Nav";
import { NagsComponentContainer } from "../components/Nags";
import { FooterComponent } from "../components/Footer";
import TermsOfUse from "./TermsOfUse";
import {
  HowToPlayModal,
  PageDimmer,
  NotificationInfoModal,
  TermsOfUseModal
} from "../components/Modals";
import { EventBannerContainer } from "../components/Events";

import { headerMeta, headerLinks } from "../statics";

export class Layout extends PureComponent {
  static propTypes = {
    content: PropTypes.any.isRequired,
    currentUser: PropTypes.object
  };

  UNSAFE_componentWillMount() {
    DocHead.setTitle("Acrofever");

    headerMeta.map(item => DocHead.addMeta(item));
    headerLinks.map(item => DocHead.addLink(item));

    //Buzz library
    DocHead.loadScript(
      "https://cdnjs.cloudflare.com/ajax/libs/buzz/1.1.10/buzz.js"
    );
  }

  componentDidMount() {
    //general helper functions, jquery stuff available on all pages goes here
    $.fn.isOnScreen = function() {
      //jQuery function to check if an element is in the viewport
      var win = $(window);

      var viewport = {
        top: win.scrollTop(),
        left: win.scrollLeft()
      };
      viewport.right = viewport.left + win.width();
      viewport.bottom = viewport.top + win.height();

      var bounds = this.offset();
      bounds.right = bounds.left + this.outerWidth();
      bounds.bottom = bounds.top + this.outerHeight();

      return !(
        viewport.right < bounds.left ||
        viewport.left > bounds.right ||
        viewport.bottom < bounds.top ||
        viewport.top > bounds.bottom
      );
    };
  }

  notificationsSupported() {
    return typeof Notification !== "undefined";
  }

  render() {
    if (
      this.props.currentUser &&
      !this.props.currentUser.profile.termsOfUseAccepted
    ) {
      return (
        <div>
          <NavComponent />
          <div className="ui main container">
            <TermsOfUse />
            <FooterComponent />
          </div>
        </div>
      );
    }

    return (
      <div>
        <NavComponent />
        <EventBannerContainer />
        <div className="ui main container">
          <NagsComponentContainer />
          {_.isFunction(this.props.content)
            ? this.props.content()
            : this.props.content}
          <FooterComponent />
        </div>
        <HowToPlayModal />
        <TermsOfUseModal />
        <PageDimmer />
        {this.notificationsSupported() ? <NotificationInfoModal /> : null}
      </div>
    );
  }
}

export default withTracker(() => {
  return {
    currentUser: Meteor.user()
  };
})(Layout);
