// This code mediates data between irc servers and the http interface

//connection object for irc servers
var Connection = require('./connection').Connection; 

//the Bot object holds data on bot id's, connections to servers, and
//    known irc users. It also handles plugins.
Bot = exports.Bot = function(config){
    this.init(config)
}

Bot.prototype.init = function(config){
    //identifiers for the bot
    this.nick     = config.nick     || "IRC Bot"
    this.username = config.username || "IRC Bot"
    this.realname = config.realname || "IRC Bot"
    
    //information for connecting to servers
    this.server_data = config.servers || {}
    
    //all server connection objects
    this.connections = {}
 
};

//creates connection objects from the server_data var
Bot.prototype.connect = function(){
    //pull the data for each server and...
    for (name in this.server_data){
        var data = this.server_data[name]

        //... use it to create the connection object
        this.connections[name] = new Connection(data, this)

        //then connect to the server
        this.connections[name].connect()
    }
};

Bot.prototype.handleMesage = function(msg){
    console.log(msg)
    console.log("\n")
};
