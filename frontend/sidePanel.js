var React = require('react');
var $ = require('jquery');

var sidePanel = React.createClass({
	render: function() {
		return (
			<div className = "sidePanel col-md-3">
				<h1>Rooms</h1>
				<RoomsList/>
			</div>
		);
	}
});

var NavSection = React.createClass({
	render: function() {
		return (
			<div className = "navSection">
			</div>
			)
	}
});

var RoomsList = React.createClass({
	render: function() {
		return (
				<div className = "roomsList">
				<Room/>
				</div>
		);
	}
});

var Room = React.createClass({
	render: function() {
		return (
			<div className = "roomContainer" style={{'borderColor':'#660000'}}>
				<div className = "roomTitle">
					Room 1
				</div>
					<div className = "personIcon">	
					</div>
					<div className = "participantNum">3</div>
			</div>
			);
	}
});

module.exports = sidePanel;