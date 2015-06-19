window.require = require;
var React = require('react');
//var marked = require('marked');
var $ = require('jquery');
window.jQuery = $;
var hljs = require('highlight.js');
var io = require('socket.io-client');
var socket = io.connect();
var SidePanel = require('./sidePanel.js');
var bootstrap = require('bootstrap-less/js/bootstrap.js');
var ReactZeroClipboard = require('react-zeroclipboard');
var md = require('markdown-it')({
  html: true
});
var emoji = require('markdown-it-emoji');
// enable emojis
md.use(emoji , []);

function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

var SPLIT_CHARS = "``";
var historyMsgs = [];
var prev = 0;

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

var Application = React.createClass({
	getInitialState: function() {
		return {username: ''};
	},
	handleSubmit: function(e) {
		e.preventDefault();
		var thisUser = React.findDOMNode(this.refs.username).value.trim();
		React.findDOMNode(this.refs.username).value = '';
    var newUser = {name: thisUser, color: getRandomColor()};
		socket.emit('new participant', newUser);
		var newUsers = this.state.users.concat([newUser]);
		this.setState({username: thisUser, users: newUsers});
	},
	loadInitialUsers: function() {
		$.ajax({
      url: 'users',
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({username: this.state.username, users: data})
      }.bind(this),
      error: function(xhr, status, err) {
        console.error('users', status, err.toString());
      }.bind(this)
    });
	},
	handleNewParticipant: function(user) {
		this.setState({username: this.state.username, users: this.state.users.concat([user])});
	},
	componentDidMount: function() {
		this.loadInitialUsers();
		socket.on('new participant', this.handleNewParticipant);
	},
	render: function () {
		if (this.state.username === '') {
			return (
				<div className = "Application">
          <div className = "init-container">
            <img src="images/splash.png"/>
  					<form className="usernameForm" onSubmit={this.handleSubmit}>
  						<input type="text" placeholder="What's your name?" className="usernameField" ref="username"/>
  						<button type="submit">Go</button>
					</form>
          </div>
				</div>
			);
		} else {
			return (
				<div className = "Application row">
	  			<SidePanel users={this.state.users}/>
					<ChatBox author={this.state.username} users={this.state.users} url="initial" pollInterval={2000}/>
				</div>
			);
		}
	}
});

var ChatBox = React.createClass({
  loadMessagesFromServer: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({data: data, pinnedMessages: this.state.pinnedMessages});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  handleMessageSend: function(message, overrideAuthor) {
    if (overrideAuthor) {
      message.author = this.props.author;
    }
    prev = 0;
    message.color = '#'+(Math.random()*0xFFFFFF<<0).toString(16);
    for (u in this.props.users) {
    	if (this.props.author === this.props.users[u].name) {
    		message.color = this.props.users[u].color;
    	}
    }
    var d = new Date();
    message.timestamp = d.toLocaleTimeString();
    var messages = this.state.data;
    var newMessages = messages.concat([message]);
    this.setState({data: newMessages, pinnedMessages: this.state.pinnedMessages});
    if (message.text !== historyMsgs[historyMsgs.length-1]) {
	    historyMsgs.push(message.text);
    }
    socket.emit('chat message', message);
  },
  handleMessageReceive: function(message) {
    var messages = this.state.data;
    var newMessages = messages.concat([message]);
    this.setState({data: newMessages, pinnedMessages: this.state.pinnedMessages});
  },
  handleMessagePinning: function(message) {
    var pinnedMessages = this.state.pinnedMessages;
    var newPinnedMessages = pinnedMessages.concat([message]);
    this.setState({data: this.state.data, pinnedMessages: newPinnedMessages});
  },
  handleMessageUnpinning: function(message) {
    var pinnedMessages = this.state.pinnedMessages;
    var newPinnedMessages = pinnedMessages.filter(function(element, index, array) {
      return element !== message;
    });
    this.setState({data: this.state.data, pinnedMessages: newPinnedMessages});
  },
  getInitialState: function() {
    return {pinnedMessages: [], data: []};
  },
  componentDidMount: function() {
    this.loadMessagesFromServer();
    socket.on('chat message', this.handleMessageReceive);
  },
  render: function() {
    return (
      <div className="ChatBox col-sm-9 col-xs-12">
        <PinnedList data={this.state.pinnedMessages} onMessageUnpin={this.handleMessageUnpinning}/>
        <ChatList data={this.state.data} onMessagePin={this.handleMessagePinning} onMessageSend={this.handleMessageSend}/>
        <ChatForm author={this.props.author} onMessageSend={this.handleMessageSend}/>
      </div>
    );
  }
});

