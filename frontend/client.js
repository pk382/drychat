var React = require('react');
var marked = require('marked');
var $ = require('jquery');
var io = require('socket.io-client');
var socket = io();
var SidePanel = require('./sidePanel.js');

var Application = React.createClass({
	render: function () {
		return (
			<div className = "Application">
			<SidePanel/>
			<ChatBox url="sample" pollInterval={2000}/>
			</div>
			);
	}
});

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
    message.color = '#'+(Math.random()*0xFFFFFF<<0).toString(16);
    var date = new Date();
    message.timestamp = date.getHours().toString() + ':' + date.getMinutes().toString();
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
        <Message msg={message}>
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
    var generatedClass=this.props.msg.myself ? "message-container myself" : "message-container";

    var chunks = this.props.msg.text.split("//");
    var code;
    if (chunks.length > 1) {
      var normalText = chunks[0];
      chunks.shift();
      code = (<div className="codeblock"><span dangerouslySetInnerHTML={{__html: marked(normalText, {sanitize: true})}} /><pre><code>{chunks.join("")}</code></pre></div>);
    }
    var messageBody = !code ? (<span dangerouslySetInnerHTML={{__html: rawMarkup}} />) : (code);
    return (
      <div className={generatedClass}>
        <div className="author-container" style={{'borderColor': this.props.msg.color}}>
          <div className="gravatar"></div>
          <div className="author"><strong>{this.props.msg.author}</strong></div>
        </div>
        <div className="message">
          {messageBody}
          <div className="timestamp">{this.props.msg.timestamp}</div>
        </div>
      </div>
    );
  }
});

React.render(
  <Application />,
  document.getElementById('content')
);
