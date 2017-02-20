import React, { PropTypes } from 'react';

import { AdminCategories, AdminHallOfFame } from './Admin';

const ModeratorHome = () => (
    <div>
        <a href={FlowRouter.path('moderatorHallOfFame')} className="ui button">Manage Hall of Fame</a>
        <a href={FlowRouter.path('moderatorCategories')} className="ui button">Manage categories</a>
    </div>
);

export class ModeratorMain extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            isModerator: false
        }
    }

    componentWillMount() {
        Meteor.call('isModerator', (err, res) => {
            this.setState({loading: false, isModerator: res});
        });
    }

    render() {
        if (this.state.loading) {
            return <div>Loading...</div>;
        } else if (this.state.isModerator !== true) {
            return <div>You don't have permission to access this page.</div>;
        } else {
            switch(this.props.subComponentString) {
                case "categories":
                    return <AdminCategories />;
                    break;
                case "halloffame":
                    return <AdminHallOfFame />;
                    break;
                default:
                    return <ModeratorHome />;
            }
        }
    }
}