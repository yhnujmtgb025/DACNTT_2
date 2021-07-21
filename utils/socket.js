const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
var Socket = {
    emit: function (event, data) {
        // console.log(event, data);
        io.sockets.emit(event, data);
    }
};
var chat= []
io.on("connection", function (socket) {
    socket.on('message', (data) => {
        chat[data.username]=socket.id
    });
});

exports.Socket = Socket;
exports.chat = chat;
exports.io = io;


