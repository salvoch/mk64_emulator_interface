/*When a ghost is loaded, change that ghost to a different char*/
//look into runjs

//Bind var to character_id
console.log("Watching for val");
//mem.bindvar(global, 0x80162F23, 'character_id', u8);

//When character_id is read
events.onread(0x80162F20, function(e) {
    console.log("onread Triggered!");
    pj64.pause();
    query_server('/data', write_ghost_char);
    //Code that runs after this won't be sequentail
});

function write_ghost_char(kind, response){
    if (kind == 'data') {
        console.log("from data");
    } else if (kind == 'end') {
        console.log("from end");
    } else {
        console.log("? kind");
    }
    console.log(response);
    pj64.resume();
}

//Query server:
function query_server(resource, fn){
    var client = new Socket();
    

    client.connect(8064, 'localhost', function() {
        var response = '';

        client.on('data', function(data) {
            response += data;
            //fn('data', response);
        });
        
        client.on('end', function() {
            //console.log("Log from inside client");
            fn('end', response);
        });

        //header


        //client.end(message);
        //client.write(message);
        //client.end();
    });

    const message = [
        "GET / HTTP/1.1",
        "Host: localhost",
        //"Connection: close",
        "\r\n"
    ].join("\r\n");

    const message2 = [
        "GET / HTTP/1.1",
        "Host: localhost",
        "Connection: close",
        "\r\n"
    ].join("\r\n");

    client.write(message);
    client.end(message2);
    
}