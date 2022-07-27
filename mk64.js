/*MK64 is the script which interfaces with the Mario Kart 64 (EU) ROM using the latest
PJ64 emulator. It also interfaces with the "MK64 Watcher.exe" time and ghost manager*/
console.log("Running MK64 script...");

//-----Events-----
//When ghost cha ID is read for rendering. Chars IDs are 0-8
events.onread(0x80162F20, function(e) {
    debug.breakhere(true);
    console.log("Char read triggered!");
    var json_payload = {"Function": "ghost_character_load", "TrackID": 0};
    query_server(json_payload, write_ghost_char);
});

//-----Callbaks-----
//Function to write ghost, then resume emulator
function write_ghost_char(data){
    //parse data response here
    mem.setblock(0x80162F20, data);
    debug.resume();
}

//-----Functions-----

//query the C# server, arg JSON payload, and callback function
function query_server(payload, fn){
    var client = new Socket();  
    client.connect(8064, 'localhost', function() {
        var response;
    
        client.on('data', function(data) {
            response = data;
        });
    
        client.on('end', function() {
            fn(response);
        });
    
        const message = [
            JSON.stringify(payload)+"<EOF>"
        ].join("\r\n");
    
        client.end(message);
    });
}

