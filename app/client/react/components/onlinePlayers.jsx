class PlayerLabel extends React.Component {
    openProfilePopup(evt) {
        evt.preventDefault();
        Session.set('selectedProfileUserId', this.props.id);
        $('#profileModal').modal('show');
    }

    render() {
        return (
            <a className="ui image label userProfilePicture" onClick={(evt) => this.openProfilePopup(evt)}>
                <img src={profilePicture(this.props.id, 50)} />
                {displayname(this.props.id)}
            </a>
        )
    }
}

PlayerLabel.propTypes = {
    id: React.PropTypes.string.isRequired
};

OnlinePlayers = React.createClass({
   mixins: [ReactMeteorData],
   getMeteorData() {
       var handle = Meteor.subscribe('allOnlinePlayers');

       var data = {
           ready: handle.ready(),
           onlinePlayers: Meteor.users.find({'status.online':true}).fetch()
       };

       data.playerCount = data.onlinePlayers.length;

       return data;
   },
   render() {
       if (this.data.ready) {
           return (
               <div>
                   <h3 className="ui header">{this.data.playerCount + ((this.data.playerCount === 1) ? ' player ' : ' players ') + ' online'}</h3>
                   {this.data.onlinePlayers.map((player, index) => <PlayerLabel key={index} id={player._id} />)}
               </div>
           )
       } else {
           return <div className="ui active inline centered loader"></div>
       }
   }
});

Template.registerHelper('OnlinePlayers', () => OnlinePlayers);