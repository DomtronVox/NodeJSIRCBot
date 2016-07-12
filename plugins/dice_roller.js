var Dice = require("roll")
var diceroller

exports.Plugin = function(bot, config){
    diceroller_scope = new DiceRoller(bot, config);
}

DiceRoller = function(bot, config){
    //setup dice rolling object
    this.dice = new Dice();

    this.bot = bot
    this.command_str = config.command_str || "!dice"
    
    //settup listeners
    bot.on('message', this.onMessage.bind(this))
}

DiceRoller.prototype.onMessage = function(message) {

    //if the message contains the right key words. Roll some dice!
    var text = message.body;

    if (text.substring(0, this.command_str.length) == this.command_str) {
        //what needs to be done to text
        // * strip out any non dice format strings and drop it in the note var
        // * find text in dice format (d# or #d# or d#b# or #d#b#)
        // * find stand alone numbers
        // * if multiple dice formats + stand alone numbers, find operators between each
        // * roll dice formats and use operators to merge them
        // * 

        var text = text.substring(this.command_str.length).trim()
          , no_match = false
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
        
        var dice_rolls = []
          , final_result = 0
          , math_op = null;
        console.log("operations",  roll_ops)
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
                    default: bot.log("debug", "bad math operator"); break;
                }
                
                //reset stray number
                math_op = null;

            //handle a math symbol operation
            } else if (operation.match(regex_list[2])) {
                //set math operator
                math_op = operation.trim();
            }

        }


        console.log("Given Roll Operations", roll_ops.join())
        console.log("Rolled Dice and modifiers", dice_rolls.toString())
        console.log("Roll Result", final_result)

        //setup new message object to send the results
        var new_msg = message
        new_msg.body = "["+roll_ops.join('')+"] = ["+dice_rolls.toString()+"] = "+final_result

        console.log("message", new_msg.body)
        if (note.length != 0) new_msg.body += " (Note:"+note+")"

        this.bot.emit("send message", new_msg)
    }

}

DiceRoller.prototype.onRoll = function(roll_request) {

}

DiceRoller.prototype.roll = function(data) {
    if (typeof data == "string")
        this.dice.roll(data)
}
