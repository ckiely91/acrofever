const HowToPlayModal = React.createClass({
    componentDidMount() {
        $(this.refs.modal).modal({
            detachable: false,
            observeChanges: true
        });
    },
    render() {
        return (
            <div ref="modal" className="ui modal" id="howToPlayModal">
                <div className="content">
                    <h2 className="ui header">
                        <i className="question icon"></i>
                        <div className="content">
                            How to play Acrofever
                            <div className="sub header">The Acronym word game for witty humans</div>
                        </div>
                    </h2>
                    <h3 className="ui header">Write your Acro</h3>
                    <p>A round begins with a category being chosen, and a random acronym is generated, usually between
                        3 and 7 letters in length. For example...</p>
                    <p><em>How'd Santa fit in the chimney?<br />
                        O. T. F.</em></p>
                    <p>Players must then submit a phrase using those letters to start each word, making sure it also
                        fits the category! For example, for the above category and acronym, you could submit:</p>
                    <p><em>Ousted The Fat</em></p>
                    <p>Note: Creative use of punctuation and words like 'and', 'of', 'the' etc are allowed outside the
                        required letters. Just don't go too crazy.</p>
                    <h3 className="ui header">Vote on the best</h3>
                    <p>After everyone has submitted their acros (or the time runs out), the acros are shown anonymously
                        in a random order. Players now vote for their favourite.</p>
                    <p>It's in the spirit of the game to vote for the one you truly think was the best, funniest, or
                        most creative acro. To keep the game challenging and fair, you're encouraged only to vote for
                        acros that adhere to the letters of the acronym and the category, within reason.</p>
                    <h3 className="ui header">Scoring</h3>
                    <p>Votes are tallied when everyone has voted for their favourite acro. The player who submitted the
                        winning acro receives points. Everyone who voted for the winning acro also receives points.</p>
                    <p>In the event of a tie, the player who submitted their acro fastest wins.</p>
                    <h3 className="ui header">End of game</h3>
                    <p>Play continues in rounds until a player reaches the winning score. This is 25 points by default,
                        but can vary depending on the game.</p>
                    <p>The player with the highest score is the winner!</p>
                    <p>Players then have an opportunity to view all round-winning acros from the game and vote for the
                        Acros that should be included on the illustrious Hall of Fame. If it gets enough votes and is
                        deemed worthy by me, the site overlord, it may appear there in short time.</p>
                </div>
            </div>
        );
    }
});

Template.registerHelper('HowToPlayModal', () => HowToPlayModal);