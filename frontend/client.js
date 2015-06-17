var React = require('react');
var marked = require('marked');
var $ = require('jquery');
var hljs = require('highlight.js')
var io = require('socket.io-client');
var socket = io.connect();
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
    socket.emit('chat message', message);
  },
  handleMessageReceive: function(message) {
    var messages = this.state.data;
    var newMessages = messages.concat([message]);
    this.setState({data: newMessages});
  },
  getInitialState: function() {
    return {data: []};
  },
  componentDidMount: function() {
    this.loadMessagesFromServer();
    socket.on('chat message', this.handleMessageReceive);
  },
  render: function() {
    return (
      <div className="ChatBox">
        <ChatList data={this.state.data}/>
        <ChatForm onMessageSend={this.handleMessageSend}/>
      </div>
    );
  }
});

var ChatList = React.createClass({
  render: function() {
    var currentAuthor = "";
    var messageNodes = this.props.data.map(function(message) {
      var sameAuthor = currentAuthor == message.author;
      currentAuthor = message.author;
      return (
        <Message msg={message} sameAuthor={sameAuthor}>
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
    var author = "Lebron Jamez";
    var text = React.findDOMNode(this.refs.text).value.trim();
    if (!text || !author) {
      return;
    }
    this.props.onMessageSend({author: author, text: text});
    var cc = $(".chatList");
    cc.stop().animate({
      scrollTop: cc[0].scrollHeight
    }, 500);
    //React.findDOMNode(this.refs.author).value = '';
    React.findDOMNode(this.refs.text).value = '';
    return;
  },
  render: function() {
    return (
      <form className="chatForm" onSubmit={this.handleSubmit}>
        <textarea placeholder="Say something..." className="message-field" ref="text"/>
        <input type="submit" value="Send" className="message-send" Send/>
      </form>
    );
  }
});

var Message = React.createClass({
  render: function() {
    var authorBody = (<div className="author-container"><div className="gravatar"></div><div className="author"><strong>{this.props.msg.author}</strong></div></div>);
    if (this.props.sameAuthor) {
      authorBody = (<div className="author-container"></div>);
    }
    var rawMarkup = marked(this.props.children.toString(), {sanitize: true});
    var generatedClass = this.props.msg.myself ? "message-container myself" : "message-container";

    var chunks = this.props.msg.text.split("//");
    var code;
    if (chunks.length > 1) {
      var normalText = chunks[0];
      chunks.shift();
      code = (<div><span dangerouslySetInnerHTML={{__html: marked(normalText, {sanitize: true})}} /><div className="codeblock"><pre><code>{chunks.join("")}</code></pre></div></div>);
    }
    var messageBody = !code ? (<span dangerouslySetInnerHTML={{__html: rawMarkup}} />) : (code);
    return (
      <div className={generatedClass} style={{'borderColor': this.props.msg.color}}>
        {authorBody}
        <div className="message">
          {messageBody}
          <div className="timestamp">{this.props.msg.timestamp}</div>
        </div>
      </div>
    );
  },
  componentDidMount: function() {
    $('pre code').each(function(i, block) {
      hljs.highlightBlock(block);
    });
  }
});

React.render(
  <Application />,
  document.getElementById('content')
);

$("textarea").keydown(function(e){
  // Enter was pressed without shift key
  if (e.keyCode == 13 && !e.shiftKey)
  {
      // fire the submit event
      $(".message-send").click();
      // prevent default behavior
      e.preventDefault();
  }
});
