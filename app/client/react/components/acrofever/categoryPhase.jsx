const ChooseCategory = React.createClass({
    propTypes: {
        gameId: React.PropTypes.string.isRequired
    },
    getInitialState() {
        let hasPickedCategory = false;
        const randomCategories = getRandomCategories();
        return {hasPickedCategory, randomCategories};
    },
    componentDidMount() {
        const form = $(this.form);
        console.log(form);
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
                this.pickCustomCategory(evt, fields);
            }
        });
    },
    pickCategory(evt) {
        evt.preventDefault();
        const category = $(evt.currentTarget).html();
        this.setState({hasPickedCategory: true});
        playSound('select');
        Meteor.call('acrofeverChooseCategory', this.props.gameId, category, (err) => {
            if (err) {
                console.error(err);
                this.setState({hasPickedCategory: false});
            }
            analytics.track("chooseCategory", {
                category: category,
                custom: false
            });
        });
    },
    pickCustomCategory(evt, fields) {
        evt.preventDefault();
        const customCategory = fields.customCategory;

        this.setState({hasPickedCategory: true});
        playSound('select');
        Meteor.call('acrofeverChooseCategory', this.props.gameId, customCategory, (err) => {
            if (err) {
                console.error(err);
                this.setState({hasPickedCategory: false});
            }
            analytics.track("chooseCategory", {
                category: customCategory,
                custom: true
            });
        });
    },
    render() {
        if (this.state.hasPickedCategory) {
            return <div className="ui active centered inline loader"></div>;
        } else {
            var gridStyle = {position: 'relative'};
            return (
                <div>
                    <h3 className="ui center aligned header">You're picking the category!</h3>
                    <div className="ui basic segment">
                        <div className="ui stackable two column very relaxed grid" style={gridStyle}>
                            <div className="column">
                                <div className="ui relaxed celled list">
                                    {this.state.randomCategories.map((cat, index) => <a key={index} href="#" className="item categoryListItem" onClick={this.pickCategory}>{cat}</a>)}
                                </div>
                            </div>
                            <div className="ui vertical divider">
                                OR
                            </div>
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

AcrofeverCategoryPhase = React.createClass({
    mixins: [ReactMeteorData],
    propTypes: {
        round: React.PropTypes.object.isRequired,
        endTime: React.PropTypes.instanceOf(Date).isRequired,
        gameId: React.PropTypes.string.isRequired
    },
    getMeteorData() {
        return {
            categoryChooserDisplayName: displayname(this.props.round.categoryChooser)
        };
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
                    <CountdownHeader endTime={this.props.endTime} header={this.currentAcro()} />
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

Template.registerHelper('AcrofeverCategoryPhase', () => AcrofeverCategoryPhase);