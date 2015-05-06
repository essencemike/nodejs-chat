var app = require("express")();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var path = require("path");
var express = require("express");

app.use(express.static(path.join(__dirname, '/')));

app.get('/', function(req, res) {
	//res.send('<h1>Welcome Realtime Server</h1>');
	res.sendfile('chat/index.html');
});

//完整的服务器的代码
//在线用户
var onlineUsers = {};
//当前在线人数
var onlineCount = 0;

io.on('connection', function(socket) {
	console.log('a user connected');

	//监听新用户加入
	socket.on('login', function(obj) {
		//将新加入用户的唯一标示当做socket的名称，后面退出的时候会用到，
		socket.name = obj.userid;

		//检查在线列表，如果不在里面就加入
		if(!onlineUsers.hasOwnProperty(obj.userid)){
			onlineUsers[obj.userid] = obj.username;
			//在线人数加1
			onlineCount++;
		}

		//向所有客户端广播用户加入
		io.emit('login', {onlineUsers: onlineUsers, onlineCount: onlineCount, user: obj});
		console.log(obj.username + '加入了聊天室！');
	});

	//监听用户退出
	socket.on('disconnect', function() {
		//将退出的用户从在线列表中删除
		if(onlineUsers.hasOwnProperty(socket.name)){
			//退出用户
			var obj = {userid: socket.name, username: onlineUsers[socket.name]};

			//删除
			delete onlineUsers[socket.name];
			//在线人数减1
			onlineCount--;

			//向所有客户端广播用户退出
			io.emit('logout', {onlineUsers: onlineUsers, onlineCount: onlineCount, user: obj});
			console.log(obj.username + '退出了聊天室！');
		}
	});

	//监听用户发布聊天内容
	socket.on('message', function(obj) {
		//向所有客户端广播发布的消息
		io.emit('message', obj);
		console.log(obj.username + '说：' + obj.content);
	});
});

http.listen(3000, function() {
	console.log(path.join(__dirname, '/') + ': listening on *:3000');
});






















