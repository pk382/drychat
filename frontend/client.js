var React = require('react');
var marked = require('marked');
var $ = require('jquery');
var io = require('socket.io-client');
var socket = io();

var ChatBox = React.createClass({
  loadMessagesFromServer: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  handleMessageSend: function(message) {
    console.log('we here');
    var messages = this.state.data;
    var newMessages = messages.concat([message]);
    this.setState({data: newMessages});
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      type: 'POST',
      data: message,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, data, error) {
        console.error(this.props.url, status, error.toString());
      }.bind(this)
    });
  },
  getInitialState: function() {
    return {data: []};
  },
  componentDidMount: function() {
    this.loadMessagesFromServer();
    setInterval(this.loadMessagesFromServer, this.props.pollInterval);
  },
  render: function() {
    return (
      <div className="ChatBox">
        <h1>Chats</h1>
        <ChatList data={this.state.data}/>
        <ChatForm onMessageSend={this.handleMessageSend}/>
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
      );
    })
    return (
      <div className="chatList">
        {messageNodes}
      </div>
    );
  }
});

var ChatForm = React.createClass({
  handleSubmit: function(e) {
    e.preventDefault();
    var author = React.findDOMNode(this.refs.author).value.trim();
    var text = React.findDOMNode(this.refs.text).value.trim();
    if (!text || !author) {
      return;
    }
    this.props.onMessageSend({author: author, text: text});
    React.findDOMNode(this.refs.author).value = '';
    React.findDOMNode(this.refs.text).value = '';
    return;
  },
  render: function() {
    return (
      <form className="chatForm" onSubmit={this.handleSubmit}>
        <input type="text" placeholder="Your name" ref="author"/>
        <input type="text" placeholder="Say something..." ref="text"/>
        <input type="submit" value="Send" />
      </form>
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
  <ChatBox url="sample" pollInterval={2000}/>,
  document.getElementById('content')
);
