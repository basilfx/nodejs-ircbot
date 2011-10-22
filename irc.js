/**
 * @author BasilFX <basstottelaar [at] gmail [dot] com
 * @version 1.0
 *
 * Modified from https://github.com/halfhalo/Node.js-IRC and
 * https://gist.github.com/996827. 
 */

var net = require("net");
var irc = exports;

var log = function(prefix, data) { 
    console.log("\033[34;40;1m" + prefix + "\033[0m " + data); 
};

var Client = irc.Client = function(config) {
    var self = this;
    var socket = new net.Socket();
    
    socket.setEncoding("ascii");
    socket.setNoDelay();

    this.config = config;
    this.socket = socket;
    this.buffer = "";
}

Client.prototype.connect = function() {
    var self = this;
    
    self.socket.connect(this.config.port, this.config.server);

    self.socket.on("connect", function() {
        log("-", "Connected to " + self.config.server);
        
        self.send("NICK " + self.config.nick);
        self.send("USER " + self.config.user + " 8 * :" + self.config.real);
        
        self.onConnect();      
    });
    
    self.socket.on("data", function (data) { self.receive(data) });
}

Client.prototype.send = function(data) {
    log(">", data);
    this.socket.write(data + "\n");
}

Client.prototype.handleData = function(match) {
	var parameters = match[3].match(/(.*?) ?:(.*)/) || null;
	var info = match[0].match(/^:(.+)!~(.+)@(.+)/) || null;
	
	switch (match[2]) {
		case "JOIN":
		    if (info[1] == this.config.nick)
			    this.onJoin(parameters[2]);
			else
			    this.onUserJoin(parameters[2], info[1]);
			    
		    break;
		case "PART":
			//this.onPart(match, parameters);
		    break;
		case "QUIT":
			//this.onQuit(match, parameters);
		    break;
		case "PRIVMSG":
			this.onMessage(parameters[1], info[1], parameters[2]);
		    break;
		case "NOTICE":
			//this.onNotice(match, parameters);
		    break;
		case "353":
			//this.onUserList(match, parameters);
		    break;
		case "MODE":
			//this.onMode(match, parameters);
		    break;
		case "NICK":
			//this.onNick(match, parameters);
		    break;
		case "PING":
		    this.send("PONG " + parameters[2]);
			this.onPing();
		    break;
		case "333":
			//this.onChannelMaker(match, parameters);
		    break;
		case "001":
		    this.onWelcome()
		    break;
		case "002":
		case "003":
		case "250":
		case "251":
		case "255":
		//case "265":
		//case "266":
		case "303":
		case "315":
		case "332":
		case "366":
		case "372":
		case "375":
		case "376":
		    //this.onNumerical(match,params);
		    break;
		case "405":
		    //this.onTooManyChannels(match,params);
		    break;
		case "433":
		    //this.onNicknameInUse(match,params);
		    break;
		case "PONG":
		    break;
	}
}

Client.prototype.receive = function(data) {
    this.buffer = this.buffer + data;

	while (this.buffer) {
	    var offset = this.buffer.indexOf("\n");	    
	    if (offset < 0) return;

		var message = this.buffer.substr(0, offset);
		this.buffer = this.buffer.substr(offset + 2);
		log("<", message);
		
		var match = message.match(/(?:(:[^\s]+) )?([^\s]+) (.+)/);
		if (match) this.handleData(match);
	}
}

Client.prototype.join = function(channel) {    
    this.send("JOIN " + channel);
}

Client.prototype.message = function(channel, message) {
    var maxLength = 500 - channel.length;
    var data = message.match(new RegExp(".{1," + maxLength + "}", "g"));
    
    for (var i = 0; i < data.length; i++)
        this.send("PRIVMSG " + channel + " :" + data[i]);
}

Client.prototype.onPing = function() { }
Client.prototype.onJoin = function(channel) { }
Client.prototype.onUserJoin = function(channel, nick) { }
Client.prototype.onMessage = function(channel, nick, message) { }
Client.prototype.onConnect = function() { }
Client.prototype.onWelcome = function() { }