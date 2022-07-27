/*MK64 is the script which interfaces with the Mario Kart 64 (EU) ROM using the latest
PJ64 emulator. It also interfaces with the "MK64 Watcher.exe" time and ghost manager*/
console.log("Running MK64 script...");
var writeFlag = false; //TODO - Don't forget to set this back to false at some point! (After MIO0 load?)

//-----Events-----
//Event to trigger when game checks if stage has saved ghost, trick game into thinking it does!
events.onexec(0x80091F60, function(e) {
    debug.breakhere(true);
    console.log("Character compare command triggered!");
    var json_payload = {"Function": "check_for_ghost", "TrackID": 0};
    query_server(json_payload, set_write_flag);
});

//Event when ghost char ID is read for rendering. Chars IDs are 0-8
events.onread(0x80162F20, function(e) {
    debug.breakhere(true);
    if (writeFlag) {
        console.log("Character read triggered!");
        var json_payload = {"Function": "ghost_character_load", "TrackID": 0};
        query_server(json_payload, write_ghost_char);
    } else {
        debug.resume();
    }
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

//Function that determines if we are to inject ghost data or not!
function set_write_flag(data){
    //parse data response here
    //IF response === true or something, then:
    writeFlag = true;

    //Call the function that tricks the game here??
    course_match();

    //Resume game
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

//Function that tricks game into thinking the header course save file matches the selected course
function course_match(){
    cpu.gpr.t2 = cpu.gpr.s2;
}