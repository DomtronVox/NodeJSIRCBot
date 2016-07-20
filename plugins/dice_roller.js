var Dice = require("roll")
var diceroller

exports.Plugin = function(bot, config){
    diceroller_scope = new DiceRoller(bot, config);
}

DiceRoller = function(bot, config){
    //setup dice rolling object
    this.dice = new Dice();

    this.bot = bot

    //setup the list of command strings
    if ( typeof(config.command_str) === "string" ) {
        this.command_str = [config.command_str]
    } else if ( Object.prototype.toString.call( config.command_str ) === '[object Array]' ) {
        this.command_str = config.command_str
    } else {
        this.command_str =  ["!dice"]
    }
    
    //settup listeners
    bot.on('message', this.onMessage.bind(this))
}

DiceRoller.prototype.log = function(level, msg) {
    this.bot.log("dice_roller", level, msg)
}

DiceRoller.prototype.onMessage = function(message) {

    //if the message contains the right key words. Roll some dice!
    var text = message.body;
    console.log(this.command_str)
    for ( var command_str in this.command_str ) {
        command_str = this.command_str[command_str]
        console.log(command_str)
        console.log(command_str.length)
        console.log(text.substring(0, command_str.length))
        if (text.substring(0, command_str.length) == command_str) {
        
            //take out the command string and trim white space from either end.
            text = text.substring(command_str.length).trim()

            //parse the string then use the info to do calculations 
            var result = this.evaluateRollRequest(text);

            //Breakout return values so we 
            var roll_ops = result.roll_ops
              , dice_rolls = result.dice_rolls
              , final_result = result.final_result
              , note = result.note;

            //setup new message object to send the results
            var new_msg = message
            new_msg.body = "["+roll_ops.join('')+"] = ["
                         + dice_rolls.toString()+"] = "+final_result

            this.log("debug", "return message: " + new_msg.body);
        
            //if there was anything left after the regex's repeat it as a note
            if (note.length != 0) new_msg.body += " (Note:"+note+")";

            //send the message
            this.bot.emit("send message", new_msg);
        }   
    }

}

DiceRoller.prototype.onRoll = function(roll_request) {

}

DiceRoller.prototype.evaluateRollRequest = function(text) {
    //what needs to be done to text
    // * strip out any non dice format strings and drop it in the note var
    // * find text in dice format (d# or #d# or d#b# or #d#b#)
    // * find stand alone numbers
    // * if multiple dice formats + stand alone numbers, find operators between each
    // * roll dice formats and use operators to merge them
    // * 

    var no_match = false
      , _match = ""
      , roll_ops = []
      , regex_list = [ new RegExp(/^(([0-9]*d[0-9]+)(b[0-9]+)*)/i)   //dice notaion
                     , new RegExp(/^([0-9]+)/)          //stray numbers
                     , new RegExp(/^( *[\+\-\*\/] *)/)] //spaces and operators

    //try to match the message to things
    while (!no_match) {
        //find dice string
        var len = roll_ops.length //to check if we found a match

        for (var regex in regex_list) {
            regex = regex_list[regex]

            //check regex
            _match = text.match(regex);

            //if a match was found add it to the operations list
            if (_match && _match[0].length > 0) { 
                roll_ops.push(_match[0]);
                text = text.substring(_match[0].length)
            }
        }

        // end loop if there was no match
        if(len == roll_ops.length) no_match = true; 
    }

    //whatever is left will be considered a note
    var note = text.trim();
        
    //now that the messages has been broken down we can evaluate each part
    var dice_rolls = []
      , final_result = 0
      , math_op = null;
    
    for (var operation in roll_ops) {
        operation = roll_ops[operation]
            
        //handle a dice operation
        if (operation.match(regex_list[0])) {

            //do a dice roll
            var result = this.dice.roll(operation);
            dice_rolls.push(result.rolled);
            final_result += result.result;

        //handle a stray number operation
        } else if (operation.match(regex_list[1])) {
            if (math_op == null) math_op = "+";

            dice_rolls.push(math_op+operation.toString()); 
            operation = Number(operation)

            //apply operation to result
            switch (math_op) {
                case "+": final_result += operation; break;
                case "-": final_result -= operation; break;
                case "*": final_result *= operation; break;
                case "/": final_result /= operation; break;
                default: this.log("debug", "bad math operator"); break;
            }
                
            //reset stray number
            math_op = null;

        //handle a math symbol operation
        } else if (operation.match(regex_list[2])) {
            //set math operator
            math_op = operation.trim();
        }

    }

    this.log("debug", "Given Roll Operations: " + roll_ops.join().toString())
    this.log("debug", "Rolled Dice and modifiers: " + dice_rolls.toString())
    this.log("debug", "Roll Result: " + final_result)

    return {
        roll_ops: roll_ops
      , dice_rolls: dice_rolls
      , final_result: final_result
      , note: note
    }
}
