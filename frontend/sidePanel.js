var React = require('react');
var $ = require('jquery');

var sidePanel = React.createClass({
	render: function() {
		return (
			<div className = "sidePanel col-md-3">
				<h1>Participants</h1>
				<UsersList/>
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
		return (
				<div className = "usersList col-md-12">
				<User/>
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
					Lawrance Luk
				</strong></div>
				</div>
		);
	}
});

module.exports = sidePanel;