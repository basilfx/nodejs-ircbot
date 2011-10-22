var config = require("./config.js").config;
var irc = require("./irc.js");
var chat = require("./chat.js");

var irc = new irc.Client(config);
var bot = new chat.Bot("d689f7b8de347251");

irc.connect();

irc.onWelcome = function() {
    // Join een kanaal
   irc.join("#vivat");
}

irc.onMessage = function(channel, nick, message) {
    // Negeer niet-kanaalberichten
    if (channel.substr(0, 1) != "#") return;
    
    // Check of het een commando is, of juist niet.
    if (message.substr(0, 1) == "!") {
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
    } else {
        bot.say(message, function(response) {
            irc.message(channel, response);
        });
    }
}