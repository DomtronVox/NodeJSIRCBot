//code that creates/initiates bots and plugin manager

//debug messages are on if true
var debug = true

/*
irc_protocol:{
        servers: {
            server_1: {
                nick: "domtest",
                username: "TestBot",
                realname: "TestBot",
                host: "irc.nightstar.net",
                port: "6667",
                channels: ['#test221']
            }
        }
    }
*/

var plugins = {
    discord_protocol:{
        token:""
    },
    message_logger:{
        directory: "static/logs"
    }

};

var Server = require('./server').Server(debug);
var Bot = require('./bot').Bot;

var bot1 = new Bot(plugins, debug)
