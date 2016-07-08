//Author: DomtronVox
//Version: 0.3
//Description: message_logger listens for messages and then adds them to a channel specific, date specific, statically served text file.
//
//The following are events emitted by this plugin:
// none
//The following are events that this plugin listens for:
// "message" - places the message body into a statically served log.

var fs = require('fs');
var path = require('path');

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
    if (msg.server && msg.channel){
        bot = this;

        //decide on filename based on date
        var date = new Date();
        var name = date.getDate()+'-'+date.getMonth()+'-'+date.getFullYear()+'.txt';
        var time = '['+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds()+']';

        var frmtd_msg = time +' '+ msg.nick.trim() + ': ' + msg.body + '\n';
           
        var log_path = "static/logs/"+msg.server+"/"+msg.channel+"/";
        var file_path = log_path+name

        //verify the existence of the channel log folder
        fs.exists(log_path, function(exists){ 
            fs.mkdirParent(log_path)

            //verify existence of log file
            fs.exists(file_path, function(exists){
                //if the file exists add the message to the end
                if (exists) fs.appendFile(file_path, frmtd_msg);
            
                //if the log file does not exist create it and then add the message
                else  { 
                    fs.writeFile(file_path, frmtd_msg, function(err){
                        if (err) bot.log("message_logger", "error", err)
                    });
                }
            })
        })
    }
}


//taken from http://lmws.net/making-directory-along-with-missing-parents-in-node-js
fs.mkdirParent = function(dirPath, mode, callback) {
  //Call the standard fs.mkdir
  fs.mkdir(dirPath, mode, function(error) {
    //When it fail in this way, do the custom steps
    if (error && error.errno === 34) {
      //Create all the parents recursively
      fs.mkdirParent(path.dirname(dirPath), mode, callback);
      //And then the directory
      fs.mkdirParent(dirPath, mode, callback);
    }
    //Manually run the callback since we used our own callback to do all these
    callback && callback(error);
  });
};
