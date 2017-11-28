//Author: DomtronVox
//Version: 0.5
//Description: The discord_protocol handles connecting to and interacting with the 
//           discord servers. 
//
//The following are events emitted by this plugin:
// "message" - emitted when a message is received from the server. One argument
//           the message object described in PLUGIN_API.md
//  "connected" - emitted for each server successfully connected to the server 
//The following are events that this plugin listens for:
//  "send message" - 


var Discord = require('discord.js');

exports.Plugin = function(bot, config){
    new DiscordConnection(bot, config);
}

DiscordConnection = function(bot, config){
    //setup some variables first
    //>setup discord client
    this.client = new Discord.Client();

    //>bot referance for communication with other plugins
    this.bot = bot;

    //>Login token
    this.token = config.token || "";

    //setup discord client listeners
    this.client.on('ready', this.onConnect.bind(this));
    this.client.on('message', this.onMessage.bind(this));
    
    //setup plugin crosstalk listeners
    this.bot.on('send message', this.onSendMessage.bind(this));

    //connect to discord
    this.client.login(this.token);
}

DiscordConnection.prototype.log = function(level, msg) {
    this.bot.log("discord_protocol", level, msg)
}

DiscordConnection.prototype.onConnect = function() {
    //print out link to invite this bot to the server
    var url = "https://discordapp.com/oauth2/authorize?client_id="
            + this.client.user.id
            + "&scope=bot&permissions=0"

    this.log("info", "Use this url to invite the bot to your server: "+url);

    //say the connection is established
    this.log("info", "Discord connection is up!");
    this.bot.emit("connected", {protocal:"discord", server:""});
    //TODO: loop through servers and emit an event for each
}

//format incomming messages in the bot's message format
DiscordConnection.prototype.onMessage = function(discordjs_message) {
    var client = this.client
      , author = discordjs_message.author 
      , channel = discordjs_message.channel
      , content = discordjs_message.content

    if (content === "ping") {
	this.sendMessages(channelID, ["Pong"]); //Sending a message with our helper function
    }
   
    //build the common parts of the message object
    var message_object = { 
          protocol: "discord"
        , prefix: {"userID":author.id, "channelID":channel.id}
        , username: author.username
        , body: content
        , full_message: discordjs_message
        , channel: channel.name
        }

    //Messages with a channel of the type text comes from a server channel
    if (channel.type == "text") {
        message_object.server = channel.guild.name;
        message_object.prefix.serverID = channel.guild.id;
        message_object.nick = channel.members.get(author.id).displayName;
        message_object.command = "server";

    //otherwise it is a message sent through a channel unrelated to a server
    } else {
        message_object.server = "pm";
        message_object.nick = author.username;
        message_object.command = "channel";
    }

    

    this.log('debug', message_object);
    this.bot.emit('message', message_object);
}


DiscordConnection.prototype.onSendMessage = function(message_object) {
    if (message_object.protocol == "discord") {
        //TODO check if message body is a string and if so wrap it in a list for send message
        //TODO alternativly edit sendMessages to use a string instead of an array
        this.sendMessages(message_object.prefix.channelID, [message_object.body])
    } else {
        this.log("debug", "Ignoring send message event because it is not using discord protocol.")
    }
}

//**Helper Functions**//

//Send a message using the discord protocol
DiscordConnection.prototype.sendMessages = function(ID, messageArr, interval) {
    //var resArr = [], len = messageArr.length;
    //var callback = typeof(arguments[2]) === 'function' ?  arguments[2] :  arguments[3];
    //if (typeof(interval) !== 'number') interval = 1000;
        
    //make discord client accessible to function
    var channel = this.client.channels.get(ID)

    //TODO probebly needs more work
    if (channel != undefined) {
        channel.send(messageArr);
    }

    /* Why did I write this O.o?
    function _sendMessages() {
        setTimeout(function() {
            if (messageArr[0]) {
                client.sendMessage({
                    to: ID,
                     message: messageArr.shift()
                }, function(err, res) {
                    if (err) {
                        resArr.push(err);
                    } else {
                        resArr.push(res);
                    }
                   
                    if (resArr.length === len) {
                        if (typeof(callback) === 'function') callback(resArr);
                    }
                });
                _sendMessages();
            }
        }, interval);
    }
    _sendMessages();*/
}

//calculate permisions
function calcPermissions() {
    //descriptions: https://discordapp.com/developers/docs/topics/permissions#bitwise-permission-flags
    var CREATE_INSTANT_INVITE =	0x00000001
       ,KICK_MEMBERS =		0x00000002
       ,BAN_MEMBERS =		0x00000004
       ,ADMINISTRATOR =		0x00000008
       ,MANAGE_CHANNELS =	0x00000010
       ,MANAGE_GUILD =		0x00000020
       ,READ_MESSAGES =		0x00000400
       ,SEND_MESSAGES =		0x00000800
       ,SEND_TTS_MESSAGES =	0x00001000
       ,MANAGE_MESSAGES =	0x00002000
       ,EMBED_LINKS =		0x00004000
       ,ATTACH_FILES =		0x00008000
       ,READ_MESSAGE_HISTORY =	0x00010000
       ,MENTION_EVERYONE =	0x00020000    
       ,CONNECT =		0x00100000
       ,SPEAK =			0x00200000
       ,MUTE_MEMBERS =		0x00400000
       ,DEAFEN_MEMBERS =	0x00800000
       ,MOVE_MEMBERS =		0x01000000
       ,USE_VAD =		0x02000000
       ,CHANGE_NICKNAME =	0x04000000
       ,MANAGE_NICKNAMES = 	0x08000000
       ,MANAGE_ROLES =		0x10000000;

    return {
        text_user: READ_MESSAGES | SEND_MESSAGES | EMBED_LINKS | ATTACH_FILES |
                   READ_MESSAGE_HISTORY | MENTION_EVERYONE | CHANGE_NICKNAME
      , voice_user: CONNECT | SPEAK
      , admin_user: MANAGE_NICKNAMES | MUTE_MEMBERS | DEAFEN_MEMBERS | MOVE_MEMBERS |
                    ADMINISTRATOR | BAN_MEMBERS | KICK_MEMBERS | CREATE_INSTANT_INVITE
    }
}
