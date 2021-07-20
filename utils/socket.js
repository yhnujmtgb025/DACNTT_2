const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

var socket = {
    emit: function (event, data) {
        console.log(event, data);
        io.sockets.emit(event, data);
    }
};

io.on('connection',client=>{
    // console.log(`Client ${client.id} Da ket noi`)

    client.on('disconnect',()=>{
    
        // console.log(`\t\t ${client.id} da thoat`)

        // thong bao cho tat ca cac user con lai khi minh thoat
        // client.broadcast.emit('user-leave',client.id)

    })

    client.on('id-socket',(ids)=>{
        // console.log("id : "+ids.id)
        client.broadcast.emit('id_socket',{id:ids.id})
    })
})


exports.socket = socket;
exports.io = io;