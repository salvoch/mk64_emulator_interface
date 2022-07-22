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

function write_ghost_char(response){
    const char_id = response.split('close')[1].trim();
    console.log("Log from write_ghost_char: ");
    console.log(char_id);
    console.log(typeof(response));
    mem.setblock(0x80162F20, "Hello");
    pj64.resume();
}

//Query server:
function query_server(resource, fn){
    var client = new Socket();

    client.connect(8064, 'localhost', function() {
        var response = '';

        client.on('data', function(data) {
            response += data;

        });
        
        client.on('end', function() {
            console.log("Log from inside client");
            fn(response);
        });

        //header
        const message = [
            "GET / HTTP/1.1",
            "Host: localhost",
            "Connection: close",
            "\r\n"
        ].join("\r\n");

        //client.end(message);
        client.write(message);
        //client.end();
    });
    
}