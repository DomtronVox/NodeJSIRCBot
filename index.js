//code that creates/initiates bots and plugin manager

//debug messages are on if true
var debug = true

/*

*/

var plugins = {
    discord_protocol:{
        token:"<redacted>"
    },
    irc_protocol:{
        servers: {
            server_1: {
                nick: "domsbot",
                username: "TestBot",
                realname: "TestBot",
                host: "irc.nightstar.net",
                port: "6667",
                channels: ['#bendhacknslash']
            }
        }
    },
    dice_roller:{
        command_str:["!dice", "!d"]
    },
    message_logger:{
        directory: "static/logs"
    }

};

var Server = require('./server').Server(debug);
var Bot = require('./bot').Bot;

var bot1 = new Bot(plugins, debug)
