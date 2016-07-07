// This code mediates data between plugins

//event emitter object so plugins can communicate with eachother 
var EventEmitter = require('events').EventEmitter;



//the Bot object initializes plugins and emmits events between plugins
Bot = exports.Bot = function(plugins, debug){
    //set debug variable
    this.DEBUG = debug    
    
    //setup error event handling
    this.on('error', function(msg){this.log("core", "error", msg)});
    //this.on('message', function(msg){this.log("debug", msg)});


    //load the module with the plugin and pass the plugin config to 
    //  its init function. not plugins need the bot object and a conf file.
    for (plugin in plugins){
        this.log("core", "debug", "Loaded plugin: "+plugin)
        //TODO:handle errors when the given plugin name does not correspond to a file.
        //TODO: Make sure each plugin only has one config file. i.e. a plugin is only initiated once.  
        require("./plugins/"+plugin).Plugin(this, plugins[plugin]);
    };
};

//make bot a child of EventEmitter
Bot.prototype = EventEmitter.prototype

//handle logging messages
Bot.prototype.log = function(plugin, type, msg){ 
    if(type=="debug" && this.DEBUG) console.log("["+plugin+"]", type+":", msg);
    else console.log("["+plugin+"]", type+":", msg);
};
