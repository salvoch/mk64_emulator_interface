var jsonfile = JSON.parse(fs.readfile('A:\\Emulators\\NEWERVERSION\\Scripts\\tempfiles\\ghost-dump.json'));

var ghost = jsonfile['ghost'];

//If you prefer a full Uint8Array over a plain buffer, you can coerce the result as follows:
//var result = Object(Duktape.dec('base64', jsonfile['ghost']));
var decoded = Duktape.dec('base64', ghost);

console.log(decoded);

mem.setblock(0x802DAB80, decoded);