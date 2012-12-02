//This code handles the connection to irc servers 
//  and sending/receiving messages

var net = require('net');

Connection = exports.Connection = function(conn_config, bot){
    //the connection's server and port 
    this.host = conn_config['host']
    this.port = conn_config['port']

    //in what formate to send data in
    this.encoding = conn_config['encoding'] || 'utf8'

    //cumulation of msg chunks and msg that have not been processed.
    this.buffer = "" 

    //amount of time(in milliseconds?) with no response 
    //    before the connection is closed 
    this.timeout = 60*60*1000;
    
    //the socket object
    this.socket = new net.Socket()
    
    //channels to connect to
    this.channels = conn_config['channels']

    //connection status
    this.connected = false
    
    //bot object for relaying parsed messages, and basic information
    this.bot = bot
};

//connects to a irc server
Connection.prototype.connect = function(){
    //add listeners  
    this.addListener('connect', this.onConnect)
    this.addListener('data'   , this.onData)
    //Note: listener functions are at the end of this file
    
    //socket object
    socket = this.socket
    
    //add some self explanatory data to the socket then connect
    socket.setTimeout(this.timeout)
    socket.setEncoding(this.encoding);
    socket.setNoDelay();
    socket.connect(this.port, this.host);
};

//disconnect from the server
Connection.prototype.disconnect = function (){
    //only send disconnect when connected
    if (this.connected == true){
        this.socket.end();
        this.connected = false;
    }; 
};

//concatenates arguments into a msg, then sends it.
//TODO: make this asynchronous
Connection.prototype.raw = function(){
    //merges all the arguments into a single msg
    var data = "" 
    for (i in arguments) data += ' ' + arguments[i]
    data += "\r\n";//add end of msg characters
    
    //send the msg
    this.socket.write(data, this.encoding)
};

//convert the msg from a string to a dictionary
Connection.prototype.parseMsg = function(text, callback) {
    //verify the given msg is a string
    if (typeof text  !== "string") {return false};
    
    //make sure there are at least 2 words in the msg
    var words = text.split(" ");
    if (words.length < 2) {return false}
    
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
     console.log(pre_words)
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
         channel = pre_words[-1]
         console.log(pre_words[2])
     } else if (pre_words.length == 4){
         nick = 'server'
         username = 'server'
         command = pre_words[1]
         channel = pre_words[2]
     };

     //find the body of the msg
     body = text.substring(prefix_end+1)
     
     //hand off the parsed msg to the callback
     callback(
        { prefix: prefix.trim()
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
        console.log('Channel '+name+" joined!");
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
    
    //shortens bot data reference
    bot = this.bot
    
    //send id information to the server
    this.raw('NICK', bot.nick)
    this.raw('USER', bot.username, '0', '*', ':', bot.realname)
    
    console.log("Sent NICK and USER data.")
    
    //update the connection status
    this.connected = true

    //TODO: add authentication code

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
            // handler in case a plugin needs it.
            if (msg.slice(0,4) == "PING" && this.connected) {
                this.raw("PONG")
                console.log("PONG")
            };

            //parse the msg into an associative array and
            // send the msg to the bot object msg handler function
            
            this.parseMsg(msg, function(){
                //shifts scope so <this> refers to the bot object
                this.bot.handleMesage.apply(this.bot, arguments)
            });    
        //otherwise stop the loop and wait for more
        } else {break};
    };
};







