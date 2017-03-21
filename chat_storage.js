/*jslint node: true */
"use strict";
var db = require('./db.js');

function store(correspondent_address, message, is_incoming, type) {
	var type = type || 'text';
	db.query("INSERT INTO chat_messages ('correspondent_address', 'message', 'is_incoming', 'type') VALUES (?, ?, ?, ?)", [correspondent_address, message, is_incoming, type]);
}

function load(correspondent_address, up_to_ts, limit, cb) {
	db.query("SELECT message, creation_date, is_incoming, type FROM chat_messages \n\
		WHERE correspondent_address=? AND creation_date < "+db.getFromUnixTime(up_to_ts)+" ORDER BY creation_date DESC LIMIT ?", [correspondent_address, limit], function(rows){
			for (var i in rows) {
				rows[i] = parseMessage(rows[i]);
			}
			cb(rows);			
		});
}

function purge(correspondent_address) {
	db.query("DELETE FROM chat_messages \n\
		WHERE correspondent_address=?", [correspondent_address]);
}

function parseMessage(message) {
	switch (message.type) {
		case "system":
			message.message = JSON.parse(message.message);
			message.message = "chat recording <b>" + (message.message.state ? "enabled" : "disabled") + "</b><span></span>";
			break;
	}
	return message;
}

exports.store = store;
exports.load = load;
exports.purge = purge;
exports.parseMessage = parseMessage;