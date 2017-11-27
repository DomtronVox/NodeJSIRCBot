var rpg = require('./rpg_game/rpg/lib/index.js').RPG_Game;
var skills_data = require('./rpg_game/skills.js')

exports.Plugin = function(bot, config){
    RPGGame_scope = new RPGGame(bot, config);
}

RPGGame = function(bot, config){
    
    this.bot = bot

    this.game_data = new rpg("path", skills_data)

    this.player_database = {};

    //setup the list of command strings
    if ( typeof(config.command_str) === "string" ) {
        this.command_str = [config.command_str]
    } else if ( Object.prototype.toString.call( config.command_str ) === '[object Array]' ) {
        this.command_str = config.command_str
    } else {
        this.command_str =  ["!rpg"]
    }

    //settup listeners
    bot.on('message', this.onMessage.bind(this))
}

//stores the RPG commands
RPGGame.prototype.rpg_commands = [];

RPGGame.prototype.log = function(level, msg) {
    this.bot.log("rpg_game", level, msg)
}

RPGGame.prototype.onMessage = function(message) {

    //if the message contains the right key words. Roll some dice!
    var text = message.body;

    for ( var command_str in this.command_str ) {
        command_str = this.command_str[command_str]
        if (text.substring(0, command_str.length) == command_str) {
        
            //take out the command string and trim white space from either end.
            text = text.substring(command_str.length).trim()

            //Handle the request
            var new_text = this.handleRequest(message, text);

            //if there is a response to be sent construct the message object and emit it
            if (new_text != undefined && new_text.length > 0) {
                //setup new message object to send the results
                var new_msg = message
                new_msg.body = new_text;
                new_msg.nick = new_msg.username = "@bot"

                this.log("debug", "return message: " + new_msg.body);
        
                //send the message
                this.bot.emit("send message", new_msg);
            }
        }   
    }

}

//handles RPG action requests
RPGGame.prototype.handleRequest = function(message, text) {
    var new_text; //message to send in response
    var valid_command = false

    //go through each command, see if it matches the request and handel it
    for (var command in this.rpg_commands){
        command = this.rpg_commands[command];

        //check if request matches this command, if not go to next command
        //TODO use regexp matching instead of simple substring matching
        console.log(text.substr(0, command.text.length), command.text, (text.substr(0, command.text.length) != command.text) )
        if (text.substr(0, command.text.length) != command.text) { continue; }

        //check if the command's claimed function exits in the object
        if (!command.func in this) {
            this.log("error", "Command '"
                    +command.text+
                    "' has invalid function listed. Expected function is '"
                    +command.func+"'."
            );

        //since we matched commands call the proper function
        } else {
            //TODO need alot more work with varifying arguments
            new_text = this[command.func](message, text.substr(command.text.length).split(","))
        }

        valid_command = true;
    }

    //print help text if we did not recive a valid command
    if (!valid_command) {
        new_text = "Invalid sub-command for rpg. \n" + this.helpText()
    }

    return new_text;
}

//get and validate the character
RPGGame.prototype.getCharacter = function(char_name) {

    var character;
    if (this.player_database[message.username] == char_name) {
        character = this.game_data.CharacterManager.characters[char_name];
        if (character == undefined) { 
            character = "Sorry, character '"+char_name+"' does not exist."; 
        }
    } else {
        character = "Sorry you have no characters named '"+char_name+"'.";
    }

    return character;

}

//###################################
//####Commands
//###################################
//Each command needs a object entry in RPGGame.prototype.rpg_commands detailing
// the commands regex match, number of arguments, and name of the function to run

//usage text
RPGGame.prototype.rpg_commands.push({text:"help", func: "helpText", args:[]});
RPGGame.prototype.helpText = function(message){
    var help_text = "Usage Info: \n"; 

    //bot commands
    help_text += "- prepend all rpg commands with one of the following: "
    for (var com_str in this.command_str) {
        com_str = this.command_str[com_str];
        help_text += com_str + ", "
    }
    //cut final comma and space then add a period
    help_text = help_text.substring(0,help_text.length-2) + ". ";
    help_text += "Seperate additional data with commas.\n"; 

    //rpg commands
    for (var com in this.rpg_commands) {
        com = this.rpg_commands[com]
        help_text += "- "+com.text+" \t Data: "+com.args.length+".\n";
        //TODO loop over argument list and added them to sentance
    }

    return help_text;
}


//create a new character
RPGGame.prototype.rpg_commands.push({text:"create character", func: "createCharacter", args:["name"]})
RPGGame.prototype.createCharacter = function(message, args) {
    var char_name = args[1].trim()
      , return_text = "";

    //TODO do checking

    this.player_database[message.username] = char_name
    this.game_data.createCharacter(char_name);
    
    return_text = "Created character named '"+char_name+"'.";

    return return_text;
}


//print out curent character stats
RPGGame.prototype.rpg_commands.push({text:"stats", func: "characterListStats", args:["name"]})
RPGGame.prototype.characterListStats = function(message, args) {
    var char_name = args[0].trim()
      , return_text = ""
      , character;

    //get the character object
    character = this.getCharacter(char_name);
    if (typeof(character) == "string") { return character; }

    //TODO debugging
    character.stats["strength"]["modifiers"]["test"] = 4;
    character.stats["will"]["modifiers"]["test"] = -2;

    //loop over stats and add them to the text
    for (var stat_name in character.stats) {
        var stat_base = character.stats[stat_name]["base"];
        var effective_stat = character.getEffectiveStat(stat_name);

        return_text += stat_name + " " + stat_base;

        
        if (effective_stat != stat_base) {
            return_text += "("+effective_stat+")";
        }

        return_text += ", ";
    }

    //cut final comma and space
    return_text = return_text.substring(0, return_text.length-2); 

    return return_text;
}


//list out character skills
RPGGame.prototype.rpg_commands.push({text:"skills", func: "characterListSkills", args:["name", "skill name"]})
RPGGame.prototype.characterListSkills = function(message, args) {
    var char_name = args[0].trim()
      , return_text = ""
      , character;

    //get the character object
    character = this.getCharacter(char_name);
    if (typeof(character) == "string") { return character; }

    //loop over stats and add them to the text
    for (var skill_name in character.skills) {
        var stat_base = character.skills[stat_name]["base"];
        var effective_stat = character.getEffectiveStat(stat_name);

        return_text += stat_name + " " + stat_base;

        if (effective_stat != stat_base) {
            return_text += "("+effective_stat+")";
        }

        return_text += ", ";
    }

    //cut final comma and space
    return_text = return_text.substring(0, return_text.length-2); 

    return return_text;
}


