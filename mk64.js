/*MK64 is the script which interfaces with the Mario Kart 64 (EU) ROM using the latest
PJ64 emulator. It also interfaces with the "MK64 Watcher.exe" time and ghost manager*/
console.log("Running MK64 script...");
var writeFlag = false;

//-----Events-----
//Event to trigger when game checks if stage has saved ghost, trick game into thinking it does!
events.onexec(0x80091F60, function(e) {
    debug.breakhere(true);

    //Query server

    //TODO -- query server here? If ghost exists then continue with the t2 manipulation, and the rest of the functions
    //Thoughts -- should we register the other read-callbacks here? And de-register them at the end? That way we only proceed
    //            if we are actually loading a ghost!?
    console.log("Character compare command triggered!");

    //logic here --- queries server
    //if server says yes:
        // trick game into thinking laoding
        // register callback executes here?? OR Set a global flag to load

    console.log("GPR T2: ")
    console.log(cpu.gpr.t2);
    console.log("GPR S2: ")
    console.log(cpu.gpr.s2);

    console.log("Set to each other")
    cpu.gpr.t2 = cpu.gpr.s2

    console.log("GPR T2: ")
    console.log(cpu.gpr.t2);
    console.log("GPR S2: ")
    console.log(cpu.gpr.s2);

    debug.resume();

});

//Event when ghost charg ID is read for rendering. Chars IDs are 0-8
events.onread(0x80162F20, function(e) {
    debug.breakhere(true);
    console.log("Character read triggered!");
    var json_payload = {"Function": "ghost_character_load", "TrackID": 0};
    query_server(json_payload, write_ghost_char);
});


//Event when MIO0 drive data is read to be decompressed

//Event when ghost is attempted to be saved

//-----Callbaks-----
//Function to write ghost, then resume emulator
function write_ghost_char(data){
    //parse data response here
    mem.setblock(0x80162F20, data);
    debug.resume();
}

//-----Functions-----

//query the C# server, arg JSON payload, and callback function
//Calls fn with response
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

//Function to read MIO0 file