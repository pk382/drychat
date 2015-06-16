var React = require('react');

var ChatBox = React.createClass({
  render: function() {
    return (
      <div className="ChatBox">
        Hello, world! I am a ChatBox.
      </div>
    );
  }
});
React.render(
  <ChatBox/>,
  document.getElementById('content')
);
