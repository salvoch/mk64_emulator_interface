/*Example of events and callbacks */

// When osPfsReadWriteFile is called
events.onexec(0x800D045C, function() {
    console.log("osPfsReadWriteFile was called");
    
});

//When a memory address is written to, can do onread
events.onwrite(0x80162F20, function(e) {
    console.log("Char load breakpoint was called");
});

console.log("Other stuff tho")