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
    this.server = config['host'];
    this.port = config['port'];

    //in what text encoding to send data in
    this.encoding = config['encoding'] || 'utf8';

    //channels to connect to
    this.channels = config['channels'] || [];

    //bot variable for relaying parsed messages, and basic information
    this.bot = bot;

    this.client = new irc.Client(this.server, this.nick, {
        channels: this.channels
      , username: this.username
      , realname: this.realname
      , port: this.port
      , floodProtection: true //keeps bot from getting kicked for flooding
      , autoRejoin: true
    })

    //add listeners to the irc client for this server
    this.client.on('message', this.onMessage.bind(this));
    this.client.on('invite', this.onInvite.bind(this));
    this.client.on('names', this.onOthersJoin.bind(this));
    this.client.on('join', this.onOthersJoin.bind(this));
    this.client.on('error', this.onError.bind(this));
    this.client.on('registered', this.onConnect.bind(this));
    this.client.on('quit', this.onDisconnect.bind(this));

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
    this.log("info", "Connected to "+this.server+"!")  
};

//disconnect from the server
Connection.prototype.onDisconnect = function (){
    this.log("info", "Disconnected from "+this.server+"! Will try to auto rejoin in a bit.")
};


//parse the incoming string message to a dictionary
Connection.prototype.onMessage = function(speaker, channel, body, irc_message) {
    this.log("debug", "Server: "+this.server + 
                      "; Channel: " + channel + 
                      "; Speaker: " + speaker + 
                      "; Message: " + body)
    console.log(irc_message)
    //check type of message
    var type;
    if (channel == this.nick) {
        type = "pm"
    } else {
        type = "channel"
    } 
 
    //emit the message event
    this.bot.emit('message', this.buildMessage(irc_message, type, channel, body));
     
};

//handle when a user joins or the initial list of users in a channel
Connection.prototype.onInvite = function (channel, requester, irc_message){
    console.log("channel:", channel, "; requester:", requester)
    console.log(message)

    this.bot.emit("invite request", this.buildMessage(irc_message, "invite", channel, ""));
};

//handle when a user joins or the initial list of users in a channel
Connection.prototype.onOthersJoin = function (channel, nick, message){
    console.log("channel:", channel, "; nick(s):", nick)
    console.log(message)

    //if nick is a string it is a single nick so for consistancy we will wrap it in a
    //    dictionary.
    if (typeof(nick) == "string") { nick = { nick: '' }; }

    this.bot.emit("user online", this.buildMessage(irc_message, "join", channel, nick));
};

//handle sending messages through IRC
Connection.prototype.sendMessage = function(message_object) {
    //make sure the request is for the irc protocol
    if (message_object.protocol == "Internet Relay Chat" ||
        message_object.protocol.toLowerCase() == "irc") {
        //make sure the message is for this server
        if (message_object.server == this.server) {
            //send the message to the channel
            this.client.say(message_object.channel, message_object.body);
        } else {
            this.log("debug", "Ignoring send message event because it is not for my IRC server ("+this.server+").")
        }
    } else {
        this.log("debug", "Ignoring send message event because it is not using IRC protocol.")
    }
}

//construct a message object from irc's (the library) message object
Connection.prototype.buildMessage = function(irc_message, channel, type, body) {

    return { 
         protocol: "Internet Relay Chat"
       , myident: { nick: this.nick, username: this.username, realname: this.realname}
       , server: this.server

       , prefix: irc_message.prefix
       , nick: irc_message.nick
       , username: irc_message.user
       , realname: "unknown"

       , channel: channel
       , type: type
       , body: body
       , full_message: irc_message
       }

}
