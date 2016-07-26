//Author: DomtronVox
//Version: 0.5
//Description: The irc_protocol handles connecting to irc networks. 
//
//The following are events emitted by this plugin:
// "message" - emitted when a message is received from the server. One argument
//           the message object described in PLUGIN_API.md
//  "connected" - emitted for each server successfully connected to the server 
//The following are events that this plugin listens for:
//  "send message" - 
//  "exit" - Causes the plugin to disconnect from all servers.

var irc = require('irc');

//configure the plugin
exports.Plugin = function(bot, config) {
    //information for connecting to servers
    //TODO: properly handle incorrect plugin config files(if possible in the bot code)
    for (server_conf in config.servers){
        //initialize server connection
        var conn = new Connection(bot, config.servers[server_conf]);
    };
}


Connection = function(bot, config){
    //identifiers for the bot
    this.nick     = config.nick     || "IRC Bot"
    this.username = config.username || "IRC Bot"
    this.realname = config.realname || "IRC Bot"

    //the connection's server and port 
    this.host = config['host'];
    this.port = config['port'];

    //in what text encoding to send data in
    this.encoding = config['encoding'] || 'utf8';

    //channels to connect to
    this.channels = config['channels'] || [];

    //bot variable for relaying parsed messages, and basic information
    this.bot = bot;

    this.client = new irc.Client(this.host, this.nick, {
        channels: this.channels
    })

    //add listeners to the irc client for this server
    this.client.on('message', this.onMessage.bind(this));
    this.client.on('error', this.onError.bind(this));

    //add listeners to the bot for this server
    bot.on("send message", this.sendMessage.bind(this));
};

//personalized logging
Connection.prototype.log = function(level, msg) {
    this.bot.log("irc_protocol", level, msg)
}

//error handeling
Connection.prototype.onError = function(msg) {
    this.log("error", msg)
}


//connects to an irc server
Connection.prototype.onConnect = function(){
    
};

//disconnect from the server
Connection.prototype.onDisconnect = function (){
    
};


//parse the incoming string message to a dictionary
Connection.prototype.onMessage = function(from, to, message) {
    this.log("debug", "Server: "+this.host + 
                      "; Channel: " + to + 
                      "; Speaker: " + from + 
                      "; Message: " + message)
    
    //variables to store the msg parts
     var prefix  = " "
       , nick    = from
       , username= " "
       , channel = to
       , command = "PRIVMSG"
       , body    = message;
     
     //emit the message event
     this.bot.emit('message',
        { protocol: "Internet Relay Chat" 
        , server: this.host
        , prefix: prefix.trim()
        , nick: nick.trim()
        , username: username.trim()
        , channel: channel.trim() 
        , command: command.trim()
        , body: body.trim()
        , full_message: {"from":from, "to":to, "message":message}
        });
     
};

//handle sending messages through IRC
Connection.prototype.sendMessage = function(message_object) {
    //make sure the request is for the irc protocol
    if (message_object.protocol == "Internet Relay Chat" ||
        message_object.protocol.toLowerCase() == "irc") {
        //make sure the message is for this server
        if (message_object.server == this.host) {
            //send the message to the channel
            this.client.say(message_object.channel, message_object.body);
        } else {
            this.log("debug", "Ignoring send message event because it is not for my IRC server ("+this.host+").")
        }
    } else {
        this.log("debug", "Ignoring send message event because it is not using IRC protocol.")
    }
}


