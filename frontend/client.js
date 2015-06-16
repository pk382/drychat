var React = require('react');
var marked = require('marked');
var data = [
  {author: 'Pete Hunt', text: 'This is one comment'},
  {author: 'Jordan Walke', text: 'This is *another* comment'}
];

var ChatBox = React.createClass({
  render: function() {
    return (
      <div className="ChatBox">
        <h1>Chats</h1>
        <ChatList data={this.props.data}/>
        <ChatForm/>
      </div>
    );
  }
});

var ChatList = React.createClass({
  render: function() {
    var messageNodes = this.props.data.map(function(message) {
      return (
        <Message author={message.author}>
          {message.text}
        </Message>
      )
    })
    return (
      <div className="chatList">
        {messageNodes}
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
    var rawMarkup = marked(this.props.children.toString(), {sanitize: true});
    return (
      <div className="message">
        <h2 className="messageAuthor">
          {this.props.author}
        </h2>
        <span dangerouslySetInnerHTML={{__html: rawMarkup}} />
      </div>
    );
  }
});

React.render(
  <ChatBox data={data}/>,
  document.getElementById('content')
);
