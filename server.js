//Web portal for getting data from the bot.

var express = require('express');

exports.Server = function(debug){

    var app = express();
    console.log(__dirname + "/static")
    app.use(express.static(__dirname + "/static"));

    app.listen(process.env.PORT || 8080)
    
    if (debug) console.log("Static server listening on port 8080");
}
