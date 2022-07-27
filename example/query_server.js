/*
Host a server in C#,
This code will query that server, and print the return text
*/
var client = new Socket();

client.connect(8064, 'localhost', function() {
    var response = '';

    client.on('data', function(data) {
        response += data.toString();
    });

    client.on('end', function() {
        console.log(response);
    });

    const message = [
        "GET / HTTP/1.1",
        "Host: localhost",
        "Connection: close",
        "\r\n"
    ].join("\r\n");

    client.end(message);
});