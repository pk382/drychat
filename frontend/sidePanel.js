var React = require('react');
var $ = require('jquery');

var sidePanel = React.createClass({
	render: function() {
		return (
			<div className = "sidePanel col-md-3">
				<h1>Participants</h1>
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
			return <User>{user}</User>
		})
		return (
				<div className = "usersList col-md-12">
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
