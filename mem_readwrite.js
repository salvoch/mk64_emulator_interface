/*Examples of reading from memory*/

// Read some data from ROM or RAM, print it
// Read start of header
var header_start = mem.u32[0x8018EF50];
console.log(header_start);

// Even better, bind a variable to to a memory location, just use the variable instead, only need to do it once
// can do it for multiple variables at the same time
// See what ghosts are available for slot 1 and 2
// (can do different types [u8, f32, etc] see here - https://hack64.net/docs/pj64d/apidoc.php#type_ids)
mem.bindvars(global, [
    [ 0x8018EF55, 'slot1_track', u8 ],
    [ 0x8018EFD5, 'slot2_track', u8 ]
]);
console.log("Ghosts are stored for  ", slot1_track, slot2_track);

// Return a full block in memory, returns it as an array in decimal
var test = mem.getblock(0x8018EF50, 256);
console.log(test);

//You can read/write this into a file like this:
// fs.writefile("ram_dump.bin", mem.getblock(mem.getblock(0x8018EF50, 256));

//inversly, can set data:
//(mem.setblock(address: number, data: string | Buffer | TypedArray, length?: number): void)
//mem.setblock(0x80400000, fs.readfile("textures.bin"));