/*Pass args to the program, and execute stuff
Can we pass actual .js code from C# to execute here?
*/
console.listen(function(input) {
    var args = input.split(" ");
    var command = args.shift();
    switch(command) {
    case "ping":
        console.log("pong (args were:", args.join(", "), ")");
        return;
    case "end":
        console.log("done");
        console.listen(null);
        return;
    default:
        console.log("unknown command '" + command + "'");
    }
});