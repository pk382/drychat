var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser');
var messages = []

app.use(express.static('.public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.get('/sample', function(request, response) {
  response.setHeader('Content-Type', 'application/json');
  response.send(JSON.stringify(messages));
});

app.post('/sample', function(request, response) {
  console.log('Got message ' + request.body.toString());
  messages.push(request.body);
  response.setHeader('Content-Type', 'application/json');
  response.send(messages);
});

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
