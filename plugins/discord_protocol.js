var Discord = require('discord.io');

exports.Plugin = function(bot, config){
    new DiscordConnection(bot, config);
}

DiscordConnection = function(bot, config){
    //setup discord client
    var client = new Discord.Client({
        token: config.token || "",
        autorun: true
    });

    client.log = this.log
    client.botApp = bot

    //settup client listeners
    client.on('ready', this.onConnect)
    client.on('message', this.onMessage)
}

DiscordConnection.prototype.log = function(level, msg) {
    this.botApp.log("discord_protocol", level, msg)
}

DiscordConnection.prototype.onConnect = function() {
    //print out link to invite this bot to the server
    var url = "https://discordapp.com/oauth2/authorize?client_id="
            + this.id
            + "&scope=bot&permissions=0"

    this.log("info", "Use this url to invite the bot to your server: "+url)

    //say the connection is established
    this.log("info", "Discord connection is up!")
}

DiscordConnection.prototype.onMessage = function(user, userID, channelID, message, event) {
  
    if (message === "ping") {
	sendMessages(channelID, ["Pong"]); //Sending a message with our helper function
    }
    console.log(this)

    //hunt down some values
    var serverID = this.channels[channelID].guild_id;

    var message_object = { 
          protocol: "discord"
        , server: this.servers[serverID].name
        , prefix: {userID:userID, serverID: serverID, channelID:channelID}
        , nick: user
        , username: user+'#'+userID
        , channel: this.channels[channelID].name
        , command: "PRIVMSG"
        , body: message
        , full_message: event
        }

    this.log('debug', message_object);
    this.botApp.emit('message',message_object);
}

//**Helper Functions**//

//Send a message using the discord protocol
function sendMessages(ID, messageArr, interval) {
	var resArr = [], len = messageArr.length;
	var callback = typeof(arguments[2]) === 'function' ?  arguments[2] :  arguments[3];
	if (typeof(interval) !== 'number') interval = 1000;

	function _sendMessages() {
		setTimeout(function() {
			if (messageArr[0]) {
				this.client.sendMessage({
					to: ID,
					message: messageArr.shift()
				}, function(err, res) {
					if (err) {
						resArr.push(err);
					} else {
						resArr.push(res);
					}
					if (resArr.length === len) if (typeof(callback) === 'function') callback(resArr);
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
