//UDP


var dgram = require('dgram');
var socket = dgram.createSocket("udp4");
socket.bind( function() {
    socket.setBroadcast(true);
    socket.setMulticastTTL(10);
    socket.setMulticastLoopback(true);
    setInterval(function () {
        var message = Buffer.alloc(500);
        socket.send(message, 4445, "255.255.255.255");
        console.log("Sent " + message + " to the wire...");
    }, 100);
});
