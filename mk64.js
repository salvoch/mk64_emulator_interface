/*MK64 is the script which interfaces with the Mario Kart 64 (EU) ROM using the latest
PJ64 emulator. It also interfaces with the "MK64 Watcher.exe" time and ghost manager*/
var WRITE_FLAG = false;
var CHARACTER_ID = null;
var TRACK_ID = null;
var MIO0_DATA = null;

console.log("Running MK64 script...");

//----TODOS:
//Test when the onexec(0x80091F60 function triggers, if no ghosts are saved, it doesn't trigger! How do we account for this?
//Do we have to close the socket each time? Should we? Look into adding it to the end of the query_socket function

//-----Events----- Trigger when conditions on the emulator are met
//Event to trigger when game checks if stage has saved ghost, trick game into thinking it does!
events.onexec(0x80091F60, function(e) {
    debug.breakhere(true);
    console.log("Character compare command triggered!");
    var trackId = cpu.gpr.s2;
    var json_payload = {"Function": "check_for_ghost", "TrackID": trackId};
    query_server(json_payload, read_ext_file);
});

//Event when ghost char ID is read for rendering. Chars IDs are 0-8
events.onread(0x80162F20, function(e) {
    debug.breakhere(true);

    //Checks to make sure we actually want to write a ghost
    if (WRITE_FLAG) {
        console.log("Character read triggered!");
        write_ghost_char();
    }
    debug.resume();  
});

//Event when MIO0 data is about to be decompressed, we can inject compressed ghost data here
events.onexec(0x8000520C, function(e) {
    debug.breakhere(true);

    //Checks to make sure we actually want to write a ghost
    if (WRITE_FLAG) {
        console.log("MIO0 read triggered!");
        inject_MIO0();
        WRITE_FLAG = false;
    }
    debug.resume();
});

//PLACEHOLDER - Event when ghost is attempted to be saved

//-----Functions-----

//query the C# server, arg JSON payload, and callback function
//callback fn with response, have to do this since query is async
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

//Used as a callback function after sever query
//Read server response, if TRUE, read external file
//if FALSE, continue
function read_ext_file(data){
    //parse data response here
    
    //ALSO, get the path from the data!
    //TODO - IF jsonfile['avaialble'] === true or something, then:
    var jsonfile = JSON.parse(fs.readfile('A:\\Emulators\\NEWERVERSION\\Scripts\\tempfiles\\ghost-dump.json'));
    WRITE_FLAG = true;
    CHARACTER_ID = jsonfile['header']['character']; //TODO - convert this to ID
    TRACK_ID = jsonfile['header']['track']; //TODO - convert this to ID
    MIO0_DATA = Duktape.dec('base64', jsonfile['ghost']);

    //If you prefer a full Uint8Array over a plain buffer, you can coerce the result as follows:
    //var result = Object(Duktape.dec('base64', jsonfile['ghost']));

    //TODO -> Convert character and track to their IDs
    //TODO -> Un-encode the base64 from the mio

    //Call the function that tricks the game here??
    course_match();

    //Resume game
    debug.resume();
}

//Function to set ghost character, then resume emulator
function write_ghost_char(data){
    //TODO - write logic to convert CHARACTER_ID to the necessary bytes format
    //EITHER -- convert it to a 32bit value (ex: 00000004), or write 4 to 80162F24 (or w/e)
    mem.setblock(0x80162F20, data);
}

//Funciton that injects compressed MIO0 data into memory
//Called before MIO0 will be processed for decompression
function inject_MIO0(MIO0_stream){
    mem.setblock(0x802DAB80, mio_stream);
}

//Function that tricks game into thinking the header course save file matches the selected course
//Called when header course (t2) is compared to selected course (s2)
function course_match(){
    cpu.gpr.t2 = cpu.gpr.s2;
}


/*
execbreak (compare is done)
    reach out to server with --> (bool TrackID, string "check_for_ghost")
    Server responds: {"available": <bool>, "path": <string>}
        available?: bool ->
            false (do nothing) *BREAK*
                -> How do we prevent this from triggering two times???
            true (server has written the intermediate file)
                -> trick the game
                -> parse json, store varialbes globally
                -> continue emulator
                -> *game runs checksum*
                -> break
                    -> inject character ID (on read)
                -> break
                    -> Inject MIO0 (on read)
                -> reset flags/globals
                    -> Runs again on restart? Check?

    WRITE GHOST
        ...
*/