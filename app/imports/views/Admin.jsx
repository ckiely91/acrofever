import React from 'react';

import {displayName} from '../helpers';

class AdminNagRow extends React.Component {
    editNag(evt, action) {
        evt.preventDefault();
        Meteor.call('adminEditNag', this.props._id, action);
    }

    render() {
        let button;

        if (this.props.active) {
            button = (
                <div>
                    <i className="check icon" />
                    <a href="#" onClick={(evt) => this.editNag(evt, 'deactivate')}>Deactivate</a>
                </div>
            );
        } else {
            button = (
                <div>
                    <a href="#" onClick={(evt) => this.editNag(evt, 'activate')}>Activate</a><br /><br />
                    <a href="#" onClick={(evt) => this.editNag(evt, 'delete')}>Delete</a>
                </div>
            );
        }

        return (
            <tr>
                <td>{moment(this.props.timestamp).calendar()}<br />{this.props._id}</td>
                <td>{this.props.title}</td>
                <td dangerouslySetInnerHTML={() => {__html: this.props.message}} />
                <td>{this.props.icon}</td>
                <td>{this.props.colour}</td>
                <td>
                    {button}
                </td>
            </tr>
        );
    }
}

export const AdminNags = React.createClass({
    mixins: [ReactMeteorData],
    getMeteorData() {
        Meteor.subscribe('adminNags');

        return {
            nags: Nags.find({},{sort: {timestamp: -1}}).fetch()
        }
    },

    componentDidMount() {
        $(this.form).form({
            onSuccess: (evt, fields) => {
                this.submitForm(evt, fields);
            }
        });
    },

    submitForm(evt, fields) {
        evt.preventDefault();
        let form = $(evt.currentTarget),
            button = form.find('button');
        button.addClass('loading');

        if (fields.message.length > 0)
            fields.message = fields.message.replace(/\n/g,'<br>');

        Meteor.call('adminAddNag', fields, function(err) {
            button.removeClass('loading');
            if (err) {
                console.log(err);
            } else {
                form.trigger('reset');
            }
        });
    },

    render() {
        return (
            <div>
                <a href={FlowRouter.path('adminHome')} className="ui labeled icon button"><i className="arrow left icon"></i> Back</a>
                <h2 className="ui header">Manage nags</h2>

                <h3 className="ui header">Add nag</h3>
                <form className="ui form" ref={(ref) => this.form = ref}>
                    <div className="field">
                        <input type="text" placeholder="Title" name="title" />
                    </div>
                    <div className="field">
                        <textarea placeholder="Message" name="message"></textarea>
                    </div>
                    <div className="field">
                        <input type="text" placeholder="Icon" name="icon" />
                    </div>
                    <div className="field">
                        <input type="text" placeholder="Colour" name="colour" />
                    </div>
                    <div className="field">
                        <div className="ui checkbox">
                            <input type="checkbox" checked="true" name="active" />
                            <label>Active</label>
                        </div>
                    </div>
                    <button type="submit" className="ui button">Submit</button>
                </form>

                <div className="ui divider"></div>

                <table className="ui table">
                    <thead>
                    <tr>
                        <th>Created</th>
                        <th>Title</th>
                        <th>Message</th>
                        <th>Icon</th>
                        <th>Colour</th>
                        <th></th>
                    </tr>
                    </thead>
                    <tbody>
                        {this.data.nags.map((item, index) => <AdminNagRow key={index} {...item} />)}
                    </tbody>
                </table>
            </div>
        )
    }
});

const AdminHallOfFameRow = React.createClass({
    mixins: [ReactMeteorData],
    getMeteorData() {
        return {
            username: displayName(this.props.userId)
        }
    },

    getInitialState() {
        return {
            loading: false
        };
    },

    editEntry(evt, action) {
        evt.preventDefault();
        this.setState({loading: true});
        let opts = {};

        opts[action] = true;

        Meteor.call('adminEditHallOfFameEntry', this.props._id, opts, (err) => {
            this.setState({loading: false});
            if (err) {
                alert(err.reason);
                console.error(err);
            }
        });
    },

    render() {
        let button;

        if (this.props.active) {
            button = (
                <div>
                    <i className="check icon"></i>
                    <a href="#" onClick={(evt) => this.editEntry(evt, 'deactivate')}>Deactivate</a>
                </div>
            );
        } else {
            button = (
                <div>
                    <a href="#" onClick={(evt) => this.editEntry(evt, 'activate')}>Activate</a><br /><br />
                    <a href="#" onClick={(evt) => this.editEntry(evt, 'delete')}>Delete</a>
                </div>
            )
        }

        return (
            <tr>
                <td>{moment(this.props.created).format('MMMM Do YYYY, h:mm:ss a')}</td>
                <td>{this.data.username}</td>
                <td>{this.props.acronym.join('. ')}</td>
                <td>{this.props.category}</td>
                <td>{this.props.acro}</td>
                <td>{this.props.votes.length}</td>
                <td>{this.state.loading ? <div className="ui inline active loader"></div> : button}</td>
            </tr>
        )
    }
});

export const AdminHallOfFame = React.createClass({
    mixins: [ReactMeteorData],
    getMeteorData() {
        Meteor.subscribe('adminHallOfFame');

        let data = {
            hallOfFame: HallOfFame.find({}, {sort: {created: -1}}).fetch()
        };

        let userIds = [];
        _.each(data.hallOfFame, (item) => {
            userIds.push(item.userId);
        });

        Meteor.subscribe('otherPlayers', userIds);

        return data;
    },
    render() {
        return (
            <div>
                <a href={FlowRouter.path('adminHome')} className="ui labeled icon button"><i className="arrow left icon"></i> Back</a>
                <h2 className="ui header">Approve Hall of Fame entries</h2>
                <table className="ui table">
                    <thead>
                    <tr>
                        <th>Created</th>
                        <th>User</th>
                        <th>Acronym</th>
                        <th>Category</th>
                        <th>Acro</th>
                        <th>Votes</th>
                        <th></th>
                    </tr>
                    </thead>
                    <tbody>
                        {this.data.hallOfFame.map((item, index) => <AdminHallOfFameRow key={index} {...item} />)}
                    </tbody>
                </table>
            </div>
        );
    }
});

export const AdminHome = () => (
    <div>
        <a href={FlowRouter.path('adminHallOfFame')} className="ui button">Approve Hall of Fame</a>
        <a href={FlowRouter.path('adminNags')} className="ui button">Manage nags</a>
    </div>
);

export const AdminMain = React.createClass({
    propTypes: {
        subContent: React.PropTypes.element.isRequired
    },
    getInitialState() {
        return {
            isAdminUser: false
        };
    },
    componentDidMount() {
        Meteor.call('isAdminUser', (err, res) => {
            this.setState({isAdminUser: res});
        });
    },
    render() {
        if (this.state.isAdminUser) {
            return this.props.subContent;
        } else {
            return <div>You don't have permission to access this page.</div>;
        }
    }
});