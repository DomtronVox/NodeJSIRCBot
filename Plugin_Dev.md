# Creating A New Plugin
A plugin should be in its own file in the folder bot/plugins, and should contain basic development information in comments near the top (i.e. description, author, version, events emitted, and events listened for). 

The file should export a function named "Plugin". This function needs to take the bot object as it's first argument and a configuration file as its second(example below). The exported function should create any objects it needs to operate.

    exports.Plugin = function(bot, config){
        new CoolObject(bot, config);
    };
    
    //methods go here
    CoolObject = function(bot, config){
        //initialization for the plugin. Set object variables here.
        this.awsome_variable = config.awsome_variable
        this.polywogs = config.polywogs
    
        //add listeners to the bot here. (see plugin API)
        bot.addListener("message", function(){console.log("a message!")})
    };

# Plugin API
## Event Handling
The bot object inherits from the node.js event emitter object. This means plugins can attach event listeners to the bot object (as shown above). Plugins can also emit their own events.

To handle events the plugin needs to add listeners to the bot object.

    CoolObject = function(bot, config){
        bot.addListener('message', this.onMsg);
    };
    
    CoolObject.prototype.onMsg = function(msg_object){
        console.log('You have mail!");
    };

To emit your own event you must call bot.emit(event_name, arg1, arg2... argn). Avoid interfering with another plugin's emitted events by using unique event names.

    CoolObject.prototype.onMsg = function(msg_object){
        bot.emit("MAIL!!", msg_object);
    };

## Events
### Emited Events
The following events are emitted by the basic plugins included in this repository.

* 'connected' - Emitted when a connection to a server is established. Passes one argument: the name of the server.
* 'disconnected' - Emitted when a connection to a server is droped. Passes one argument: the name of the server.
* 'joined' - Emitted when an irc channel is joined. Passes two arguments: the server name and the channel name.
* 'message' - Emitted when a message is received from a channel. Passes one argument: a message object that describes the message. See the section 'Apendix A - Message Object'.

### Events That Are Listened For 
The following events are listened for by the basic plugins included in this repository and will accomplish the described task(s).

* No events as of yet.


# Appendices 
## Appendix A - Message Object
A message object is passed to plugins every time a message is received from the server. The message object is a dictionary with 7 key/value pairs:

* 'prefix' - The prefix encodes information about the message like the channel, the sever, command codes, and the user sending the message. I believe the contents of the prefix varies between irc networks.
* 'nick' - The nickname of the sender. This will be server if the message was sent by the server.
* 'username' - The username of the sender. This will be server if the message was sent by the server.
* 'channel' - The channel from which the message originated. This will be an empty string if the message was sent by the server.
* 'command' - The command labeled on the message. See the 'Commands' sub-section for a summery of commands and links to more information.
* 'body' - the actual message that was sent.
* 'full_message' - The full message received from the server with no alterations.

## Appendix B - Links To Protocol Specifications

The irc_protocol plugin attempts to follow the specification for IRC clients as defined in [RFC 1459](http://www.irchelp.org/irchelp/rfc/rfc.html).

