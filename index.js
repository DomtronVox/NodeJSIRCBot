//code that creates/initiates bots and plugin manager

var Bot = require('./bot/bot').Bot;

var config = {
    nick: "TestBot",
    username: "TestBot",
    realname: "TestBot",
    servers: {
        server_1: {
            host: "irc.freenode.net",
            port: "6667",
            channels: ['#bendhacknslash']
        }
    }
};

var bot1 = new Bot(config)

bot1.connect()
