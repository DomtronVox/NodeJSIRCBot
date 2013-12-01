//Author: DomtronVox
//Vertion: 0.3
//Description: message_logger listens for messages and then adds them to a channel specific, date specific, staticly served text file.
//
//The following are events emitted by this plugin:
// none
//The following are events that this plugin listens for:
// "message" - places the message body into a staticly served log.

//TODO: make sure this can log messages other then irc

var fs = require('fs');

exports.Plugin = function(bot, config){

    logger = new Logger(bot, config);
}

Logger = function(bot, config){

    this.bot = bot;

    this.path = config.directory;

    //make sure the folders for the log files exist
    var i = 0, sub_path;
    while (i < this.path.length){
        i = this.path.indexOf('/', i+1);
        //if we don't find another / move the pointer to the end
        if(i == -1) i = this.path.length;
        //we want the sub_path to include the / so substr needs +1 
        sub_path = this.path.substr(0, i+1);
        if (!fs.existsSync(sub_path)) fs.mkdirSync(sub_path);
    };

    //listen for messages
    bot.on('message', this.onMessage);
};

 

//create a string from the message object and append it to the correct file
Logger.prototype.onMessage = function(msg){
    if (msg.command == "PRIVMSG" && msg.channel[0] == '#'){
        bot = this;

        //varify the existance of the channel log folder
        fs.exists("static/logs/"+msg.channel.substr(1), function(exists){ 
            if (!exists) fs.mkdir("static/logs/"+msg.channel.substr(1));
        });

        //dicide on filename based on date
        var date = new Date();
        var name = date.getDate()+'-'+date.getMonth()+'-'+date.getFullYear()+'.txt';
        var time = date.getHours()+':'+date.getMinutes()+':'+date.getSeconds();

        frmtd_msg = time +' '+ msg.nick.trim() + ': ' + msg.body + '\n';
        log_path = "static/logs/"+msg.channel.substr(1)+"/"+name;
        fs.exists(log_path, function(exists){
            //if the file exists add the message to the end
            if (exists) fs.appendFile(log_path, frmtd_msg);
            
            //if the log file does not exist create it and then add the message
            else  fs.writeFile(log_path, frmtd_msg, function(err){bot.log(err)});
        })
    }
}
