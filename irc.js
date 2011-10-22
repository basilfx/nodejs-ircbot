/**
 * @author BasilFX <basstottelaar [at] gmail [dot] com
 * @version 1.0
 *
 * Basic IRC client. Does not handle erros (yet)!
 *
 * Modified from https://github.com/halfhalo/Node.js-IRC and
 * https://gist.github.com/996827. 
 */

var net = require("net");
var irc = exports;

/**
 * Construct a new client with the given configuration.
 * 
 * Client does not connect (yet).
 */
var Client = irc.Client = function(config) {
    var self = this;
    var socket = new net.Socket();
    
    socket.setEncoding("ascii");
    socket.setNoDelay();

    this.config = config;
    this.socket = socket;
    this.buffer = "";
}

/**
 * Simple log function to output to console with color coding for 
 * the prefix, server, channels and our nickname.
 */
Client.prototype.log = function(prefix, data) { 
    data = data.replace(/(#\S+)/g, "\033[32;40;1m$1\033[0m"); // Channels
    data = data.replace(this.config.server, "\033[36;40;1m" + this.config.server + " \033[0m"); // Server
    data = data.replace(this.config.nick, "\033[31;40;1m" + this.config.nick + " \033[0m"); // Nickname
    
    console.log("\033[34;40;1m" + prefix + "\033[0m " + data); 
};

/**
 * Connect to the configured server and send user details
 */
Client.prototype.connect = function() {
    var self = this;
    
    self.socket.connect(this.config.port, this.config.server);

    self.socket.on("connect", function() {
        self.log("--", "Connected to " + self.config.server);
        
        self.send("NICK " + self.config.nick);
        self.send("USER " + self.config.user + " 8 * :" + self.config.real);
        
        self.onConnect();      
    });
    
    self.socket.on("data", function (data) { self.receive(data) });
}

/**
 * Send a IRC command to the server. 
 *
 * Newline is appended automatically
 */
Client.prototype.send = function(data) {
    this.log(">>", data);
    this.socket.write(data + "\n");
}

/**
 * Handle incoming commands.
 *
 * List of commands is only partially implemented!
 */
Client.prototype.handleData = function(match) {
	var parameters = match[3].match(/(.*?) ?:(.*)/) || null;
	var info = match[0].match(/^:(.+)!~(.+)@(.+)/) || null;
	
	switch (match[2]) {
		case "JOIN":
		    // Determine if we have joined, or someone else
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
		case "265":
		case "266":
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

/** 
 * Handle incoming data from the socket. 
 *
 * Buffers data if needed
 */
Client.prototype.receive = function(data) {
    this.buffer = this.buffer + data;

	while (this.buffer) {
	    var offset = this.buffer.indexOf("\n");	    
	    if (offset < 0) return;

		var message = this.buffer.substr(0, offset);
		this.buffer = this.buffer.substr(offset + 2);
		this.log("<<", message);
		
		var match = message.match(/(?:(:[^\s]+) )?([^\s]+) (.+)/);
		if (match) this.handleData(match);
	}
}

/**
 * Join a given channel
 */
Client.prototype.join = function(channel) {    
    this.send("JOIN " + channel);
}

/**
 * Send a message to a given channel or a user (instead of channel)
 */
Client.prototype.message = function(channel, message) {
    var maxLength = 500 - channel.length;
    var data = message.match(new RegExp(".{1," + maxLength + "}", "g"));
    
    for (var i = 0; i < data.length; i++)
        this.send("PRIVMSG " + channel + " :" + data[i]);
}

/**
 * Override please
 */
Client.prototype.onPing = function() {}
Client.prototype.onJoin = function(channel) {}
Client.prototype.onUserJoin = function(channel, nick) {}
Client.prototype.onMessage = function(channel, nick, message) {}
Client.prototype.onConnect = function() {}
Client.prototype.onWelcome = function() {}