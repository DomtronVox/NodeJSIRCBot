//code that creates/initiates bots and plugin manager

//debug messages are on if true
var debug = true

var plugins = {
    irc_protocol:{
        servers: {
            server_1: {
                nick: "domBot",
                username: "TestBot",
                realname: "TestBot",
                host: "irc.freenode.net",
                port: "6667",
                channels: ['#bendhacknslash']
            }
        }
    }
};

var Server = require('./server').Server(debug);
var Bot = require('./bot').Bot;


var bot1 = new Bot(plugins)
