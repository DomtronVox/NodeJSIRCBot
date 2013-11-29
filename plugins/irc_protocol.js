//The irc_protocol handles connecting to irc networks. 
//The following are events emitted by this plugin:
// "message" - emitted when a message is received from the server. One argument
//           the message object described in PLUGIN_API.md
//  "connected" - emitted for each server successfully connected to the server 
//The following are events that this plugin listens for:
//  "send message" - 
//  "exit" - Causes the plugin to disconnect from all servers.

var net = require('net');

//configure the plugin
exports.Plugin = function(bot, config) {
    //information for connecting to servers
    //TODO: properly handle incorrect plugin config files(if possible in the bot code)
    for (server_conf in config.servers){
        //initialize
        conn = new Connection(bot, config.servers[server_conf]);
        //connect
        conn.connect();
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

    //cumulation of msg chunks and msg that have not been processed.
    this.buffer = "";

    //amount of time(in milliseconds) with no response 
    //    before the connection is closed 
    this.timeout = 60*60*1000;
    
    //the socket object
    this.socket = new net.Socket();
    
    //channels to connect to
    this.channels = config['channels'];

    //connection status
    this.connected = false;
    
    //bot object for relaying parsed messages, and basic information
    this.bot = bot;

    //add listeners to the bot for this connection
    bot.on("exit", this.disconnect);
    //bot.on("send message", this.sendMessage);
};

//connects to a irc server
Connection.prototype.connect = function(){
    //add server listeners  
    this.addListener('connect', this.onConnect);
    this.addListener('data'   , this.onData);
    //**Note**: listener functions are at the end of this file
    
    //socket object
    socket = this.socket;
    
    //add some self explanatory data to the socket then connect
    socket.setTimeout(this.timeout);
    socket.setEncoding(this.encoding);
    socket.setNoDelay();
    socket.connect(this.port, this.host);
};

//disconnect from the server
Connection.prototype.disconnect = function (){
    //only disconnect when connected
    if (this.connected == true){
        this.socket.end();
        this.connected = false;
    }; 
};

//concatenates arguments into a msg, then sends it.
Connection.prototype.raw = function(){
    //merges all the arguments into a single msg
    var data = "" 
    for (i in arguments) data += ' ' + arguments[i]
    data += "\r\n"; //add end of msg characters
    
    //send the msg
    this.socket.write(data, this.encoding)
};

//parse the incoming string message to a dictionary
Connection.prototype.handleMsg = function(text) {
    //TODO: parsing needs to handle server messages better.
    //verify the given msg is a string
    if (typeof text  !== "string") {return false};
    
    //make sure there are at least 2 words in the msg
    var words = text.split(" ");
    if (words.length < 2) {return false};
    
    //variables to store the msg parts
     var prefix  = " "
       , nick    = " "
       , username= " "
       , channel = " "
       , command = " "
       , body    = " ";
     
     //finds the prefix end character so the prefix can be parsed
     //  the prefix holds channel, network, and username info
     var prefix_end = text.indexOf(':', 2);

     prefix = text.substr(0, prefix_end);

     //get nick, username, command, and channel
     pre_words = prefix.trim().split(' ')
     if (pre_words[0] == 'PING'){
         nick = 'server'
         username = 'server'
         command = 'PING'
     } else if (pre_words.length == 3){
         var nick_end = prefix.indexOf('!~');
         nick = pre_words[0].substring(0, nick_end);
         
         var user_end = prefix.indexOf('@');
         username = pre_words[0].substring(nick_end+2, user_end);
         
         command = pre_words[1]
         channel = pre_words[pre_words.length-1]
         
     } else if (pre_words.length == 4){
         nick = 'server'
         username = 'server'
         command = pre_words[1]
         channel = pre_words[2]
     };

     //find the body of the msg
     body = text.substring(prefix_end+1)
     
     //emit the message event
     this.bot.emit('message',
        { server: this.host
        , prefix: prefix.trim()
        , nick: nick.trim()
        , username: username.trim()
        , channel: channel.trim() 
        , command: command.trim()
        , body: body.trim()
        , full_message: text.trim()
        });
     
};

//joins a list of channels
Connection.prototype.joinChannels = function(channs){
    //join each channel
    for (var i = 0; i < channs.length; i++){
        //send join command
        var name = channs[i];
        this.raw("JOIN", name);
        console.log('Sent join command for '+name);
    };
};

//Listener functions

//#shifts scope so <this> refers to the connection object not the socket object
Connection.prototype.addListener = function(event, callback) {
    //allows referencing the connection object rather then the socket object
    var that = this
    
    //adds a wrapper function as the callback function for the socket object
    this.socket.addListener(event, function() {
        //apply both sets the <this> var and runs the function
        callback.apply(that, arguments)
    });
}; 

//#protocol stuff that must be done after the connection to the server
Connection.prototype.onConnect = function(){
    console.log("Established connection to "+this.host);
    
    //send id information to the server
    this.raw('NICK', this.nick)
    this.raw('USER', this.username, '0', '*', ':', this.realname)
    
    console.log("Sent NICK and USER data.")
    
    //update the connection status
    this.connected = true

    //TODO: add sending authentication if provided in config

    //joins channels in the channel list
    this.joinChannels(this.channels)
};

//#collects, parses, and passes data on to the main bot object
//  for handling
Connection.prototype.onData = function(data){
    //collect the message chunks
    this.buffer += data;
    
    //if the buffer is not empty take care of buffered msg
    while (this.buffer.length > 0){
 
        //location of the end of the message
        //note: there may be multiple messages in the buffer at any time
        var offset = this.buffer.indexOf("\r\n");
        
        //if a msg is in the buffer parse and handle it
        if (offset > 0) {
            //pulls one msg from the buffer
            var msg = this.buffer.slice(0, offset);
            
            //remove the msg from the buffer
            this.buffer = this.buffer.slice(offset + 2);
            
            //if the msg is a ping then we must pong unless we have
            // disconnected. We will also pass the ping to the msg 
            // handler in case another plugin needs it.
            if (msg.slice(0,4) == "PING" && this.connected) {
                this.raw("PONG")
            };

            //parses the msg into an associative array and emmits the msg event
            this.handleMsg(msg);
    
        //if not; stop the loop and wait for more
        } else {break};
    };
};







