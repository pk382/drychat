var React = require('react');

var ChatBox = React.createClass({
  render: function() {
    return (
      <div className="ChatBox">
        <h1>Chats</h1>
        <ChatList/>
        <ChatForm/>
      </div>
    );
  }
});

var ChatList = React.createClass({
  render: function() {
    return (
      <div className="chatList">
        <Message author="Pete Hunt">This is one comment</Message>
        <Message author="Jordan Walke">This is *another* message</Message>
      </div>
    );
  }
});

var ChatForm = React.createClass({
  render: function() {
    return (
      <div className="chatForm">
        Hello, world! I am a ChatForm.
      </div>
    );
  }
});

var Message = React.createClass({
  render: function() {
    return (
      <div className="message">
        <h2 className="messageAuthor">
          {this.props.author}
        </h2>
        {this.props.children}
      </div>
    );
  }
});

React.render(
  <ChatBox/>,
  document.getElementById('content')
);
