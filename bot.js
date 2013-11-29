// This code mediates data between plugins

//event emitter object so plugins can communicate with eachother 
var EventEmitter = require('events').EventEmitter;

//the Bot object initializes plugins and emmits events between plugins
Bot = exports.Bot = function(plugins){    
    //merges event emitter functions into bot so plugins can emit events
    for (var prop in EventEmitter.prototype) {
        this[prop] = EventEmitter.prototype[prop];
    }
    
    //setup error event handling
    this.on('error', function(msg){console.log(msg)});
    this.on('message', function(msg){console.log(msg)});//debug

    for (plugin in plugins){
        //load the module with the plugin and pass the plugin config to 
        //  its init function. not plugins need the bot object and a conf file.
        //TODO:handle errors when the given plugin name does not correspond to a file.
        //TODO: Make sure each plugin only has one config file. i.e. a plugin is only initiated once.  
        require("./plugins/"+plugin).Plugin(this, plugins[plugin]);
    };
};
