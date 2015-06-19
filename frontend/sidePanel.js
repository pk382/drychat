var React = require('react');
var $ = require('jquery');

var sidePanel = React.createClass({
	render: function() {
		return (
			<div className = "sidePanel col-sm-3 col-xs-12">
				<h3>Participants</h3>
				<UsersList users={this.props.users}/>
			</div>
		);
	}
});

var NavSection = React.createClass({
	render: function() {
		return (
			<div className = "navSection">
			</div>
		);
	}
});

var UsersList = React.createClass({
	render: function() {
		console.log(this.props.users);
		var userNodes = this.props.users.map(function(user) {
			return <User>{user.name}</User>
		})
		return (
				<div className = "usersList">
					{userNodes}
				</div>
		);
	}
});

var User = React.createClass({
	render: function() {
		return (
			<div className = "userContainer" style={{'borderColor':'#660000'}}>
				<div className = "gravatar"></div>
				<div className = "userName"><strong>
					{this.props.children}
				</strong></div>
				</div>
		);
	}
});

module.exports = sidePanel;
