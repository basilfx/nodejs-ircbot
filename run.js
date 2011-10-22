/**
 * @author BasilFX <basstottelaar [at] gmail [dot] com
 * @version 1.0
 *
 * Main IRC bot file
 */

var config = require("./config.js").config;
var irc = require("./irc.js");
var chat = require("./chat.js");

var irc = new irc.Client(config);
var bot = new chat.Bot("d689f7b8de347251");

/**
 * Executed when we have received the welcome message
 */
irc.onWelcome = function() {
    // Join a chanel
   irc.join("#vivat");
}

/**
 * Executed when we receive a message from a channel or user.
 *
 * You can conversate with a chatbot or execute a few commands to
 * demonstrate the IRC library.
 */
irc.onMessage = function(channel, nick, message) {
    // Ignore non channel messages
    if (channel.substr(0, 1) != "#") return;
    
    // Check for command first or conversation
    if (message.substr(0, 1) == "!") { // Command
        var matches = message.split(/[\s]+/);
        var data = matches.slice(1).join(" ");
        
        switch (matches[0].toLowerCase()) {
            case "!vivat":
                irc.message(channel, "Het Inter-/Actief/-periodiek heet I/O Vivat");
                break;
            case "!botid":
                if (data) bot = new chat.Bot(data);
                else irc.message(channel, bot.getBotId());
                break;
            case "!privmsg":
                if (data) irc.message(nick, data);
                break;
            case "!whoami":
                irc.message(channel, "Jij bent " + nick);
                break;
            case "!help":
                irc.message(channel, "Beschikbare commando's: !vivat, !botid <pandora botid>, !privmsg <tekst>, !whoami, !help");
                break;
        }   
    } else { // Conversation
        bot.say(message, function(response) {
            irc.message(channel, response);
        });
    }
}

// Connect!
irc.connect();