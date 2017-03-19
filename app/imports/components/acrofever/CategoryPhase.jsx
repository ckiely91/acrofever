import React from 'react';

import {CountdownHeader} from '../Countdown';

import {playSound, displayName,acrofeverAnalytics} from '../../helpers';

const ChooseCategory = React.createClass({
    propTypes: {
        gameId: React.PropTypes.string.isRequired
    },
    getInitialState() {
        return {
            hasPickedCategory: false,
            randomCategories: null
        };
    },
    componentWillMount() {
        Meteor.call('getRandomCategories', 4, (err, res) => {
            if (err) {
                console.error(err);
                this.setState({randomCategories: []});
            } else {
                this.setState({randomCategories: res});
            }
        });
    },
    componentDidMount() {
        const form = $(this.form);
        form.form({
            fields: {
                customCategory: {
                    identifier: 'customCategory',
                    rules: [
                        {
                            type: 'empty',
                            prompt: 'Enter a custom category'
                        },
                        {
                            type: 'maxLength[100]',
                            prompt: 'Enter at most 100 characters'
                        }
                    ]
                }
            },
            onSuccess: (evt, fields) => {
                this.pickCategory(evt, fields.customCategory, true);
            }
        });
    },
    pickCategory(evt, category, isCustom) {
        evt.preventDefault();
        this.setState({hasPickedCategory: true});
        playSound('select');
        Meteor.call('acrofeverChooseCategory', this.props.gameId, category, (err) => {
            if (err) {
                console.error(err);
                this.setState({hasPickedCategory: false});
            }

            acrofeverAnalytics.track('chooseCategory', {category: category, custom: isCustom});
        });
    },
    render() {
        const gridStyle = {position: 'relative'};
        if (this.state.hasPickedCategory) {
            return <div className="ui active centered inline loader"></div>;
        } else {
            return (
                <div>
                    <h3 className="ui center aligned header">You're picking the category!</h3>
                    <div className="ui basic segment">
                        <div className="ui stackable two column very relaxed grid" style={gridStyle}>
                            <div className="column">
                                {(() => {
                                    if (this.state.randomCategories) {
                                        return <div className="ui relaxed celled list">
                                            {this.state.randomCategories.map((cat, index) => <a key={index} href="#" className="item categoryListItem" onClick={(evt) => this.pickCategory(evt, cat.category, false)}>{cat.category}</a>)}
                                        </div>;
                                    } else {
                                        return <div className="ui active centered inline loader"></div>
                                    }
                                })()}
                            </div>
                            {/* //Taking this out until Chrome bug that makes this look bad is fixed
                                 <div className="ui vertical divider">
                                    OR
                                 </div>
                             */}
                            <div className="column">
                                <form className="ui form" ref={(ref) => this.form = ref}>
                                    <div className="ui fluid action input">
                                        <input type="text" name="customCategory" placeholder="Category" required="true" />
                                        <button className="ui primary button" type="submit">Go</button>
                                    </div>
                                    <div className="ui error message"></div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
    }
});

export const AcrofeverCategoryPhase = React.createClass({
    mixins: [ReactMeteorData],
    propTypes: {
        round: React.PropTypes.object.isRequired,
        endTime: React.PropTypes.instanceOf(Date).isRequired,
        gameId: React.PropTypes.string.isRequired,
        config: React.PropTypes.object
    },
    getMeteorData() {
        return {
            categoryChooserDisplayName: displayName(this.props.round.categoryChooser)
        };
    },
    getInitialState() {
        return {
            showAcro: !(this.props.config && this.props.config.hideAcroInCategoryPhase)
        }
    },
    currentAcro() {
        var acro = this.props.round.acronym;
        return acro.join('. ');
    },
    render() {
        const dividerStyle = {marginBottom: '2em'};
        return (
            <div>
                <div>
                    <CountdownHeader endTime={this.props.endTime} header={this.state.showAcro ? this.currentAcro() : 'Acro hidden'} />
                </div>
                <div className="ui divider" style={dividerStyle}></div>
                <div>
                    {this.props.round.categoryChooser === Meteor.userId() ? <ChooseCategory gameId={this.props.gameId}/> : <h3 className="ui center aligned disabled header">{this.data.categoryChooserDisplayName} is picking a category...</h3>}
                </div>
                <div className="ui hidden divider"></div>
            </div>
        );
    }
});