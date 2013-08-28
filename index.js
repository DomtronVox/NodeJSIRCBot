//code that creates/initiates bots and plugin manager

var Bot = require('./bot').Bot;

var plugins = {
    irc_protocol:{
        servers: {
            server_1: {
                nick: "domBot",
                username: "TestBot",
                realname: "TestBot",
                host: "irc.nightstar.net",
                port: "6667",
                channels: ['#bendhacknslash']
            }
        }
    }
};

var bot1 = new Bot(plugins)
