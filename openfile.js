var jsonfile = JSON.parse(fs.readfile('A:\\Emulators\\NEWERVERSION\\Scripts\\tempfiles\\ghost-dump.json'));

var ghost = jsonfile['ghost'];

var decoded = Duktape.dec('base64', ghost);

console.log(decoded);

mem.setblock(0x802DAB80, decoded);