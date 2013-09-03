# Plugin API
## Creating A Plugin
A plugin should be in its own file in the folder bot/plugins, and should contain basic development information in comments near the top (i.e. description, author, and version). 

The plugin should be an object exported as "Plugin", and needs to take the bot object as it's first argument.

    Plugin = exports.Plugin = function(bot){
    this.init(bot)
    };
    
    //methods go here
    Plugin.prototype.init(bot){
    //initialization for the plugin.
    //add listeners here also
    };

## Event Handling
The bot object has an event emitter which can eimit the following events:

* 'connected' - Emitted when a connection to a server is established. Passes one argument: the name of the server.
* 'joined' - Emitted when an irc server is joined. Passes two arguments: the server name and the channel name.
* 'message' - Emitted when a message is received from a channel. Passes one argument: a message object that brakes down the information about the message.
    * See the section 'Message Object'.

To handle events the plugin needs to add listeners to the bot object.

    Plugin.prototype.init(bot){
        bot.addListener('message', this.onMsg)
    };
    
    Plugin.prototype.onMsg = function(msg_object){
        console.log('You have mail!")
    };

## Sending Data to the Server
A plugin may need to send data or requests to the server. This can be done with:

    bot.sendMessage(command, arg1, arg2..., callback)

Where the command and all arguments are strings and the callback is an optional function.

All the commands transmitted between the bot and the sever are defined in [RFC 1459](http://www.irchelp.org/irchelp/rfc/rfc.html) chapter [4 - Message Details](http://www.irchelp.org/irchelp/rfc/chapter4.html). However, I will provide a short list of relevant commands here.

The list below follows the form: 

    COMMAND [param list 1] [param list 2]. 
    Param lists are in the form [param1,param2...]. 
    A parameter name or a param list with a '*' preceding it denotes a optional parameter (i.e. *param 1, *[param1, param2]).

* NICK [new_nick] - Used to change the bots' nickname.
* JOIN [chan1,*chan2...] \*[pass1,pass2...] - Used to join the specified channel. The pass params are only needed if the channel is protected.
* PART [chan1,*chan2...] - Used to leave the given channels.
* NAMES [chan1,*chan2...] - Ask for a list of users present in each channel given.
    
So if you want the bot to join several channels you would:

    bot.sendMessage('JOIN', '#linux', '#windows')

## Message Object
A message object is passed to plugins every time a message is received from the server. The message object is a dictionary with 7 key/value pairs:

* 'prefix' - The prefix encodes information about the message like the channel, the sever, command codes, and the user sending the message. I believe the contents of the prefix varies between irc networks.
* 'nick' - The nickname of the sender. This will be server if the message was sent by the server.
* 'username' - The username of the sender. This will be server if the message was sent by the server.
* 'channel' - The channel from which the message originated. This will be an empty string if the message was sent by the server.
* 'command' - The command labeled on the message. See the 'Commands' sub-section for a summery of commands and links to more information.
* 'body' - the actual message that was sent.
* 'full_message' - The full message received from the server with no alterations.
