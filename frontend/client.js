var React = require('react');
var marked = require('marked');
//var highlight = require('highlight.js');

//highlight.initHighlightingOnLoad();

var data = [
  {author: 'Pete Hunt', text: 'This is one comment', color: "#F75482", timestamp: "12:22"},
  {author: 'Lawrence Luk', text: 'lol what why', myself: true, color: "#9D93F7", timestamp: "12:22"},
  {author: 'Jordan Walke', text: 'This is *another* comment.', color: "#F7EC76", timestamp: "12:22"},
  {author: 'Jordan Walke', text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dolor augue, accumsan molestie posuere eu, hendrerit ac nibh. Nunc at nisi augue. Donec ut velit vitae mauris ornare consectetur at vitae neque. Phasellus sagittis tortor lacus, pellentesque vulputate mauris aliquet non. Vestibulum eu massa id nisi malesuada aliquam vitae a tellus. Nulla pellentesque eros sit amet enim finibus, vehicula vulputate odio cursus. Interdum et malesuada fames ac ante ipsum primis in faucibus. Curabitur vulputate nibh at diam eleifend tristique. Praesent tristique dui ut massa venenatis pulvinar. Vivamus ac magna sit amet urna pretium consectetur et quis augue. Proin eget maximus nisi.Nunc eu erat consequat, cursus urna a, aliquam lorem. Maecenas vel faucibus nisi. Sed fringilla tortor et pulvinar cursus. In nec gravida sem. Suspendisse eget neque convallis, ullamcorper velit sit amet, consectetur nisi. Aenean purus libero, egestas id sagittis vel, interdum sed est. Sed tempus sagittis massa vel sodales. Ut placerat purus arcu, euismod sagittis neque interdum molestie.', color: "#F7EC76", timestamp: "12:23"},
  {author: 'Lawrence Luk', text: "Some words//int x = 15; String cool = 'cool';", myself: true, color: "#9D93F7", timestamp: "12:24"}
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
        <Message msg={message}>
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
  <ChatBox data={data}/>,
  document.getElementById('content')
);
