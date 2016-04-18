import React from 'react';

import {CountdownHeader} from '../Countdown';

import {playSound, acrofeverAnalytics} from '../../helpers';

const SubmitAcroForm = React.createClass({
    propTypes: {
        chosenAcro: React.PropTypes.string,
        submitAcro: React.PropTypes.func.isRequired
    },
    componentDidMount() {
        const $forms = $([this.desktopForm, this.mobileForm]);

        $forms.form({
            fields: {
                acro: {
                    identifier: 'acro',
                    rules: [
                        {
                            type: 'empty',
                            prompt: 'You must submit an Acro!'
                        },
                        {
                            type: 'maxLength[100]',
                            prompt: 'Please submit an Acro under 100 characters'
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
        $mobileForm.keypress((evt) => {
            if (evt.which == '13') {
                $mobileForm.form('submit');
                return false;
            }
        });
    },
    render() {
        return (
            <div>
                {/* desktop version */}
                <form className="ui form hiddenOnMobile" ref={(ref) => this.desktopForm = ref}>
                    <div className="ui fluid action input">
                        <input type="text" name="acro" placeholder="Write your acro" defaultValue={this.props.chosenAcro} required="true" />
                        <button className="ui primary button" type="submit">Go</button>
                    </div>
                    <div className="ui error message"></div>
                </form>

                {/* mobile version */}
                <form className="ui form showOnMobile" ref={(ref) => this.mobileForm = ref}>
                    <div className="field">
                        <textarea type="text" name="acro" placeholder="Write your acro" defaultValue={this.props.chosenAcro} rows="2" required="true" />
                    </div>
                    <button className="ui primary fluid button" type="submit">Go</button>
                    <div className="ui error message"></div>
                </form>
            </div>
        )
    }
});

const SubmitAcro = React.createClass({
    propTypes: {
        round: React.PropTypes.object.isRequired,
        gameId: React.PropTypes.string.isRequired
    },
    getInitialState() {
        let chosenAcro,
            hasChosenAcro = false,
            userId = Meteor.userId();

        if (this.props.round.players[userId] && this.props.round.players[userId].submission) {
            chosenAcro = this.props.round.players[userId].submission.acro;
            hasChosenAcro = true;
        }

        return {chosenAcro, hasChosenAcro};
    },
    changeAcro(evt) {
        evt.preventDefault();
        this.setState({hasChosenAcro: false});
    },
    submitAcro(evt, fields) {
        evt.preventDefault();
        var form = $(evt.currentTarget),
            btn = form.find('button');

        btn.addClass('loading');

        Meteor.call('acrofeverSubmitAcro', this.props.gameId, fields.acro, (err) => {
           btn.removeClass('loading');
            if (err) {
                form.form('add errors', [err.reason]);
            } else {
                this.setState({
                    hasChosenAcro: true,
                    chosenAcro: fields.acro
                });
                playSound('select');
                acrofeverAnalytics.track('submitAcro', {acroLength: fields.acro.length});
            }
        });
    },
    render() {
        const submittedAcro = (
            <p>
                <strong>Submitted acro:</strong> {this.state.chosenAcro}<br />
                (<a href="#" onClick={this.changeAcro}>change?</a>)
            </p>
        );

        return (
            <div className="ui centered grid">
                <div className="sixteen-wide-tablet ten-wide-computer center aligned column">
                    <h3 className="ui header">Write your Acro</h3>
                    <div>
                        {this.state.hasChosenAcro ? submittedAcro : <SubmitAcroForm chosenAcro={this.state.chosenAcro} submitAcro={this.submitAcro} />}
                    </div>
                </div>
            </div>
        )
    }
});

export const AcrofeverAcroPhase = React.createClass({
    propTypes: {
        round: React.PropTypes.object.isRequired,
        endTime: React.PropTypes.instanceOf(Date).isRequired,
        gameId: React.PropTypes.string.isRequired
    },
    currentAcro() {
        var acro = this.props.round.acronym;
        return acro.join('. ');
    },
    isInRound() {
        return (this.props.round.players[Meteor.userId()]);
    },
    render() {
        const dividerStyle = {marginBottom: '2em'};
        return (
            <div>
                <div>
                    <CountdownHeader endTime={this.props.endTime} header={this.currentAcro()} subheader={this.props.round.category} />
                </div>
                <div className="ui divider" style={dividerStyle}></div>
                <div>
                    {this.isInRound() ? <SubmitAcro round={this.props.round} gameId={this.props.gameId} /> : <h3 className="ui center aligned disabled header">Players are writing their acros...</h3>}
                </div>
                <div className="ui hidden divider"></div>
            </div>
        );
    }
});