/*MK64 is the script which interfaces with the Mario Kart 64 (EU) ROM using the latest
PJ64 emulator. It also interfaces with the "MK64 Watcher.exe" time and ghost manager*/
var WRITE_FLAG = false;
var CHARACTER_ID = null;
var TRACK_ID = null;
var MIO0_DATA = null;

console.log("Running MK64 script...");

//----TODOS:
//Test when the onexec(0x80091F60 function triggers, if no ghosts are saved, it doesn't trigger! How do we account for this?
//Do we have to close the socket each time? Should we? Look into adding it to the end of the query_socket function, not doing this!
//Think of how to not trigger onexec() twice, since it'll query the server twice
    //- Maybe the writeflag variable should be 0,1,2 (0=false, 1=true, 2=special)
    //- if set to 2, that means we checked, it was false, but we do a check in onexec() and it will not  break again! And set to 0 again after??
//Don't do server queries if it's not up, how do we do this?


//-----Events----- Trigger when conditions on the emulator are met
//Event to trigger when game checks if stage has saved ghost, trick game into thinking it does!
events.onexec(0x80091F60, function(e) {
    debug.breakhere(true);
    console.log("Character compare command triggered!");
    var trackId = cpu.gpr.s2;
    var json_payload = {"function": "check_for_ghost", "trackId": trackId};
    query_server(json_payload, read_ext_file);
});

//Event when ghost char ID is read for rendering. Chars IDs are 0-8
events.onread(0x80162F20, function(e) {
    debug.breakhere(true);

    //Checks to make sure we actually want to write a ghost
    if (WRITE_FLAG) {
        console.log("Character read triggered!");
        write_ghost_char(CHARACTER_ID);
        WRITE_FLAG = false; //Done loading, reset flag
    }
    debug.resume();  
});

//Event when MIO0 data is about to be decompressed, we can inject compressed ghost data here
events.onexec(0x8000520C, function(e) {
    debug.breakhere(true);

    //Checks to make sure we actually want to write a ghost
    if (WRITE_FLAG) {
        console.log("MIO0 read triggered!");
        inject_MIO0(MIO0_DATA);
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
    
    //Convert response to json, and file read into json
    var respJson = JSON.parse(data);

    //If the course is available for ghost injection
    if (respJson['available']) {
        console.log("Ghost available for this track.");
        var filePath = respJson['path'];
        var fileJson = JSON.parse(fs.readfile(filePath));
        CHARACTER_ID = new Buffer([find_char_id(fileJson['header']['character'])]);
        TRACK_ID = fileJson['header']['track']; //TODO - Do we need this as track id? Probably not? OR maybe for saving?
        MIO0_DATA = Duktape.dec('base64', fileJson['ghost']); //Decode base64 formatted input MIO0 Data
        WRITE_FLAG = true;

        //Call the function that tricks the game into thinking it has a ghost
        course_match();
    } else {
        console.log("Ghost unavailable for this track.");
        //TODO -Consider setting flag to 3rd option here!!
    }

    //Resume game
    debug.resume();
}

//Return character ID for given character
function find_char_id(character){

    var chars = {
        "mario": 0,
        "luigi": 1,
        "peach": 6,
        "toad": 3,
        "yoshi": 2,
        "d.k.": 4,
        "wario": 5,
        "bowser": 7,
    }; //TODO - verify d.k. is the right verbage

    return chars[character.toLowerCase()]
}

//Function to set ghost character, then resume emulator
function write_ghost_char(data){
    //TODO - write logic to convert CHARACTER_ID to the necessary bytes format
    //EITHER -- convert it to a 32bit value (ex: 00000004), or write 4 to 80162F24 instead of 80162F20 (or w/e)
    console.log("The char ID is:")
    console.log(data);
    mem.setblock(0x80162F23, data);
}

//Funciton that injects compressed MIO0 data into memory
//Called before MIO0 will be processed for decompression
function inject_MIO0(MIO0_stream){
    mem.setblock(0x802DAB80, MIO0_stream);
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