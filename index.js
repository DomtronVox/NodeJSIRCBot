//code that creates/initiates bots and plugin manager

//debug messages are on if true
var debug = false

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
        token:"MjAwNDE1NzAxNDk0NjYxMTIw.Cl87LQ.wCP-mJ8is_mr_Qp46u-y0AKWlm8"
    },
    dice_roller:{
        command_str:"!dice"
    },
    message_logger:{
        directory: "static/logs"
    }

};

var Server = require('./server').Server(debug);
var Bot = require('./bot').Bot;

var bot1 = new Bot(plugins, debug)
