var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser');
var messages = [];
var users = [];

app.use(express.static('.public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.get('/initial', function(request, response) {
  response.setHeader('Content-Type', 'application/json');
  response.send(JSON.stringify(messages));
});

app.get('/users', function(request, response) {
  response.setHeader('Content-Type', 'application/json');
  response.send(JSON.stringify(users));
});

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('chat message', function(message) {
    console.log('Got a message!');
    messages.push(message);
    socket.broadcast.emit('chat message', message);
  });

  socket.on('new participant', function(user) {
    console.log('Got a new user!');
    users.push(user);
    socket.broadcast.emit('new participant', user);
  });

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