var PinnedList = React.createClass({
  render: function() {
    var onMessageUnpin = this.props.onMessageUnpin;
    var messageNodes = this.props.data.map(function(message) {
      return (
        <Message pinned={true} msg={message} pin={true} onMessageUnpin={onMessageUnpin}>
          {message.text}
        </Message>
      );
    });
    return (
      <div className="pinnedList">
        {messageNodes}
      </div>
    );
  }
});

var ChatList = React.createClass({
  render: function() {
    var currentAuthor = "";
    var onMessagePin = this.props.onMessagePin;
    var onMessageSend = this.props.onMessageSend;

    var messageNodes = this.props.data.map(function(message) {
      var sameAuthor = currentAuthor == message.author;
      currentAuthor = message.author;
      return (
        <Message msg={message} sameAuthor={sameAuthor} onMessagePin={onMessagePin} onMessageSend={onMessageSend}>
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
    var author = this.props.author;
    var text = React.findDOMNode(this.refs.text).value.trim();
    if (!text || !author || text == "//") {
      return;
    }
    this.props.onMessageSend({author: author, text: text});
    //React.findDOMNode(this.refs.author).value = '';
    React.findDOMNode(this.refs.text).value = '';
    return;
  },
	componentDidMount: function() {
		$('textarea').keydown(function(e) {
			if (e.keyCode == 13 && !e.shiftKey) {
				$('.message-send').click();
				e.preventDefault();
			}
			var checked = checkFirstLastLine($(this));
			if (e.keyCode == 38 && checked.first) {
				if (prev < historyMsgs.length){
					prev++;
					$(this).val(historyMsgs[historyMsgs.length-prev]);
				}
				e.preventDefault();
			}
			if (e.keyCode == 40 && checked.last) {
				if (prev<=0){
					$(this).val('');
				} else {
					prev--;
					$(this).val(historyMsgs[historyMsgs.length-prev]);
				}
				e.preventDefault();
			}
		});

		function checkFirstLastLine(textele) {
			var first_line = true;
			var last_line = true;

			var text = textele.val();
		  var width = textele.width();
		  var cursorPosition = textele.prop("selectionStart");

		  var txtBeforeCaret = text.substring(0, cursorPosition);
		  txtAfterCaret = text.substring(cursorPosition);
		  var holder = $(document.createElement('div'));
		  holder.css({
		  	'display': 'none',
		  })
		  var widthBefore = holder.text(txtBeforeCaret).width();
		  var widthAfter = holder.text(txtAfterCaret).width();

		  var match1 = txtBeforeCaret.match(/\n/);

		  if(txtAfterCaret!==null){match2=txtAfterCaret.match(/\n/g);}
		  if(widthBefore>width || match1){
		  	first_line=false;
		  }
		  if(widthAfter>width || (match2!==null && match2.length)) {
		  	last_line=false;
		  }
		  return {first:first_line, last: last_line};
		};
	},
  handleBold: function() {
    $("#message-form").surroundSelectedText("**","**");
  },
  handleItalic: function() {
    $("#message-form").surroundSelectedText("*","*");
  },
  handleStrikethrough: function() {
    $("#message-form").surroundSelectedText("~~","~~");
  },
  handleLink: function() {
    $("#message-form").surroundSelectedText("[Link](",")");
  },
  handleImage: function() {
    $("#message-form").surroundSelectedText("![](",")");
  },
  handleHeader: function() {
    $("#message-form").surroundSelectedText("## ","");
  },
  handleQuote: function() {
    $("#message-form").surroundSelectedText("> ","");
  },
  handleListUl: function() {
    $("#message-form").surroundSelectedText("+ ","");
  },
  handleCode: function() {
    $("#message-form").surroundSelectedText("``","");
  },
  handleSmile: function() {
    $("#message-form").val($("#message-form").val()+" :smile:");
  },
  handleSmiley: function() {
    $("#message-form").val($("#message-form").val()+" :smiley:");
  },
  handleWink: function() {
    $("#message-form").val($("#message-form").val()+" :wink:");
  },
  handleGrin: function() {
    $("#message-form").val($("#message-form").val()+" :grin:");
  },
  handleUnamused: function() {
    $("#message-form").val($("#message-form").val()+" :unamused:");
  },
  handleJoy: function() {
    $("#message-form").val($("#message-form").val()+" :joy:");
  },
  handleSob: function() {
    $("#message-form").val($("#message-form").val()+" :sob:");
  },
  handleHeart: function() {
    $("#message-form").val($("#message-form").val()+" :heart:");
  },
  handleBrokenHeart: function() {
    $("#message-form").val($("#message-form").val()+" :broken_heart:");
  },
  handleThumbs: function() {
    $("#message-form").val($("#message-form").val()+" :thumbsup:");
  },
  handleInformationDesk: function() {
    $("#message-form").val($("#message-form").val()+" :information_desk_person:");
  },
  render: function() {
    return (
      <div>
        <div className="form-action-bar">
          <button onClick={this.handleBold} className="form-action">
            <i className="fa fa-bold"></i>
          </button>
          <button onClick={this.handleItalic} className="form-action">
            <i className="fa fa-italic"></i>
          </button>
          <button onClick={this.handleStrikethrough} className="form-action">
            <i className="fa fa-strikethrough"></i>
          </button>
          <button onClick={this.handleLink} className="form-action">
            <i className="fa fa-link"></i>
          </button>
          <button onClick={this.handleImage} className="form-action">
            <i className="fa fa-image"></i>
          </button>
          <button onClick={this.handleHeader} className="form-action">
            <i className="fa fa-header"></i>
          </button>
          <button onClick={this.handleQuote} className="form-action">
            <i className="fa fa-quote-left"></i>
          </button>
          <button onClick={this.handleListUl} className="form-action">
            <i className="fa fa-list-ul"></i>
          </button>
          <button onClick={this.handleCode} className="form-action">
            <i className="fa fa-code"></i>
          </button>
          <button onClick={this.handleSmile} className="form-action">
            😃
          </button>
          <button onClick={this.handleSmiley} className="form-action">
            😀
          </button>
          <button onClick={this.handleWink} className="form-action">
            😉
          </button>
          <button onClick={this.handleGrin} className="form-action">
            😁
          </button>
          <button onClick={this.handleUnamused} className="form-action">
            😒
          </button>
          <button onClick={this.handleJoy} className="form-action">
            😂
          </button>
          <button onClick={this.handleSob} className="form-action">
            😭
          </button>
          <button onClick={this.handleHeart} className="form-action">
            💘
          </button>
          <button onClick={this.handleBrokenHeart} className="form-action">
            💔
          </button>
          <button onClick={this.handleThumbs} className="form-action">
            👍
          </button>
          <button onClick={this.handleInformationDesk} className="form-action">
            💁
          </button>
        </div>
        <form className="chatForm row" onSubmit={this.handleSubmit}>
          <textarea id="message-form" placeholder="Say something..." className="message-field col-sm-10 col-xs-9" ref="text"/>
          <input type="submit" value="Send" className="message-send col-sm-2 col-xs-3" Send/>
        </form>
      </div>
    );
  }
});

var SearchResultsBox = React.createClass({
  render: function() {
    var footer;
    if (this.props.results.length > 0)
      footer = (<div className="search-attribution">Top 3 Stack Overflow results fetched via Google.</div>);
    else if (this.props.searched) footer = (<h4>No results found.</h4>);
    var searchResultNodes = this.props.results.slice(0, 3).map(function(result) {
      return (
        <div className="searchResult">
          <a href={result.link} target="_blank"><h4>{result.title}</h4></a>
          <p>{result.snippet}</p>
        </div>
      );
    });
    return (
      <div className="searchResultsBox">
        {searchResultNodes}
        {footer}
      </div>
    );
  }
});

var Message = React.createClass({
  handleEdit: function() {
    var code = $('#code-' + this.state.id);
    launchEdit(this.state.id);
    if (code.hasClass('edit-active')) {
      this.state.oldCode = code.text();
    } else if (this.state.oldCode !== code.text()) {
      this.props.onMessageSend({text: SPLIT_CHARS + code.text()}, true);
    }
    this.setState({results: this.state.results});
  },
  handlePin: function() {
    this.props.onMessagePin(this.props.msg);
  },
  handleUnpin: function() {
    this.props.onMessageUnpin(this.props.msg);
  },
  search: function() {
    var query = $('#code-' + this.state.id).text();
    var key = "AIzaSyCFjMnr00FvodBC0yW5D9KYeAHvcpUeq8Q";
    var cx = '005775816924496801869:07j0tqhxcyy';
    var searchURL = "https://www.googleapis.com/customsearch/v1?key="+key+"&cx="+cx+"&site=stackoverflow.com&q=";
    $.ajax({
      url: searchURL + query,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({id: this.state.id, results: data.items, searched: true});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error('search', status, err.toString());
      }.bind(this)
    });
    this.refs.searchButton.getDOMNode().setAttribute("class", "disabled-button");
  },
	getInitialState: function() {
		return {results: [], editing: false};
	},
	render: function() {
		this.state.id = guid();
    // handle same author
    var authorBody = (<div className="author-container col-xs-3"><div className="gravatar"></div><div className="author"><strong>{this.props.msg.author}</strong></div></div>);
    if (this.props.sameAuthor) {
      authorBody = (<div className="author-container col-xs-3"></div>);
    }

    // markup
    var rawMarkup = md.render(this.props.children.toString());

    // handle repeat messages
    var generatedClass = this.props.msg.myself ? "message-container row myself" : "message-container row";

    // handle pin
    var pinOptions = (<button className="pin-button" onClick={this.handlePin} title="Pin">
                        <i className="fa fa-thumb-tack"></i>
                      </button>);
    if (this.props.pin)
      pinOptions = (<button className="unpin-button" onClick={this.handleUnpin} title="Unpin">
                        <i className="fa fa-close"></i>
                      </button>);

    // handle code block
    var ss = this.props.msg.text;
    var chunks = ss.split(SPLIT_CHARS)
    ss = ss.substring(ss.indexOf(SPLIT_CHARS)+SPLIT_CHARS.length);
    var code;

    if (chunks.length > 1 && ss.length > 0) {
      var normalText = chunks[0];
      code = (<div>
                <span dangerouslySetInnerHTML={{__html: md.render(normalText)}} />
                <div className="codeblock">
                  <pre>
										<code id={"code-"+this.state.id} data-id={this.state.id}>{ss}</code>
									</pre>
                </div>
                <div className="action-buttons">
                  <ReactZeroClipboard text={ss}>
                    <button className="action-button" id={"copyBtn-"+this.state.id} title="Copy to Clipboard">
                      <i className="fa fa-copy"></i>
                    </button>
                  </ReactZeroClipboard>
                  <button className="action-button" onClick={this.search} ref="searchButton" title="Search">
                    <i className="fa fa-search"></i>
                  </button>
                  <button className="action-button" id={"edit-"+this.state.id} onClick={this.handleEdit} title="Edit">
                    <i className="fa fa-pencil"></i>
                  </button>
                </div>
                <SearchResultsBox results={this.state.results ? this.state.results : []} searched={this.state.searched}/>
              </div>);

    }
    var messageBody = !code ? (<span dangerouslySetInnerHTML={{__html: rawMarkup}} />) : (code);

    return (
      <div className={generatedClass} style={{'borderColor': this.props.msg.color}}>
        {authorBody}
        <div className="message col-xs-8">
          {messageBody}
          <div className="timestamp">{this.props.msg.timestamp}</div>
        </div>
        <div className="col-xs-1">
          {pinOptions}
        </div>
      </div>
    );
  },
  componentDidMount: function() {
    $('pre code').each(function(i, block) {
      hljs.highlightBlock(block);
    });
    var cc = $(".chatList");
    cc.stop().animate({
      scrollTop: cc[0].scrollHeight
    }, 500);
  }
});

React.render(
	<Application/>,
	document.getElementById('content')
);

function select_all(el) {
  if (typeof window.getSelection != "undefined" && typeof document.createRange != "undefined") {
      var range = document.createRange();
      range.selectNodeContents(el);
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
  } else if (typeof document.selection != "undefined" && typeof document.body.createTextRange != "undefined") {
      var textRange = document.body.createTextRange();
      textRange.moveToElementText(el);
      textRange.select();
  }
}

function launchEdit(id) {
  var block = $("#code-"+id);
  var btn = $("#edit-"+id);
  block.attr('contenteditable', 'true');
  block.hasClass("edit-active") ? block.removeClass("edit-active") : block.addClass("edit-active");
  block.focus();
  btn.hasClass("enabled") ? btn.removeClass("enabled") : btn.addClass("enabled");
}

document.addEventListener('keydown', function (event) {
  var esc = event.which == 27,
      block = event.target,
      input = block.nodeName != 'INPUT' && block.nodeName != 'TEXTAREA',
      data = {},
      $block = $("#"+event.target.id);

  if (input) {
    if (esc) {
      // restore state
      document.execCommand('undo');
      block.blur();
      $block.removeClass("edit-active");
      block.contentEditable = false;
      $("#edit-"+$block.attr('data-id')).removeClass("enabled");
    } else if (event.which == 9) {
      // handle tab
      event.preventDefault();
      if (event.shiftKey) {
        document.execCommand('styleWithCSS', true, null);
        document.execCommand('outdent', true, null);
      } else {
        document.execCommand('styleWithCSS', true, null);
        document.execCommand('indent', true, null);
      }
    }
  }
}, true);
