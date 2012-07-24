//This code handles the connection to irc servers

var net = require('net');

Connection = exports.Connection = function(conn_config, bot){
    //the connection's server and port 
    this.host = conn_config['host']
    this.port = conn_config['port']

    //in what formate to send data in
    this.encoding = conn_config['encoding'] || 'utf8'

    //this is where all the chunks of a msg are collected
    this.buffer = "" 

    //amount of time(in miliseconds?) with not resopnse 
    //    before the connection is closed 
    this.timeout = 60*60*1000;
    
    //the socket object
    this.socket = new net.Socket()
    
    //channels to connect to
    this.channels = conn_config['channels']

    //connection status
    this.connected = false
    
    //bot object for relaying parsed mesages, and basic information
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
    
    //add some extra data then connect
    socket.setTimeout(this.timeout)
    socket.setEncoding(this.encoding);
    socket.setNoDelay();
    socket.connect(this.port, this.host);
};

//function that sumerizes sending data
//TODO: make this async
Connection.prototype.raw = function(){
    //merges all the arguments into a single msg
    var data = "" 
    for (i in arguments) data += ' ' + arguments[i]
    data += "\r\n";//add end of msg charecters
    
    //send the msg
    this.socket.write(data, this.encoding)
};

//convert the msg from a string to a dictionary with usefull data
Connection.prototype.parseMsg = function(text, callback) {
    //varify the given msg is a string
    if (typeof text  !== "string") {return false};

    //make sure there are at least 2 words in the msg
    var words = text.split(" ");
    if (words.length < 2) {return false}
    
    //object to store the msg parts
     var parsedMsg = {
         prefix:  "",
         nick:    "",
         username:"",
         network: "",
         command: "",
         body:    ""
     };
     
     var start, end;
     //get the prefix
     start = text.indexOf(':');
     end = text.indexOf(':', start+1)+1;
     parsedMsg.prefix = text.slice(start, end);
     
     //get the msg body
     start = end;
     parsedMsg.body = text.slice(start);
     
     //get the sender id's
     parsedMsg.nick = text.slice(text.indexOf(':')+1, 
                                 text.indexOf('!'));
     parsedMsg.username = text.slice(text.indexOf('~')+1, 
                                     text.indexOf('@'));
     parsedMsg.network = text.slice(text.indexOf('@')+1,
                                    text.indexOf(' '))
     
     //get the server command type
     parsedMsg.command = parsedMsg.prefix.split(' ')[1]
      
     callback(parsedMsg);
};

//joins a list of channels
Connection.prototype.joinChannels = function(chans){
    //join each channel
    for (var i = 0; i < chans.length; i++){
        //send join command
        var name = chans[i];
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

//#what to do once connected to the server
Connection.prototype.onConnect = function(){
    console.log("Established connection");
    
    //general bot data
    bot = this.bot
    
    //send id information to the server
    this.raw('NICK', bot.nick)
    this.raw('USER', bot.username, '0', '*', ':', bot.realname)
    
    //update the connection status
    this.connected = true

    //TODO: add authentication code

    //joins channels in the channel list
    this.joinChannels(this.channels)
};

//#recives data, parses, and hands it off to the main bot object
//  for handling
Connection.prototype.onData = function(data){    
    //collect the message peices
    this.buffer += data;
    
    //if the buffer is not empty take care of buffered msg
    while (this.buffer.length > 0){
        //location of the end of msg characters
        //note: there may be multiple mesages in the buffer at any time
        var offset = this.buffer.indexOf("\r\n");
        
        //if a msg is in the buffer parse and handle it
        if (offset > 0) {
            //pulls one msg from the buffer
            var msg = this.buffer.slice(0, offset);
            //remove the msg from the buffer
            this.buffer = this.buffer.slice(offset + 2);
            
            //if it is a ping then we must pong
            if (msg.slice(0,4) == "PING") {
                this.raw("PONG", ':', msg.slice(6))

            //otherwise take care of the msg
            } else {
              //parse the msg into an associative array and
              // send the msg to the bot object mesage handler function
              this.parseMsg(msg, function(){
                  //shifts scope so <this> refers to the bot object
                  this.bot.handleMesage.apply(this.bot, arguments)
              });  
            };  
        //if there are no more full mesages in buffer stop the loop and wait for more
        } else {break}
    };
};







