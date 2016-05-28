
var appPort = 3000;

var express = require('express'), app = express();
var http = require('http')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server);
var jade = require('jade');

var pseudoArray = ['admin'];

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.set("view options", { layout: false });

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
  res.render('home.jade');
});

server.listen(appPort);

console.log(appPort + " portu dinleniyor");



var users = 0; 

io.sockets.on('connection', function (socket) {
	users += 1;
	reloadUsers();
	socket.on('message', function (data) { 
		if(pseudoSet(socket))
		{
			var transmit = {date : new Date().toISOString(), pseudo : socket.nickname, message : data};
			socket.broadcast.emit('message', transmit);
			console.log(transmit['pseudo'] +" "+data+" yazdı");
		}
	});
	socket.on('setPseudo', function (data) { 
		if (pseudoArray.indexOf(data) == -1)
		{
			pseudoArray.push(data);
			socket.nickname = data;
			socket.emit('pseudoStatus', 'ok');
			console.log(data + " Bağlandı");
		}
		else
		{
			socket.emit('pseudoStatus', 'error') 
		}
	});
	socket.on('disconnect', function () { 
		users -= 1;
		reloadUsers();
		if (pseudoSet(socket))
		{
			console.log("bağlantı kapandı");
			var pseudo;
			pseudo = socket.nickname;
			var index = pseudoArray.indexOf(pseudo);
			pseudo.slice(index - 1, 1);
		}
	});
});

function reloadUsers() { 
	io.sockets.emit('nbUsers', {"nb": users});
}
function pseudoSet(socket) {
	var test;
	if (socket.nickname == null ) test = false;
	else test = true;
	return test;
}