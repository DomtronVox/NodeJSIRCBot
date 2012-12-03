# NodeJS IRC Bot

This project creates a bot with attached http server. The bot and server connection code is loosely based off the https://github.com/ktiedt/NodeJS-IRC-Bot.

I plan to implement the following features: yaml configuration files, compatible with cloudfoundry, and a web interface that plugins can display information on (example statically serve logs).

## Legal
All code for this project is free to use with no restrictions and no guarantee of usability or safety.

## Prerequisites

* NodeJS (tested under v0.6.5)

## Code Documentation

### File Descriptions

index.js - Mediates between bots, plugins, and the web interface.
bot/bot.js - Manages connections, plugins, and handles parsed messages.
bot/connection.js - Handles connecting, disconnecting, pings, receiving/sending messages, and parsing messages to JASON.
bot/plugins - folder where all the plugins should be placed.

### Quick Outline

index.js initiates the bot and web server objects

bot object receives a pointer to the web server object

bot initializes plugins

bot connects to the servers and channels

bot relays received messages to plugins

### Plugin API

Plugins should be placed in bot/plugins, and should contain basic info like description, author, and version. 

The plugin should be an object exported as "Plugin", and needs to take the bot object as it's first argument.

    Plugin = exports.Plugin = function(bot){
    this.init(bot)
    };
    
    //methods go here
    Plugin.prototype.init(bot){
    //initialization for the plugin.
    };

The bot object has an event emitter with the following events:

* 'connected' - Emitted when connected to a server. Passes one argument: the name of the server.
* 'joined' - Emitted when an irc server is joined. Passes two arguments: the server name and the channel name.
* 'message' - Emitted when a message is received from a channel. Passes one argument: a dictionary with information about the massage.
    * See sub-section 'Message Object'

To handle events the plugin needs to add listeners to the bot object.

    Plugin.prototype.init(bot){
        bot.addListener('message', this.onMsg)
    };
    
    Plugin.prototype.onMsg = function(msg_object){
        console.log('You have mail!")
    };

#### Message Object
A message object is passed to plugins every time a message is received from the server. The message object is a dictionary with 7 key/value pairs:

* 'prefix' - The prefix encodes information about the message like the channel, the sever, command codes, and the user sending the message. I believe the contents of the prefix varies between irc networks.
* 'nick' - The nickname of the sender. This will be server if the message was sent by the server.
* 'username' - The username of the sender. This will be server if the message was sent by the server.
* 'channel' - The channel from which the message originated. This will be an empty string if the message was sent by the server.
* 'command' - The command labeled on the message. See the 'Commands' sub-section for a summery of commands and links to more information.
* 'body' - the actual message that was sent.
* 'full_message' - The full message recived from the server with no alterations.

#### IRC Message Commands
TODO: Research the different commands irc networks send.
