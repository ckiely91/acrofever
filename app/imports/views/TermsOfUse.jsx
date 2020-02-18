import React, { PureComponent } from "react";

export const TermsOfUseText = (
  <>
    <h3 className="ui dividing header">Terminology for this document</h3>
    <p>“Website” is acrofever.com.</p>
    <p>
      “Site Administrator” is a person or persons, as designated by the Site
      Owner, that is responsible for the day-to-day technical and operational
      administration of the Website.
    </p>
    <p>
      “Site Moderators” refer to specific individuals who have been empowered to
      enforce certain aspects of this Terms of Use including the ability to ban
      accounts and approve Hall of Fame submissions. Site Moderators can change
      from time to time, and are under the authority of Site Administrators.
    </p>
    <p>“Site Guest” refer to all other visitors to the Website.</p>
    <h3 className="ui dividing header">No right to access or use</h3>
    <p>
      This website is for Members Only. Non-members are not permitted to
      participate in website activities including chats or gaming. IE: You must
      have a valid account in order to participate in this Website. There is no
      perpetual right to access this website. This site is Private Property, and
      by visiting, you are a guest. The Administration may remove your access to
      this site at any time, for any reason, without explanation.
    </p>
    <h3 className="ui dividing header">Valid contact email address</h3>
    <p>
      You are required to have a current working email address to become a
      member of this Website. As such, one must be provided when submitting your
      account application. Site Management may need to communicate with you from
      time-to-time. Use of your contact details is in conformance with our
      Privacy Policy{" "}
      <a href="https://www.iubenda.com/privacy-policy/7785507">here</a>.
    </p>
    <h3 className="ui dividing header">Banned accounts</h3>
    <p>
      Your account being banned from the website will be considered a revocation
      of site membership, and constitutes official notice that you are no longer
      permitted to access this website. The ban extends to you as an individual,
      not just the account you created that got banned.
    </p>
    <h3 className="ui dividing header">Code of conduct</h3>
    <h4>Harassment</h4>
    <p>
      Harassment of other Guests or Administration will not be tolerated. This
      includes, but is not limited to: “Flaming” others, abusive messages,
      defamatory comments, etc., in either the Chat Window, Acro Submission,
      Topic Submission boxes, or anywhere else on this website. If a player asks
      you to stop making comments to them which they feel are inappropriate, you
      are to cease your comments to and about them immediately. Harassing other
      players will result in your account being banned.
    </p>
    <h4>Racism and hate</h4>
    <p>
      Promoting hate and intolerance of any culture, race, sex or religion will
      result in your account being banned.
    </p>
    <h4>Impersonation</h4>
    <p>
      Any attempt to impersonate another player will result in your account
      being banned. Examples of Impersonation include, but are not limited to:
      Profile pictures, account handles, names or any other part of another
      account's identity.
    </p>
    <h4>Multiple user accounts</h4>
    <p>
      Unless you have obtained specific approval in writing from an
      Administrator, you are only permitted to have one account on this website.
      Failure to adhere to this will result in all your accounts being banned,
      and your IP being blocked from further access.{" "}
    </p>
    <h4>Public performance and broadcasting</h4>
    <p>
      You are not permitted to access or play this Website in a public forum, or
      broadcast, stream, or otherwise transmit this website or its gameplay
      without the express written consent of Site Administration. For the
      purposes of this Terms of Use, “Public Forum” means any venue where the
      Website is displayed where members of the general public can be reasonably
      expected to view the Website en masse. Examples of Public Form include,
      but are not limited to: Bars and Restaurants, Outdoor events, Arenas, etc.
    </p>
    <h4>Adult content</h4>
    <p>
      Users of this website have the ability to submit free-form text on their
      own accord. Content that general audiences can reasonably consider to be
      offensive and adult-oriented are NOT permitted in any lobby or game with
      “Clean” in the title. Therefore, you should expect content that all other
      lobbies to be Adult Content. If you do not want to see adult content, you
      can either enter a game labelled “Clean”, or leave the website. Users
      posting adult content to games or lobbies labelled “Clean” will have their
      accounts banned.
    </p>
    <h3 className="ui dividing header">No liability</h3>
    <p>
      Site Administration and Site Moderators are not liable in any way for the
      content on this website that is produced by other website visitors and
      members. However, you have the ability to report any abuse or breaking of
      the aforementioned code of conduct, and action will be taken if
      appropriate.{" "}
    </p>
    <h3 className="ui dividing header">Reporting abuse</h3>
    <p>
      All reports of abuse should be sent via email to{" "}
      <a href="mailto:abuse@acrofever.com">abuse@acrofever.com</a>. Please do
      not email the Site Administrators or Site Moderators directly, as the
      proper abuse email address will go to all Site Administrators. Include a
      screen capture of what you’re reporting including the full URL of the game
      page as well if you can.
    </p>
  </>
);

class TermsOfUse extends PureComponent {
  state = {
    checkboxChecked: false,
    loading: false
  };

  acceptTermsOfUse = () => {
    this.setState({ loading: true });
    Meteor.call("acceptTermsOfUse");
  };

  render() {
    return (
      <div style={{ padding: "40px 0 80px 0" }} className="ui text container">
        <h2 className="ui dividing header">Acrofever Terms of Use</h2>
        <div className="ui info message">
          Before you can access this website, you must read and agree to the
          following terms.
        </div>
        {TermsOfUseText}
        <div className="ui section divider" />
        <div
          className={`ui checkbox ${
            this.state.checkboxChecked ? "checked" : ""
          }`}
          onClick={() =>
            this.setState(({ checkboxChecked }) => ({
              checkboxChecked: !checkboxChecked
            }))
          }
        >
          <input
            checked={this.state.checkboxChecked}
            type="checkbox"
            tabIndex="0"
            className="hidden"
          />
          <label style={{ lineHeight: "120%" }}>
            I agree to the Acrofever Terms of Use, and acknowledge that breaking
            the agreed terms can result in immediate banning from the site.
          </label>
        </div>
        <button
          style={{ marginTop: "20px" }}
          className={`ui primary button ${
            !this.state.checkboxChecked ? "disabled" : ""
          } ${this.state.loading ? "loading" : ""}`}
          onClick={this.acceptTermsOfUse}
        >
          Continue
        </button>
      </div>
    );
  }
}

export default TermsOfUse;
