//UDP

var PORT = 4445 ;
var dgram = require('dgram');
var client = dgram.createSocket('udp4');
let start = 0;

client.on('listening', function () {
    var address = client.address();
    console.log('UDP Client listening on ' + address.address + ":" + address.port);
    client.setBroadcast(true);
    client.setMulticastTTL(10);
    // client.addMembership('255.255.255.255');
});

client.on('message', function (message, remote) {
    let now = Date.now();
    let delay = now - start;
    start = now;
    console.log('delay', delay, 'message', message.length, 'from', remote.address + ":" + remote.port);
});

client.bind(PORT);