import React from 'react';

class SingleNag extends React.Component {
    closeNag(evt) {
        evt.preventDefault();
        $(evt.currentTarget).closest('.message').transition('fade', '300ms');

        var self = this;
        Meteor.setTimeout(() => {
            //allow it to fade out first
            Meteor.call('markNagAsClosed', self.props.nag._id);
        }, 300);

        analytics.track("closeNag", {
            id: this.props.nag._id
        });
    }

    render() {
        return (
            <div className="sixteen-wide-tablet ten-wide-computer column">
                <div className={"ui " + (this.props.nag.icon ? 'icon' : '') + ' ' + (this.props.nag.colour ? this.props.nag.colour : '') + ' message'}>
                    <i className="close icon" onClick={(evt) => this.closeNag(evt)}></i>
                    {this.props.nag.icon ? <i className={this.props.nag.icon + ' icon'}></i> : null}
                    <div className="content">
                        {this.props.nag.title ? <div className="header">{this.props.nag.title}</div> : null}
                        <p>{this.props.nag.message}</p>
                    </div>
                </div>
            </div>
        );
    }
}

SingleNag.propTypes = {
    nag: React.PropTypes.object.isRequired
};

export const NagsComponent = React.createClass({
    mixins: [ReactMeteorData],
    getMeteorData() {
        var user = Meteor.user();
        var closedNags = [];

        if (user) {
            if (user.profile && user.profile.closedNags) {
                Meteor.subscribe('nags', user.profile.closedNags);
                closedNags = user.profile.closedNags;
            } else {
                Meteor.subscribe('nags');
            }
        }

        return {
            nags: Nags.find({active: true, _id: {$not: {$in: closedNags}}}, {sort: {timestamp: -1}}).fetch()
        };
    },
    render() {
        if (this.data.nags.length > 0) {
            return (
                <div className="ui centered grid">
                    {this.data.nags.map((nag, index) => <SingleNag key={index} nag={nag} />)}
                </div>
            )
        } else {
            return false;
        }
    }
});