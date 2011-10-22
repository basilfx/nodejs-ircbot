/**
 * @author BasilFX <basstottelaar [at] gmail [dot] com
 * @version 1.0
 *
 * Interface for http://www.pandorabots.com. 
 *
 * Is Asynchronous!
 */

var crypto = require('crypto');
var http = require('http');
var querystring = require('querystring');

var bot = exports;

/**
 * Construct a new bot with a given botId. For a botId, check
 * http://www.pandorabots.com/botmaster/en/mostactive
 */
var Bot = bot.Bot = function(botId) {
   this.botId = botId;
   this.customerId = crypto.createHash("md5").update(new Date().getTime() + "").digest("hex");
} 

/**
 * Generate a response for a given input. Returns it to callback
 */
Bot.prototype.say = function(input, callback) {
    var self = this;
    var data = querystring.stringify({
        botid : this.botId,
        custid : this.customerId,
        input: input
    });

    var handleResponse = function(response) {
        if (response.statusCode != 200) return;
        
        response.on('data', function(data) {
            temp = data + "";
            match = temp.match(/<that>(.+)<\/that>/);
            if (match) callback(match[1]);
        });
    }
    
    var options = {
        host: "www.pandorabots.com",
        port: 80,
        path: "/pandora/talk-xml?" + data,
        method: "GET",
    }

    http.get(options, handleResponse);
}

/**
 * Return the current botId
 */
Bot.prototype.getBotId = function() {
   return this.botId;
}