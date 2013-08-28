// This code mediates data between plugins

//connection object for irc servers
var Events = require('events');

//the Bot object handles initializing plugins and the events between plugins
Bot = exports.Bot = function(plugins){    
    //inits event emitter for plugin use by merging its functions into bot
    for (var prop in Events.EventEmitter.prototype) {
        this[prop] = Events.EventEmitter.prototype[prop];
    }
    
    //setup error event handling
    this.on('error', function(msg){console.log(msg)});
    this.on('message', function(msg){console.log(msg)});//debug

    for (plugin in plugins){
        //load the module with the plugin and pass the plugin config to 
        //  its init function. not plugins need the bot object and a conf file.
        //TODO:handle errors when the given plugin name does not correspond to a file. 
        require("./plugins/"+plugin).Plugin(this, plugins[plugin]);
    };
};
