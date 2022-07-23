/*
Quick test, inject a different char ID
when a ghost is loaded
*/
//TODO -- WRITE TIMEOUT! If no response from server, resume

console.log("Watching for val");

//When char is read, pause, and inject
//Have to do callback funciton since async
events.onread(0x80162F20, function(e) {
    debug.breakhere(true);
    console.log("onread Triggered!");
    //pj64.pause();
    console.log("Program counter at: ");
    console.log(cpu.pc);
    query_server('/data', write_ghost_char);
    //Code that runs after this won't be sequentail
});

//Function to write ghost, then resume emulator
function write_ghost_char(address, data){
   
    mem.setblock(address, data);
    console.log("Program counter2 at: ");
    console.log(cpu.pc);
    debug.resume();
}

//Query the server for data
function query_server(resource, fn){
    var client = new Socket();  
    client.connect(8064, 'localhost', function() {
        var response;
    
        client.on('data', function(data) {
            //TODO - If size is too large, do we need to modify this?
            response = data;
        });
    
        client.on('end', function() {
            console.log(response.length);
            fn(0x80162F20, response);
        });
    
        const message = [
            "yoyoyo<EOF>"
        ].join("\r\n");
    
        client.end(message);
    });
}