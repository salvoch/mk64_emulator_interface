/*
Host a server in C#,
This code will query that server, and print the return text
*/
var client = new Socket();

client.connect(8064, 'localhost', function() {
    var response;

    client.on('data', function(data) {
        //response += data.toString();
        //response += data;
        response = data;
    });

    client.on('end', function() {
        //console.log(typeof(response));
        //console.log(response);
        console.log(response.length);
        mem.setblock(0x80162F20, response);

        /*
        //Convert string to "object"
        var myBuffer = [];
        var buffer = new Buffer(response, 'utf16le');
        for (var i = 0; i < buffer.length; i++) {
            myBuffer.push(buffer[i]);
        }
        console.log(typeof(myBuffer));
        console.log(myBuffer);
        */
    });

    const message = [
        "yoyoyo<EOF>"
    ].join("\r\n");

    client.end(message);
});