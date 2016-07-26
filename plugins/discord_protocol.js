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


var Discord = require('discord.io');

exports.Plugin = function(bot, config){
    new DiscordConnection(bot, config);
}

DiscordConnection = function(bot, config){
    //setup discord client
    this.client = new Discord.Client({
        token: config.token || "",
        autorun: true
    });

    this.bot = bot

    //setup discord client listeners
    this.client.on('ready', this.onConnect.bind(this))
    this.client.on('message', this.onMessage.bind(this))
    
    //setup plugin crosstalk listeners
    this.bot.on('send message', this.onSendMessage.bind(this))
}

DiscordConnection.prototype.log = function(level, msg) {
    this.bot.log("discord_protocol", level, msg)
}

DiscordConnection.prototype.onConnect = function() {
    //print out link to invite this bot to the server
    var url = "https://discordapp.com/oauth2/authorize?client_id="
            + this.client.id
            + "&scope=bot&permissions=0"

    this.log("info", "Use this url to invite the bot to your server: "+url)

    //say the connection is established
    this.log("info", "Discord connection is up!")
    this.bot.emit("connected", {protocal:"discord", server:""})
    //TODO: loop through servers and emit an even for each
}

DiscordConnection.prototype.onMessage = function(user, userID, channelID, message, event) {
    var client = this.client  

    if (message === "ping") {
	this.sendMessages(channelID, ["Pong"]); //Sending a message with our helper function
    }
   
    //build the common parts of the message object
    var message_object = { 
          protocol: "discord"
        , prefix: {userID:userID, channelID:channelID}
        , nick: user
        , username: user+'#'+userID
        , body: message
        , full_message: event
        }

    //if the channel id is not in the channels list it means the message is 
    //  directly to the bot
    if (!client.channels[channelID]) {
        message_object.server = null
        message_object.channel = null
        message_object.command = "direct message"

    //otherwise it is a normal message sent through a channel
    } else {
        var serverID = client.channels[channelID].guild_id;

        message_object.server = client.servers[serverID].name
        message_object.channel = client.channels[channelID].name
        message_object.prefix.serverID = serverID
        message_object.command = "PRIVMSG"
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
    var resArr = [], len = messageArr.length;
    var callback = typeof(arguments[2]) === 'function' ?  arguments[2] :  arguments[3];
    if (typeof(interval) !== 'number') interval = 1000;
        
    //make discord client accessible to function
    var that = this.client
    function _sendMessages() {
        setTimeout(function() {
            if (messageArr[0]) {
                that.sendMessage({
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
    _sendMessages();
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
