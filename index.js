var app = require('express')();
var express = require('express');
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static('debug/public'));

app.get('/', function(req, res){
    res.status(200).type('html').render('index');
});

var clients = {};
var users = {};

io.on('connection', function(socket){
    var hs = socket.handshake;
    users[socket.id] = hs.query.username;
    clients[socket.id] = socket;
    io.emit('logedin', hs.query.username);
    var usersValue = Object.keys(users).map( function(key){
        return users[key];
    });
    io.emit('userlist',usersValue);
    socket.on('chat message', function(msg){
        if (msg.msgText.length<=1000) {
            io.emit('chat message', msg);
        } else {
            return false;
        }
    });

    socket.on('rename', function(user) {
        var usersValue = Object.keys(users).map(function(key){
            return users[key];
        });
        if (usersValue.indexOf(user.newUser) === -1) {
            if (user.newUser.length<=30) {
                users[socket.id] = user.newUser;
                clients[socket.id] = socket;
                io.emit('renamed', user);
            } else {
                return false;
            }
        } else if (usersValue.indexOf(user.newUser) > -1) {
            io.to(socket.id).emit('alreadyTaken', user.oldUser);
        }
        var usersValueRefresh = Object.keys(users).map(function(key){
            return users[key];
        });
        io.emit('userlist',usersValueRefresh);
    });

    socket.on('disconnect', function() {
        io.emit('logedout', users[socket.id]);
        delete clients[socket.id];
        delete users[socket.id];
        var usersValue = Object.keys(users).map( function(key){
            return users[key];
        });
        io.emit('userlist',usersValue);
   });
});

http.listen(3000, function(){
    console.log('listening on *:3000');
});
