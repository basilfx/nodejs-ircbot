var crypto = require('crypto');
var http = require('http');
var querystring = require('querystring');

var bot = exports;
var botUrl = "http:///";

var Bot = bot.Bot = function(botId) {
   this.botId = botId;
   this.customerId = crypto.createHash("md5").update(new Date().getTime() + "").digest("hex");
} 

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

Bot.prototype.getBotId = function() {
   return this.botId;
}